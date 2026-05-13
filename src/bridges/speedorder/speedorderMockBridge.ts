/**
 * SpeedOrder Bridge — mock only.
 * `src/vendor` export surface를 읽어 BRG·프로브에 반영합니다.
 */

import type { MarketId } from '../../markets/types'
import type { BridgeProbeResult } from '../shared/bridgeTypes'
import {
  ORDER_EXECUTION_POLICY,
  readSpeedOrderVendorSerializableSnapshot,
  SPEED_ORDER_ENGINE_STATUS,
  speedOrderSymbolRegistry,
} from '../../vendor'
import type { SpeedOrderEngineStatusValue } from '../../vendor'

export type SpeedorderEngineState = SpeedOrderEngineStatusValue

export function speedorderMockEngineState(): SpeedorderEngineState {
  return SPEED_ORDER_ENGINE_STATUS
}

export function speedorderMockRegistrySymbols(): { marketId: MarketId; symbol: string }[] {
  return speedOrderSymbolRegistry.map((r) => ({ marketId: r.marketId, symbol: r.symbol }))
}

export function speedorderMockMarketSyncSummary(): string {
  return readSpeedOrderVendorSerializableSnapshot().marketSyncLine
}

export async function probeSpeedorderMockBridge(): Promise<BridgeProbeResult> {
  void speedorderMockEngineState()
  void speedorderMockRegistrySymbols()
  const snap = readSpeedOrderVendorSerializableSnapshot()
  return {
    capabilitiesSummary: `vendor · engine ${snap.engine} · registry ${snap.registryCount} · sync ${snap.marketSyncState} · ${ORDER_EXECUTION_POLICY}`,
    speedorderPanel: {
      engineStatus: snap.engine,
      registryCount: snap.registryCount,
      marketSyncLine: snap.marketSyncLine,
      marketSyncState: snap.marketSyncState,
      executionPolicy: snap.executionPolicy,
    },
  }
}
