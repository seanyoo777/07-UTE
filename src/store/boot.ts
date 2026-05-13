import { ADAPTERS } from '../adapters'
import { toInitialTickers } from '../core/adapters/createMockAdapter'
import type { OrderBookSnapshot } from '../core/domain/trading'
import { buildMockOrderBook, createMockTickState } from '../core/engine/mockMarketDataEngine'
import { MARKETS } from '../markets/registry'
import type { MarketId } from '../markets/types'
import type { MarketBoard } from './types'

function emptyOrderBook(symbol: string): OrderBookSnapshot {
  return { symbol, bids: [], asks: [] }
}

export function buildInitialBoards(): Record<MarketId, MarketBoard> {
  const boards = {} as Record<MarketId, MarketBoard>
  for (const def of MARKETS) {
    const adapter = ADAPTERS[def.id]
    // 어댑터 자체에서 비동기적으로 가져올 수도 있지만, mock은 동기 노출 가능.
    // listSymbols()는 Promise이므로 부팅 시점에는 빈 배열로 시작하고, useMarketSubscription에서 동기화.
    boards[def.id] = {
      marketId: def.id,
      status: 'idle',
      symbols: [],
      activeSymbol: def.defaultSymbol,
      lastPrice: 0,
      orderBook: emptyOrderBook(def.defaultSymbol),
      tickers: [],
      fills: [],
      orders: [],
      positions: [],
    }
    void adapter
  }
  return boards
}

/** 어댑터의 동기 노출 심볼 — listSymbols Promise 결과를 부팅에서 단발 호출. */
export async function seedBoardsFromAdapters(): Promise<
  Partial<Record<MarketId, Pick<MarketBoard, 'symbols' | 'tickers' | 'lastPrice' | 'orderBook' | 'activeSymbol'>>>
> {
  const result: Partial<
    Record<MarketId, Pick<MarketBoard, 'symbols' | 'tickers' | 'lastPrice' | 'orderBook' | 'activeSymbol'>>
  > = {}
  for (const def of MARKETS) {
    const adapter = ADAPTERS[def.id]
    const symbols = await adapter.listSymbols()
    const tickers = toInitialTickers({ marketId: def.id, symbols })
    const activeSymbol = symbols.find((s) => s.symbol === def.defaultSymbol)?.symbol
      ?? symbols[0]?.symbol
      ?? def.defaultSymbol
    const activeSpec = symbols.find((s) => s.symbol === activeSymbol)
    const lastPrice = activeSpec?.referencePrice ?? 0
    const book = activeSpec
      ? buildMockOrderBook(createMockTickState(activeSpec))
      : emptyOrderBook(activeSymbol)
    result[def.id] = {
      symbols,
      tickers,
      lastPrice,
      orderBook: book,
      activeSymbol,
    }
  }
  return result
}
