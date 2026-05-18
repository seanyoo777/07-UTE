import { buildPlatformDiagnosticsScope } from '../platformScope'
import type {
  TenantConfigValidationCheck,
  TenantConfigValidationSnapshot,
  TenantConfigValidationVerdict,
} from './tenantConfigValidationTypes'
import {
  TENANT_CONFIG_VALIDATION_SCHEMA_VERSION,
  TOKEN_ADMIN_PRODUCT_ID,
} from './tenantConfigValidationTypes'

export type RunMockTenantConfigValidationInput = {
  tenantId: string
  companyId: string
  platformId: string
  workspaceScopeKey: string
  /** Simulated 12-TGX-TokenAdmin override (env/tests). */
  forcedOverall?: TenantConfigValidationVerdict
}

function push(checks: TenantConfigValidationCheck[], check: TenantConfigValidationCheck): void {
  checks.push(check)
}

function deriveOverall(checks: TenantConfigValidationCheck[]): TenantConfigValidationVerdict {
  if (checks.some((c) => c.verdict === 'FAIL')) return 'FAIL'
  if (checks.some((c) => c.verdict === 'WARN')) return 'WARN'
  return 'PASS'
}

/**
 * Mock Tenant Config Validation — no HTTP/DB (12-TGX-TokenAdmin read-only contract).
 */
export function runMockTenantConfigValidation(
  input: RunMockTenantConfigValidationInput,
): TenantConfigValidationSnapshot {
  const checks: TenantConfigValidationCheck[] = []
  const expectedScope = buildPlatformDiagnosticsScope(input.tenantId, input.platformId)

  push(checks, {
    id: 'tenant-id',
    label: 'Tenant id present',
    verdict: input.tenantId.trim() ? 'PASS' : 'FAIL',
    detail: input.tenantId || 'missing',
  })

  push(checks, {
    id: 'company-id',
    label: 'Company id present',
    verdict: input.companyId.trim() ? 'PASS' : 'FAIL',
    detail: input.companyId || 'missing',
  })

  push(checks, {
    id: 'platform-id',
    label: 'Platform id binding',
    verdict: input.platformId.trim() ? 'PASS' : 'FAIL',
    detail: input.platformId,
  })

  const scopeAligned = input.workspaceScopeKey === expectedScope.scopeKey
  push(checks, {
    id: 'scope-key',
    label: 'Workspace scope alignment',
    verdict: scopeAligned ? 'PASS' : 'FAIL',
    detail: scopeAligned
      ? expectedScope.scopeKey
      : `workspace=${input.workspaceScopeKey} expected=${expectedScope.scopeKey}`,
  })

  push(checks, {
    id: 'token-admin-mock',
    label: '12-TGX-TokenAdmin mock contract',
    verdict: 'PASS',
    detail: 'Read-only snapshot; no provisioning API',
  })

  let overall = deriveOverall(checks)
  if (input.forcedOverall) overall = input.forcedOverall

  return {
    schemaVersion: TENANT_CONFIG_VALIDATION_SCHEMA_VERSION,
    source: TOKEN_ADMIN_PRODUCT_ID,
    mockOnly: true,
    tenantId: input.tenantId,
    companyId: input.companyId,
    platformId: input.platformId,
    scopeKey: expectedScope.scopeKey,
    overall,
    validatedAt: Date.now(),
    checks,
  }
}
