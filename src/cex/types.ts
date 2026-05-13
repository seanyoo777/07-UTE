import type { MarketId } from '../markets/types'

/**
 * 02 TGX-CEX `src/cex` export surface와 정렬되는 mock 타입.
 * 실 거래소 연결 없음.
 */

export type CexSelectedSymbol = {
  marketId: MarketId
  symbol: string
}

export type CexSymbolUniverseEntry = {
  marketId: MarketId
  symbol: string
  displayName: string
}

export type CexMarketDataFeedStatus = 'idle' | 'connecting' | 'streaming' | 'stale' | 'error'

export type CexPositionRow = {
  id: string
  symbol: string
  marketId: MarketId
  side: 'long' | 'short'
  qty: number
  avgPrice: number
}

export type CexOrderRow = {
  id: string
  symbol: string
  marketId: MarketId
  side: 'buy' | 'sell'
  status: string
  qty: number
}

export type CexPositionOrderSnapshot = {
  positions: readonly CexPositionRow[]
  orders: readonly CexOrderRow[]
}

export type CexTickerSnapshot = {
  symbol: string
  marketId: MarketId
  last: number
  changePct: number
  ts: number
}
