import { create } from 'zustand'
import type { PlatformTenant } from './platformTenantTypes'

export const DEFAULT_PLATFORM_TENANT: PlatformTenant = {
  id: 'ute-demo-tenant',
  companyId: 'ute-demo-company',
  displayName: 'UTE Demo Org',
  tier: 'demo',
  environmentLabel: 'mock · unified exchange',
}

type PlatformTenantState = {
  tenant: PlatformTenant
  setTenant: (patch: Partial<PlatformTenant>) => void
}

/** In-memory tenant label for shell chrome only (not multi-tenant routing). */
export const usePlatformTenantStore = create<PlatformTenantState>()((set) => ({
  tenant: DEFAULT_PLATFORM_TENANT,
  setTenant: (patch) =>
    set((s) => ({
      tenant: { ...s.tenant, ...patch },
    })),
}))
