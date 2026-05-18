import { useMemo } from 'react'
import { buildPlatformDiagnosticsScope } from './platformScope'
import { usePlatformTenantStore } from './platformTenantStore'

export function usePlatformDiagnosticsScope() {
  const tenantId = usePlatformTenantStore((s) => s.tenant.id)
  return useMemo(() => buildPlatformDiagnosticsScope(tenantId), [tenantId])
}
