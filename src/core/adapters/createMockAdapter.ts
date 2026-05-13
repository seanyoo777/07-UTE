import type { MarketId } from '../../markets/types'
import type { OrderAck, OrderRequest } from '../domain/order'
import type {
  OrderRecordRow,
  PositionRow,
  TickerRow,
  TradeFillRow,
} from '../domain/trading'
import type { SymbolSpec } from '../symbols/SymbolSpec'
import {
  advanceMockTick,
  buildMockOrderBook,
  createMockTickState,
  type MockTickOptions,
  type MockTickState,
} from '../engine/mockMarketDataEngine'
import { executeMockMatch } from '../engine/mockMatchingEngine'
import type {
  BrokerAdapter,
  MarketDataHandlers,
  TickerUpdate,
  Unsubscribe,
} from './BrokerAdapter'

export type MockAdapterConfig = {
  id: string
  marketId: MarketId
  displayName: string
  symbols: SymbolSpec[]
  tickIntervalMs?: number
  tick?: MockTickOptions
}

/**
 * 시장별 mock 어댑터 공장.
 *
 * - 모든 mock 어댑터는 동일한 createMockAdapter()로 만들어진다.
 * - 시장별 차이는 (symbols, tickIntervalMs, tick) 옵션으로 표현.
 * - 실거래 어댑터 도입 시에는 BrokerAdapter를 새로 구현 (이 파일 변경 없음).
 */
export function createMockAdapter(config: MockAdapterConfig): BrokerAdapter {
  const states = new Map<string, MockTickState>()
  for (const spec of config.symbols) {
    states.set(spec.symbol, createMockTickState(spec))
  }

  const subscriptions = new Map<string, Set<MarketDataHandlers>>()
  let connected = false
  let timer: ReturnType<typeof setInterval> | null = null

  const positions = new Map<string, PositionRow>()
  const orders: OrderRecordRow[] = []

  function startLoop(): void {
    if (timer) return
    const interval = config.tickIntervalMs ?? 800
    timer = setInterval(() => {
      for (const [symbol, handlers] of subscriptions.entries()) {
        if (handlers.size === 0) continue
        const state = states.get(symbol)
        if (!state) continue
        const next = advanceMockTick(state, config.tick)
        states.set(symbol, next)
        const book = buildMockOrderBook(next, config.tick)
        const update: TickerUpdate = {
          marketId: config.marketId,
          symbol,
          price: next.lastPrice,
          changePct: next.cumulativeChangePct,
          timestamp: Date.now(),
        }
        for (const h of handlers) {
          h.onTicker?.(update)
          h.onOrderBook?.(book)
        }
      }
    }, interval)
  }

  function stopLoop(): void {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  return {
    id: config.id,
    marketId: config.marketId,
    displayName: config.displayName,
    kind: 'mock',

    async connect() {
      connected = true
      startLoop()
    },

    async disconnect() {
      connected = false
      stopLoop()
      subscriptions.clear()
    },

    isConnected() {
      return connected
    },

    async listSymbols() {
      return [...config.symbols]
    },

    async getSymbolSpec(symbol) {
      return config.symbols.find((s) => s.symbol === symbol)
    },

    subscribe(symbol, handlers): Unsubscribe {
      const set = subscriptions.get(symbol) ?? new Set<MarketDataHandlers>()
      set.add(handlers)
      subscriptions.set(symbol, set)

      const state = states.get(symbol)
      if (state) {
        handlers.onOrderBook?.(buildMockOrderBook(state, config.tick))
        handlers.onTicker?.({
          marketId: config.marketId,
          symbol,
          price: state.lastPrice,
          changePct: state.cumulativeChangePct,
          timestamp: Date.now(),
        })
      }

      return () => {
        const cur = subscriptions.get(symbol)
        if (!cur) return
        cur.delete(handlers)
        if (cur.size === 0) subscriptions.delete(symbol)
      }
    },

    async placeOrder(req: OrderRequest): Promise<OrderAck> {
      const spec = config.symbols.find((s) => s.symbol === req.symbol)
      if (!spec) {
        return { ok: false, reason: `unknown symbol: ${req.symbol}`, code: 'UNKNOWN_SYMBOL' }
      }
      const state = states.get(req.symbol)
      const ref = state?.lastPrice ?? spec.referencePrice
      const result = executeMockMatch({
        marketId: config.marketId,
        spec,
        request: req,
        marketReferencePrice: ref,
        existingPosition: positions.get(req.symbol),
        now: Date.now(),
      })
      if (result.rejectedReason) {
        return { ok: false, reason: result.rejectedReason, code: 'REJECTED' }
      }
      orders.unshift(result.order)
      if (result.nextPosition) {
        positions.set(req.symbol, result.nextPosition)
      } else {
        positions.delete(req.symbol)
      }
      if (result.fill) {
        for (const handlers of subscriptions.get(req.symbol) ?? []) {
          handlers.onTrade?.(result.fill)
        }
      }
      return { ok: true, order: result.order }
    },

    async cancelOrder(orderId: string) {
      const idx = orders.findIndex((o) => o.id === orderId)
      if (idx === -1) return
      const cur = orders[idx]
      if (cur.status === 'filled' || cur.status === 'canceled') return
      orders[idx] = { ...cur, status: 'canceled' }
    },

    async getOpenOrders() {
      return orders.filter((o) => o.status === 'accepted' || o.status === 'submitting')
    },

    async getPositions() {
      return [...positions.values()]
    },
  }
}

/** 어댑터 초기 시드 티커 리스트 생성 (UI 부팅용) */
export function toInitialTickers(adapter: {
  marketId: MarketId
  symbols: SymbolSpec[]
}): TickerRow[] {
  return adapter.symbols.map((spec) => ({
    id: `${adapter.marketId}-${spec.symbol}`,
    marketId: adapter.marketId,
    symbol: spec.symbol,
    displayName: spec.displayName,
    price: spec.referencePrice,
    changePct: 0,
  }))
}

/** 헤드리스 헬퍼: 어댑터 단위 fill 합산 (테스트/디버그) */
export function sumFillRealized(fills: TradeFillRow[]): number {
  return fills.reduce((acc, f) => acc + (Number.isFinite(f.realizedPnl) ? f.realizedPnl : 0), 0)
}
