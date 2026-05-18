import { useEffect, useMemo } from 'react'
import { useAdminAccessStore } from '../admin/adminAccessStore'
import { useBridgeDashboardStore } from '../bridges'
import { buildMockUnifiedEvents } from './buildMockUnifiedEvents'
import { usePlatformDiagnosticsScope } from './usePlatformDiagnosticsScope'
import { usePlatformMockNotificationFeed } from './usePlatformMockNotificationFeed'
import { usePlatformDiagnosticsStore } from './platformDiagnosticsStore'
import { useUnifiedEventStore } from './unifiedEventStore'
import { summarizeUnifiedEvents } from './summarizeUnifiedEvents'
import { useTenantContextBridge } from './tenantContext/useTenantContextBridge'

export function usePlatformUnifiedEventFeed() {
  const scope = usePlatformDiagnosticsScope()
  const hydrate = useUnifiedEventStore((s) => s.hydrate)
  const ingest = useUnifiedEventStore((s) => s.ingestCandidates)
  const events = useUnifiedEventStore((s) => s.events)
  const snapshots = useBridgeDashboardStore((s) => s.snapshots)
  const { health } = usePlatformMockNotificationFeed()
  const latestDiagnostics = usePlatformDiagnosticsStore(
    (s) => s.byScope[scope.scopeKey]?.[0] ?? null,
  )
  const auditTailAction = useAdminAccessStore((s) => s.auditLog[0]?.action)
  const { enabled: tenantBridgeOn, snapshot: tenantValidation, scopeMismatch } =
    useTenantContextBridge()

  useEffect(() => {
    hydrate(scope.scopeKey)
  }, [hydrate, scope.scopeKey])

  useEffect(() => {
    const candidates = buildMockUnifiedEvents({
      scope,
      snapshots,
      health,
      latestDiagnostics,
      auditTailAction,
      tenantValidation: tenantBridgeOn ? tenantValidation : null,
      scopeMismatch: tenantBridgeOn ? scopeMismatch : null,
    })
    ingest(candidates)
  }, [
    scope,
    snapshots,
    health,
    latestDiagnostics,
    auditTailAction,
    tenantBridgeOn,
    tenantValidation,
    scopeMismatch,
    ingest,
  ])

  const summary = useMemo(() => summarizeUnifiedEvents(events), [events])

  return { events, summary, scope }
}
