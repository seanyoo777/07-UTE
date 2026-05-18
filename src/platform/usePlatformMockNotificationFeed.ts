import { useMemo } from 'react'
import { BRIDGE_ORDER } from '../bridges/shared/bridgeTypes'
import { useBridgeDashboardStore } from '../bridges'
import { buildPlatformMockNotificationFeed } from './buildPlatformMockNotificationFeed'

export function usePlatformMockNotificationFeed() {
  const snapshots = useBridgeDashboardStore((s) => s.snapshots)
  const securityAdmin = useBridgeDashboardStore((s) => s.securityAdmin)
  const uteIntegration = useBridgeDashboardStore((s) => s.uteIntegration)
  const lastProbeRunAt = useBridgeDashboardStore((s) => s.lastProbeRunAt)

  const latestBridgeUpdatedAt = useMemo(
    () => Math.max(...BRIDGE_ORDER.map((id) => snapshots[id].updatedAt)),
    [snapshots],
  )

  const healthAsOf = lastProbeRunAt ?? uteIntegration?.asOf ?? latestBridgeUpdatedAt

  return useMemo(
    () =>
      buildPlatformMockNotificationFeed({
        snapshots,
        securityAdmin,
        uteIntegration,
        lastProbeRunAt,
        healthAsOf,
      }),
    [snapshots, securityAdmin, uteIntegration, lastProbeRunAt, healthAsOf],
  )
}
