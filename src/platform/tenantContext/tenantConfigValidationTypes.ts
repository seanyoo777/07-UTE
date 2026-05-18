/** Aligns with 12-TGX-TokenAdmin Tenant Config Validation (mock contract in 07-UTE). */
export const TENANT_CONFIG_VALIDATION_SCHEMA_VERSION = '1.0.0' as const

export const TOKEN_ADMIN_PRODUCT_ID = '12-TGX-TokenAdmin' as const

export type TenantConfigValidationVerdict = 'PASS' | 'WARN' | 'FAIL'

export type TenantConfigValidationCheck = {
  id: string
  label: string
  verdict: TenantConfigValidationVerdict
  detail?: string
}

export type TenantConfigValidationSnapshot = {
  schemaVersion: typeof TENANT_CONFIG_VALIDATION_SCHEMA_VERSION
  source: typeof TOKEN_ADMIN_PRODUCT_ID
  mockOnly: true
  tenantId: string
  companyId: string
  platformId: string
  scopeKey: string
  overall: TenantConfigValidationVerdict
  validatedAt: number
  checks: TenantConfigValidationCheck[]
}

export type ScopeMismatchDiagnostic = {
  mockOnly: true
  workspaceScopeKey: string
  expectedScopeKey: string
  tenantId: string
  companyId: string
  platformId: string
  detectedAt: number
  message: string
}
