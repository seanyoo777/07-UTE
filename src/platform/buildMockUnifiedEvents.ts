import type { SelfTestVerdict } from '../admin/selfTest/uteSelfTestTypes'
import type { AdminSystemHealthSnapshot } from '../admin/adminSystemHealth'
import type { BridgeAdapterSnapshot, BridgeId } from '../bridges/shared/bridgeTypes'
import type { PlatformDiagnosticsSnapshot } from './platformDiagnosticsTypes'
import type { PlatformDiagnosticsScope } from './platformScope'
import type { UnifiedEvent, UnifiedEventSeverity } from './unifiedEventTypes'
import type { ScopeMismatchDiagnostic, TenantConfigValidationSnapshot } from './tenantContext/tenantConfigValidationTypes'
import { buildTenantValidationUnifiedEvent } from './tenantContext/buildTenantValidationUnifiedEvent'

export type BuildMockUnifiedEventsInput = {
  scope: PlatformDiagnosticsScope
  snapshots: Record<BridgeId, BridgeAdapterSnapshot>
  health: AdminSystemHealthSnapshot
  latestDiagnostics?: PlatformDiagnosticsSnapshot | null
  auditTailAction?: string
  tenantValidation?: TenantConfigValidationSnapshot | null
  scopeMismatch?: ScopeMismatchDiagnostic | null
}

function verdictToSeverity(v: SelfTestVerdict): UnifiedEventSeverity {
  if (v === 'FAIL') return 'critical'
  if (v === 'WARN') return 'warning'
  return 'info'
}

function healthToSeverity(status: string): UnifiedEventSeverity {
  if (status === 'critical') return 'critical'
  if (status === 'degraded') return 'warning'
  return 'info'
}

export function buildMockUnifiedEvents(input: BuildMockUnifiedEventsInput): UnifiedEvent[] {
  const { scope, snapshots, health, latestDiagnostics, auditTailAction, tenantValidation, scopeMismatch } =
    input
  const at = Date.now()
  const events: UnifiedEvent[] = []

  const oneai = snapshots.oneai.oneaiPanel
  if (oneai) {
    const sev: UnifiedEventSeverity =
      oneai.riskLevel === 'high' ? 'warning' : oneai.recentSignalCount > 0 ? 'info' : 'info'
    events.push({
      id: `ue-oneai-${oneai.strategyCount}-${oneai.riskLevel}`,
      source: 'oneai',
      severity: sev,
      title: `OneAI · ${oneai.strategyCount} strategies`,
      body: `${oneai.recentSignalCount} sig/24h · ${oneai.riskLevel} risk · ${oneai.aggregateWinrate}`,
      at,
      mockOnly: true,
      scopeKey: scope.scopeKey,
    })
  }

  const tg = snapshots.tetherget.tethergetPanel
  if (tg) {
    const sev: UnifiedEventSeverity =
      tg.escrowLockedCount > 0 ? 'warning' : tg.fallbackState === 'error' ? 'critical' : 'info'
    events.push({
      id: `ue-escrow-${tg.escrowLockedCount}-${tg.disputeCount}`,
      source: 'escrow',
      severity: sev,
      title: `Escrow · ${tg.escrowLockedCount} locked`,
      body: tg.summaryLine,
      at,
      mockOnly: true,
      scopeKey: scope.scopeKey,
    })
  }

  if (latestDiagnostics) {
    events.push({
      id: `ue-diag-${latestDiagnostics.id}`,
      source: 'diagnostics',
      severity: verdictToSeverity(latestDiagnostics.overall),
      title: `Self-test ${latestDiagnostics.overall}`,
      body: `P${latestDiagnostics.issueCount.pass} W${latestDiagnostics.issueCount.warn} F${latestDiagnostics.issueCount.fail}`,
      at: latestDiagnostics.asOf,
      mockOnly: true,
      scopeKey: scope.scopeKey,
      diagnosticsSnapshotId: latestDiagnostics.id,
    })
  }

  events.push({
    id: `ue-streamhub-${health.asOf}`,
    source: 'streamhub',
    severity: health.marketDataHealth.status === 'critical' ? 'critical' : 'info',
    title: 'StreamHub (mock lane)',
    body: `MD ${health.marketDataHealth.summary} · no WebSocket`,
    at,
    mockOnly: true,
    scopeKey: scope.scopeKey,
  })

  const bridgeSev = healthToSeverity(health.bridgeHealth.status)
  events.push({
    id: `ue-admin-bridge-${health.bridgeHealth.status}`,
    source: 'admin',
    severity: bridgeSev,
    title: 'Admin health · bridges',
    body: health.bridgeHealth.summary,
    at: health.asOf,
    mockOnly: true,
    scopeKey: scope.scopeKey,
  })

  if (tenantValidation) {
    events.push(buildTenantValidationUnifiedEvent(tenantValidation, scopeMismatch ?? null))
  }

  if (auditTailAction) {
    events.push({
      id: `ue-admin-audit-${auditTailAction}`,
      source: 'admin',
      severity: 'info',
      title: 'Audit trail',
      body: `Last action: ${auditTailAction} (append-only mock)`,
      at,
      mockOnly: true,
      scopeKey: scope.scopeKey,
    })
  }

  return events
}

export function buildDiagnosticsUnifiedEvent(
  scope: PlatformDiagnosticsScope,
  snap: PlatformDiagnosticsSnapshot,
): UnifiedEvent {
  const sev = snap.overall === 'FAIL' ? 'critical' : snap.overall === 'WARN' ? 'warning' : 'info'
  return {
    id: `ue-diag-${snap.id}`,
    source: 'diagnostics',
    severity: sev,
    title: `Self-test ${snap.overall}`,
    body: `P${snap.issueCount.pass} W${snap.issueCount.warn} F${snap.issueCount.fail} · ${scope.scopeKey}`,
    at: snap.asOf,
    mockOnly: true,
    scopeKey: scope.scopeKey,
    diagnosticsSnapshotId: snap.id,
  }
}
