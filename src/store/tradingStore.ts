import { create } from 'zustand'
import { ADAPTERS } from '../adapters'
import type { OrderAck, OrderRequest } from '../core/domain/order'
import type { PositionRow, TickerRow } from '../core/domain/trading'
import type { MarketId } from '../markets/types'
import { buildInitialBoards } from './boot'
import type { AdapterStatus, MarketBoard, TradingStore } from './types'

function patchBoard(
  boards: Record<MarketId, MarketBoard>,
  id: MarketId,
  patch: Partial<MarketBoard>,
): Record<MarketId, MarketBoard> {
  return {
    ...boards,
    [id]: { ...boards[id], ...patch },
  }
}

function bumpTicker(tickers: TickerRow[], symbol: string, price: number, changePct: number): TickerRow[] {
  let found = false
  const next = tickers.map((t) => {
    if (t.symbol !== symbol) return t
    found = true
    return { ...t, price, changePct }
  })
  if (!found) return tickers
  return next
}

export const useTradingStore = create<TradingStore>()((set, get) => ({
  activeMarketId: 'crypto',
  boards: buildInitialBoards(),

  setActiveMarket: (id) => set({ activeMarketId: id }),

  setActiveSymbol: (id, symbol) =>
    set((s) => patchBoardState(s, id, (b) => ({ activeSymbol: symbol, lastPrice: lookupRef(b, symbol) }))),

  setAdapterStatus: (id, status: AdapterStatus, errorMessage) =>
    set((s) => patchBoardState(s, id, () => ({ status, errorMessage }))),

  setBoardSymbols: (id, symbols) =>
    set((s) =>
      patchBoardState(s, id, (board) => {
        const tickers = symbols.map((sp) => ({
          id: `${id}-${sp.symbol}`,
          marketId: id,
          symbol: sp.symbol,
          displayName: sp.displayName,
          price: sp.referencePrice,
          changePct: 0,
        }))
        const activeSymbol = symbols.find((sp) => sp.symbol === board.activeSymbol)?.symbol
          ?? symbols[0]?.symbol
          ?? board.activeSymbol
        const activeSpec = symbols.find((sp) => sp.symbol === activeSymbol)
        return {
          symbols,
          tickers,
          activeSymbol,
          lastPrice: activeSpec?.referencePrice ?? board.lastPrice,
        }
      }),
    ),

  applyTickerPatch: (id, symbol, patch) =>
    set((s) =>
      patchBoardState(s, id, (board) => {
        const tickers = bumpTicker(board.tickers, symbol, patch.price, patch.changePct)
        const lastPrice = symbol === board.activeSymbol ? patch.price : board.lastPrice
        const positions = revaluePositions(board.positions, tickers, board.activeSymbol, lastPrice)
        return { tickers, lastPrice, positions }
      }),
    ),

  applyOrderBook: (id, book) =>
    set((s) =>
      patchBoardState(s, id, (board) =>
        book.symbol === board.activeSymbol ? { orderBook: book } : {},
      ),
    ),

  pushFill: (id, row) =>
    set((s) =>
      patchBoardState(s, id, (board) => ({
        fills: [row, ...board.fills].slice(0, 200),
      })),
    ),

  upsertOrder: (id, row) =>
    set((s) =>
      patchBoardState(s, id, (board) => {
        const idx = board.orders.findIndex((o) => o.id === row.id)
        if (idx === -1) return { orders: [row, ...board.orders].slice(0, 200) }
        const orders = [...board.orders]
        orders[idx] = row
        return { orders }
      }),
    ),

  setPositions: (id, rows) =>
    set((s) => patchBoardState(s, id, () => ({ positions: rows }))),

  cancelOrderLocal: (id, orderId) =>
    set((s) =>
      patchBoardState(s, id, (board) => ({
        orders: board.orders.map((o) =>
          o.id === orderId ? { ...o, status: 'canceled' as const } : o,
        ),
      })),
    ),

  submitOrder: async (id, req: OrderRequest): Promise<OrderAck> => {
    const adapter = ADAPTERS[id]
    if (!adapter) {
      return { ok: false, reason: `adapter not found for ${id}`, code: 'NO_ADAPTER' }
    }
    const ack = await adapter.placeOrder(req)
    if (ack.ok) {
      get().upsertOrder(id, ack.order)
      const positions = await adapter.getPositions()
      get().setPositions(id, positions)
    }
    return ack
  },
}))

function patchBoardState(
  s: TradingStore,
  id: MarketId,
  computePatch: (board: MarketBoard) => Partial<MarketBoard>,
): Partial<TradingStore> {
  const board = s.boards[id]
  if (!board) return {}
  const next = computePatch(board)
  if (Object.keys(next).length === 0) return {}
  return { boards: patchBoard(s.boards, id, next) }
}

function lookupRef(board: MarketBoard, symbol: string): number {
  const spec = board.symbols.find((sp) => sp.symbol === symbol)
  if (spec) return spec.referencePrice
  const t = board.tickers.find((row) => row.symbol === symbol)
  return t?.price ?? board.lastPrice
}

function revaluePositions(
  positions: PositionRow[],
  tickers: TickerRow[],
  activeSymbol: string,
  activeLastPrice: number,
): PositionRow[] {
  return positions.map((p) => {
    const t = tickers.find((x) => x.symbol === p.symbol)
    const mark =
      (Number.isFinite(t?.price) ? t!.price : undefined) ??
      (p.symbol === activeSymbol && Number.isFinite(activeLastPrice) ? activeLastPrice : undefined) ??
      p.avgPrice
    const unreal =
      p.side === 'long' ? (mark - p.avgPrice) * p.size : (p.avgPrice - mark) * p.size
    const margin = mark * p.size
    const returnPct = margin > 0 ? (unreal / margin) * 100 : 0
    return { ...p, unrealizedPnl: unreal, returnPct }
  })
}

/** 활성 보드 셀렉터 */
export function selectActiveBoard(s: TradingStore): MarketBoard {
  return s.boards[s.activeMarketId]
}
