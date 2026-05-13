import { MARKETS } from '../markets/registry'
import type { MarketId } from '../markets/types'
import type {
  CexMarketDataFeedStatus,
  CexOrderRow,
  CexPositionOrderSnapshot,
  CexPositionRow,
  CexSelectedSymbol,
  CexSymbolUniverseEntry,
  CexTickerSnapshot,
} from './types'

/** 현재 선택 심볼 (mock — UTE 활성 시장과 맞추려면 외부에서 주입 확장) */
export const selectedSymbol: CexSelectedSymbol = {
  marketId: 'crypto',
  symbol: 'BTCUSDT',
}

function buildUniverse(): CexSymbolUniverseEntry[] {
  return MARKETS.map((m) => ({
    marketId: m.id,
    symbol: m.defaultSymbol,
    displayName: `${m.shortLabel}:${m.defaultSymbol}`,
  }))
}

/** TGX CEX 심볼 유니버스 (mock) */
export const symbolUniverse: readonly CexSymbolUniverseEntry[] = buildUniverse()

let mockFeedStatus: CexMarketDataFeedStatus = 'streaming'

export function getMarketDataFeedStatus(): CexMarketDataFeedStatus {
  return mockFeedStatus
}

/** 데모용 피드 상태 토글 (향후 실제 구독과 분리) */
export function setMockMarketDataFeedStatus(s: CexMarketDataFeedStatus): void {
  mockFeedStatus = s
}

const mockPositions: readonly CexPositionRow[] = [
  {
    id: 'cex-pos-1',
    symbol: 'BTCUSDT',
    marketId: 'crypto',
    side: 'long',
    qty: 0.02,
    avgPrice: 96_500,
  },
]

const mockOrders: readonly CexOrderRow[] = [
  {
    id: 'cex-ord-1',
    symbol: 'BTCUSDT',
    marketId: 'crypto',
    side: 'buy',
    status: 'accepted',
    qty: 0.01,
  },
]

export function getPositionOrderSnapshot(): CexPositionOrderSnapshot {
  return { positions: mockPositions, orders: mockOrders }
}

export function getTickerSnapshot(symbol: string, marketId: MarketId = selectedSymbol.marketId): CexTickerSnapshot {
  const seed = symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const last = 90_000 + (seed % 8000) + (Date.now() % 1000) / 1000
  return {
    symbol,
    marketId,
    last,
    changePct: ((seed % 50) - 25) / 10,
    ts: Date.now(),
  }
}
