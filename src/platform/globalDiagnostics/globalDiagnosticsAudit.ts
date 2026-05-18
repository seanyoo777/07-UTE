import { useAdminAccessStore } from '../../admin/adminAccessStore'
import type { PlatformDiagnosticsScope } from '../platformScope'
import type { SelfTestVerdict } from '../../admin/selfTest/uteSelfTestTypes'

function scopeDetail(scope: PlatformDiagnosticsScope): string {
  return `platformId=${scope.platformId} tenantId=${scope.tenantId}`
}

export function logGlobalDiagnosticsView(scope: PlatformDiagnosticsScope, overall: string): void {
  useAdminAccessStore.getState().log({
    action: 'global_diagnostics_view',
    resource: 'GlobalDiagnosticsCenterPanel',
    result: 'ok',
    detail: `${scopeDetail(scope)} overall=${overall} mock cross-app`,
  })
}

export function logGlobalDiagnosticsSnapshot(
  scope: PlatformDiagnosticsScope,
  overall: SelfTestVerdict,
): void {
  useAdminAccessStore.getState().log({
    action: 'global_diagnostics_snapshot',
    resource: scope.scopeKey,
    result: 'ok',
    detail: `${scopeDetail(scope)} overall=${overall} aggregated mock`,
  })
}
