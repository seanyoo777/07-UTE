import type { StoreApi } from 'zustand'
import type { OrderAck, OrderRequest } from '../core/domain/order'
import type {
  OrderBookSnapshot,
  OrderRecordRow,
  PositionRow,
  TickerRow,
  TradeFillRow,
} from '../core/domain/trading'
import type { SymbolSpec } from '../core/symbols/SymbolSpec'
import type { MarketId } from '../markets/types'

export type AdapterStatus = 'idle' | 'connecting' | 'ready' | 'error'

/** 시장(어댑터)별 격리된 보드 상태 */
export type MarketBoard = {
  marketId: MarketId
  status: AdapterStatus
  errorMessage?: string
  /** 어댑터가 노출하는 심볼 목록 */
  symbols: SymbolSpec[]
  /** 현재 선택된 심볼 (없으면 marketDef.defaultSymbol) */
  activeSymbol: string
  lastPrice: number
  orderBook: OrderBookSnapshot
  tickers: TickerRow[]
  /** 시장 내 체결 내역 (직전 200건) */
  fills: TradeFillRow[]
  /** 시장 내 주문 (직전 200건) */
  orders: OrderRecordRow[]
  /** 시장 내 단일 넷 포지션 (심볼별 1개) */
  positions: PositionRow[]
}

export type TradingStoreState = {
  activeMarketId: MarketId
  boards: Record<MarketId, MarketBoard>
}

export type TradingStoreActions = {
  setActiveMarket: (id: MarketId) => void
  setActiveSymbol: (id: MarketId, symbol: string) => void
  setAdapterStatus: (id: MarketId, status: AdapterStatus, errorMessage?: string) => void
  setBoardSymbols: (id: MarketId, symbols: SymbolSpec[]) => void

  applyTickerPatch: (
    id: MarketId,
    symbol: string,
    patch: { price: number; changePct: number },
  ) => void
  applyOrderBook: (id: MarketId, book: OrderBookSnapshot) => void
  pushFill: (id: MarketId, row: TradeFillRow) => void
  upsertOrder: (id: MarketId, row: OrderRecordRow) => void
  setPositions: (id: MarketId, rows: PositionRow[]) => void
  cancelOrderLocal: (id: MarketId, orderId: string) => void

  /**
   * 어댑터를 통해 주문 — UI는 이 메서드만 호출.
   * 라이브 어댑터 도입 후에도 시그니처 동일.
   */
  submitOrder: (id: MarketId, req: OrderRequest) => Promise<OrderAck>
}

export type TradingStore = TradingStoreState & TradingStoreActions

export type TradingStoreApi = StoreApi<TradingStore>
