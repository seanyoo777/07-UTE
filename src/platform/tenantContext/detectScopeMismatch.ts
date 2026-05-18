import type { ScopeMismatchDiagnostic } from './tenantConfigValidationTypes'

export function detectScopeMismatch(input: {
  workspaceScopeKey: string
  expectedScopeKey: string
  tenantId: string
  companyId: string
  platformId: string
}): ScopeMismatchDiagnostic | null {
  if (input.workspaceScopeKey === input.expectedScopeKey) return null
  return {
    mockOnly: true,
    workspaceScopeKey: input.workspaceScopeKey,
    expectedScopeKey: input.expectedScopeKey,
    tenantId: input.tenantId,
    companyId: input.companyId,
    platformId: input.platformId,
    detectedAt: Date.now(),
    message: `Workspace scope ${input.workspaceScopeKey} ≠ validation scope ${input.expectedScopeKey}`,
  }
}
