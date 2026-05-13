import type { MarketId } from '../../markets/types'

export type OrderSide = 'buy' | 'sell'

export type OrderLevel = {
  price: number
  quantity: number
}

export type OrderBookSnapshot = {
  symbol: string
  bids: OrderLevel[]
  asks: OrderLevel[]
  /** epoch ms — 어댑터에서 부여, 표시·동시성 디버그용 */
  timestamp?: number
}

export type PositionSide = 'long' | 'short'

export type PositionRow = {
  id: string
  marketId: MarketId
  symbol: string
  side: PositionSide
  size: number
  avgPrice: number
  unrealizedPnl: number
  realizedPnl: number
  returnPct: number
}

export type TradeFillRow = {
  id: string
  marketId: MarketId
  symbol: string
  side: OrderSide
  price: number
  quantity: number
  fee: number
  realizedPnl: number
  time: string
  timestamp: number
}

export type PersistedOrderStatus =
  | 'submitting'
  | 'accepted'
  | 'filled'
  | 'partial'
  | 'canceled'
  | 'rejected'

export type OrderRecordRow = {
  id: string
  marketId: MarketId
  symbol: string
  side: OrderSide
  type: 'market' | 'limit'
  price: number | null
  quantity: number
  filledQuantity: number
  status: PersistedOrderStatus
  time: string
  timestamp: number
}

export type TickerRow = {
  id: string
  marketId: MarketId
  symbol: string
  displayName: string
  price: number
  changePct: number
  /** 24h 거래대금 (선택) — 표시용 */
  turnover?: number
}

export type HistoryTab = 'fills' | 'orders' | 'cancelled'
