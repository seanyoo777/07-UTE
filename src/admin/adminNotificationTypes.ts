import type { AdminSystemHealthSnapshot } from './adminSystemHealth'
import { buildAdminRiskAlerts } from './buildAdminRiskAlerts'
import type { BridgeAdapterSnapshot, BridgeId } from '../bridges/shared/bridgeTypes'
import type { SecurityAdminStatusBundle } from '../bridges/shared/securityStatusTypes'
import type { UteIntegrationSnapshot } from '../bridges/shared/integrationSnapshots'

export type AdminNotificationSeverity = 'info' | 'warning' | 'critical'

export type AdminNotificationCategory =
  | 'bridge'
  | 'security'
  | 'market'
  | 'p2p'
  | 'strategy'
  | 'tournament'
  | 'system'

export type AdminNotificationItem = {
  id: string
  severity: AdminNotificationSeverity
  category: AdminNotificationCategory
  title: string
  body: string
  createdAt: number
  /** mock — 서버 영속 없음 */
  read: boolean
}

function mapRiskSeverity(s: 'info' | 'warn' | 'critical'): AdminNotificationSeverity {
  if (s === 'warn') return 'warning'
  return s
}

function mapRiskSourceToCategory(
  source: 'bridge' | 'security' | 'integration' | 'tetherget' | 'oneai',
): AdminNotificationCategory {
  if (source === 'tetherget') return 'p2p'
  if (source === 'oneai') return 'strategy'
  if (source === 'security') return 'security'
  if (source === 'bridge') return 'bridge'
  return 'system'
}

export type MockAdminNotificationInput = {
  snapshots: Record<BridgeId, BridgeAdapterSnapshot>
  securityAdmin: SecurityAdminStatusBundle
  integration: UteIntegrationSnapshot | null
  health: AdminSystemHealthSnapshot
}

export function buildMockAdminNotifications(input: MockAdminNotificationInput): AdminNotificationItem[] {
  const { snapshots, securityAdmin, integration, health } = input
  const risks = buildAdminRiskAlerts(snapshots, securityAdmin, integration)
  const fromRisk: AdminNotificationItem[] = risks.map((r) => ({
    id: `notif-risk-${r.id}`,
    severity: mapRiskSeverity(r.severity),
    category: mapRiskSourceToCategory(r.source),
    title: r.title,
    body: r.detail,
    createdAt: Date.now(),
    read: false,
  }))

  const fromHealth: AdminNotificationItem[] = []
  const pushHealth = (
    key: keyof Pick<
      AdminSystemHealthSnapshot,
      | 'bridgeHealth'
      | 'securityHealth'
      | 'marketDataHealth'
      | 'strategyHealth'
      | 'tournamentHealth'
      | 'p2pHealth'
    >,
    category: AdminNotificationCategory,
  ) => {
    const slice = health[key]
    if (slice.status === 'ok' || slice.status === 'unknown') return
    fromHealth.push({
      id: `notif-health-${key}`,
      severity: slice.status === 'critical' ? 'critical' : 'warning',
      category,
      title: `System health · ${key}`,
      body: slice.summary + (slice.detail ? ` — ${slice.detail}` : ''),
      createdAt: health.asOf,
      read: false,
    })
  }

  pushHealth('bridgeHealth', 'bridge')
  pushHealth('securityHealth', 'security')
  pushHealth('marketDataHealth', 'market')
  pushHealth('strategyHealth', 'strategy')
  pushHealth('tournamentHealth', 'tournament')
  pushHealth('p2pHealth', 'p2p')

  const systemInfo: AdminNotificationItem[] = [
    {
      id: 'notif-system-mock',
      severity: 'info',
      category: 'system',
      title: 'Notification Center (mock)',
      body: '실 푸시·실 알림 서버 없음. 스냅샷 기반 데모 목록입니다.',
      createdAt: Date.now(),
      read: false,
    },
  ]

  const merged = [...fromRisk, ...fromHealth, ...systemInfo]
  const severityOrder: Record<AdminNotificationSeverity, number> = { critical: 0, warning: 1, info: 2 }
  return merged.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
}
