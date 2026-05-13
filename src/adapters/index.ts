import type { BrokerAdapter } from '../core/adapters/BrokerAdapter'
import type { MarketId } from '../markets/types'
import { cryptoMockAdapter } from './crypto'
import { globalFuturesMockAdapter } from './globalFutures'
import { krFuturesMockAdapter } from './krFutures'
import { krStockMockAdapter } from './krStock'
import { usStockMockAdapter } from './usStock'

/**
 * 시장 → 어댑터 매핑.
 *
 * 실거래 어댑터 도입 시 이 맵의 값만 교체.
 * 예) 'crypto': isLive ? createBinanceAdapter() : cryptoMockAdapter
 */
export const ADAPTERS: Record<MarketId, BrokerAdapter> = {
  'kr-stock': krStockMockAdapter,
  'us-stock': usStockMockAdapter,
  'kr-futures': krFuturesMockAdapter,
  'global-futures': globalFuturesMockAdapter,
  crypto: cryptoMockAdapter,
}

export function getAdapter(marketId: MarketId): BrokerAdapter {
  return ADAPTERS[marketId]
}
