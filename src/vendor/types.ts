import type { MarketId } from '../markets/types'

/**
 * 05 SpeedOrder `src/vendor` export surface와 정렬되는 mock 타입.
 * 실 주문 실행 없음.
 */

export type SpeedOrderEngineStatusValue = 'idle' | 'warming' | 'ready' | 'paused' | 'error'

export type SpeedOrderRegistryRow = {
  marketId: MarketId
  symbol: string
  /** mock provenance */
  source: 'vendor_mock'
}

export const ORDER_EXECUTION_POLICY = 'mock_demo_no_live_execution' as const

export type SpeedOrderVendorSerializableSnapshot = {
  engine: SpeedOrderEngineStatusValue
  registryCount: number
  executionPolicy: typeof ORDER_EXECUTION_POLICY
  /** MARKETS 기반 sync 요약 */
  marketSyncLine: string
  /** 간단 해시 대용 (mock) */
  marketSyncState: 'synced_mock' | 'drift_mock' | 'unknown_mock'
  asOf: number
}
