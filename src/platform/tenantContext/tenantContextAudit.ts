import { useAdminAccessStore } from '../../admin/adminAccessStore'
import type { ScopeMismatchDiagnostic } from './tenantConfigValidationTypes'
import type { TenantConfigValidationSnapshot } from './tenantConfigValidationTypes'

export function logPlatformTenantValidationRead(snapshot: TenantConfigValidationSnapshot): void {
  useAdminAccessStore.getState().log({
    action: 'platform_tenant_validation_read',
    resource: snapshot.scopeKey,
    result: 'ok',
    detail: `source=${snapshot.source} overall=${snapshot.overall} validatedAt=${snapshot.validatedAt}`,
  })
}

export function logPlatformScopeMismatchDetected(diag: ScopeMismatchDiagnostic): void {
  useAdminAccessStore.getState().log({
    action: 'platform_scope_mismatch_detected',
    resource: diag.workspaceScopeKey,
    result: 'ok',
    detail: diag.message,
  })
}

export function logPlatformTenantBridgeView(scopeKey: string): void {
  useAdminAccessStore.getState().log({
    action: 'platform_tenant_bridge_view',
    resource: scopeKey,
    result: 'ok',
    detail: 'Tenant context bridge hydrate (mock)',
  })
}
