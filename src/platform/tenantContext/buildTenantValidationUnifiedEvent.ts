import type { UnifiedEvent, UnifiedEventSeverity } from '../unifiedEventTypes'
import type { ScopeMismatchDiagnostic, TenantConfigValidationSnapshot } from './tenantConfigValidationTypes'

function verdictToSeverity(v: TenantConfigValidationSnapshot['overall']): UnifiedEventSeverity {
  if (v === 'FAIL') return 'critical'
  if (v === 'WARN') return 'warning'
  return 'info'
}

export function buildTenantValidationUnifiedEvent(
  snapshot: TenantConfigValidationSnapshot,
  scopeMismatch: ScopeMismatchDiagnostic | null,
): UnifiedEvent {
  const severity =
    scopeMismatch != null ? 'critical' : verdictToSeverity(snapshot.overall)
  const body = scopeMismatch
    ? scopeMismatch.message
    : `12-TGX-TokenAdmin · ${snapshot.checks.length} checks · ${snapshot.scopeKey}`

  return {
    id: `ue-tenant-val-${snapshot.validatedAt}`,
    source: 'tenant',
    severity,
    title: `Tenant validation ${snapshot.overall}`,
    body,
    at: snapshot.validatedAt,
    mockOnly: true,
    scopeKey: snapshot.scopeKey,
  }
}
