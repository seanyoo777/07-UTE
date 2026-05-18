import { BRIDGE_ORDER } from '../bridges/shared/bridgeTypes'
import type { BridgeAdapterSnapshot, BridgeId } from '../bridges/shared/bridgeTypes'

export function countBridgeDashboardErrors(
  snapshots: Record<BridgeId, BridgeAdapterSnapshot>,
): number {
  let errors = 0
  for (const id of BRIDGE_ORDER) {
    if (snapshots[id].dashboardStatus === 'error') errors++
  }
  return errors
}
