import { MARKETS } from '../markets/registry'
import type { SpeedOrderEngineStatusValue, SpeedOrderRegistryRow, SpeedOrderVendorSerializableSnapshot } from './types'
import { ORDER_EXECUTION_POLICY } from './types'

/** 05 SpeedOrder 엔진 상태 (mock 상수 — 향후 스트림으로 교체) */
export const SPEED_ORDER_ENGINE_STATUS: SpeedOrderEngineStatusValue = 'ready'

const rows: SpeedOrderRegistryRow[] = MARKETS.map((m) => ({
  marketId: m.id,
  symbol: m.defaultSymbol,
  source: 'vendor_mock',
}))

/** SpeedOrder 심볼 레지스트리 (mock) */
export const speedOrderSymbolRegistry: readonly SpeedOrderRegistryRow[] = rows

export function readSpeedOrderVendorSerializableSnapshot(): SpeedOrderVendorSerializableSnapshot {
  const marketSyncLine = MARKETS.map((m) => `${m.id}:${m.defaultSymbol}`).join('|')
  return {
    engine: SPEED_ORDER_ENGINE_STATUS,
    registryCount: speedOrderSymbolRegistry.length,
    executionPolicy: ORDER_EXECUTION_POLICY,
    marketSyncLine,
    marketSyncState: 'synced_mock',
    asOf: Date.now(),
  }
}
