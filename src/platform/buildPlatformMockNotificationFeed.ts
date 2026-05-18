import { buildMockAdminNotifications } from '../admin/adminNotificationTypes'
import { buildAdminSystemHealthSnapshot } from '../admin/adminSystemHealth'
import type { BridgeAdapterSnapshot, BridgeId } from '../bridges/shared/bridgeTypes'
import type { SecurityAdminStatusBundle } from '../bridges/shared/securityStatusTypes'
import type { UteIntegrationSnapshot } from '../bridges/shared/integrationSnapshots'
import { summarizePlatformNotifications } from './summarizePlatformNotifications'

export type PlatformMockNotificationFeedInput = {
  snapshots: Record<BridgeId, BridgeAdapterSnapshot>
  securityAdmin: SecurityAdminStatusBundle
  uteIntegration: UteIntegrationSnapshot | null
  lastProbeRunAt: number | null
  healthAsOf: number
}

export function buildPlatformMockNotificationFeed(input: PlatformMockNotificationFeedInput) {
  const health = buildAdminSystemHealthSnapshot({
    snapshots: input.snapshots,
    securityAdmin: input.securityAdmin,
    integration: input.uteIntegration,
    lastProbeRunAt: input.lastProbeRunAt,
    asOf: input.healthAsOf,
  })
  const items = buildMockAdminNotifications({
    snapshots: input.snapshots,
    securityAdmin: input.securityAdmin,
    integration: input.uteIntegration,
    health,
  })
  return { items, summary: summarizePlatformNotifications(items), health }
}
