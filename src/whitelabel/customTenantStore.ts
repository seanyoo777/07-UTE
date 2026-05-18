import { create } from 'zustand'
import { registerCustomTenantRecords } from './tenantPresetRegistry'
import {
  cloneRegistryPresetAsCustom,
  customRecordFromForm,
  type TenantAdminFormState,
} from './customTenantModel'
import {
  loadCustomTenantsFromStorage,
  removeCustomTenantFromStorage,
  saveCustomTenantsToStorage,
  upsertCustomTenantInStorage,
} from './customTenantStorage'
import type { TenantCustomRecord } from './customTenantTypes'

type CustomTenantState = {
  tenants: TenantCustomRecord[]
  hydrated: boolean
  hydrateFromStorage: () => void
  saveTenant: (form: TenantAdminFormState, existingId?: string | null, sourcePresetId?: string) => TenantCustomRecord
  deleteTenant: (id: string) => void
  cloneFromPreset: (sourcePresetId: string, brandName?: string) => TenantCustomRecord
}

function syncRegistry(tenants: TenantCustomRecord[]) {
  registerCustomTenantRecords(tenants)
}

export const useCustomTenantStore = create<CustomTenantState>()((set, get) => ({
  tenants: [],
  hydrated: false,
  hydrateFromStorage: () => {
    const tenants = loadCustomTenantsFromStorage()
    syncRegistry(tenants)
    set({ tenants, hydrated: true })
  },
  saveTenant: (form, existingId, sourcePresetId) => {
    const existing = existingId
      ? get().tenants.find((t) => t.id === existingId) ?? null
      : null
    const record = customRecordFromForm(form, existing, sourcePresetId)
    const tenants = upsertCustomTenantInStorage(record)
    syncRegistry(tenants)
    set({ tenants })
    return record
  },
  deleteTenant: (id) => {
    const tenants = removeCustomTenantFromStorage(id)
    syncRegistry(tenants)
    set({ tenants })
  },
  cloneFromPreset: (sourcePresetId, brandName) => {
    const record = cloneRegistryPresetAsCustom(sourcePresetId, brandName)
    const tenants = upsertCustomTenantInStorage(record)
    syncRegistry(tenants)
    set({ tenants })
    return record
  },
}))

export function clearAllCustomTenantsMock(): void {
  saveCustomTenantsToStorage([])
  registerCustomTenantRecords([])
  useCustomTenantStore.setState({ tenants: [] })
}
