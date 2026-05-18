import { create } from 'zustand'
import { detectScopeMismatch } from './detectScopeMismatch'
import { saveTenantValidationSnapshot } from './tenantValidationStorage'
import { runMockTenantConfigValidation } from './runMockTenantConfigValidation'
import type {
  ScopeMismatchDiagnostic,
  TenantConfigValidationSnapshot,
  TenantConfigValidationVerdict,
} from './tenantConfigValidationTypes'

export type TenantContextHydrateInput = {
  tenantId: string
  companyId: string
  platformId: string
  workspaceScopeKey: string
  forcedOverall?: TenantConfigValidationVerdict
}

type State = {
  snapshot: TenantConfigValidationSnapshot | null
  scopeMismatch: ScopeMismatchDiagnostic | null
  hydrate: (input: TenantContextHydrateInput) => TenantConfigValidationSnapshot
}

export const useTenantContextBridgeStore = create<State>((set) => ({
  snapshot: null,
  scopeMismatch: null,

  hydrate: (input) => {
    const fresh = runMockTenantConfigValidation({
      tenantId: input.tenantId,
      companyId: input.companyId,
      platformId: input.platformId,
      workspaceScopeKey: input.workspaceScopeKey,
      forcedOverall: input.forcedOverall,
    })

    saveTenantValidationSnapshot(fresh)

    const scopeMismatch = detectScopeMismatch({
      workspaceScopeKey: input.workspaceScopeKey,
      expectedScopeKey: fresh.scopeKey,
      tenantId: input.tenantId,
      companyId: input.companyId,
      platformId: input.platformId,
    })

    set({ snapshot: fresh, scopeMismatch })
    return fresh
  },
}))
