import type { CustomTenantsStorageBlob, TenantCustomRecord } from './customTenantTypes'
import {
  CUSTOM_TENANTS_STORAGE_KEY,
  CUSTOM_TENANTS_STORAGE_VERSION,
} from './customTenantTypes'
import { validateCustomTenantRecord } from './customTenantModel'

export function loadCustomTenantsFromStorage(): TenantCustomRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(CUSTOM_TENANTS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CustomTenantsStorageBlob
    if (parsed.v !== CUSTOM_TENANTS_STORAGE_VERSION || parsed.mockOnly !== true) return []
    if (!Array.isArray(parsed.tenants)) return []
    return parsed.tenants.filter((t) => validateCustomTenantRecord(t).ok)
  } catch {
    return []
  }
}

export function saveCustomTenantsToStorage(tenants: TenantCustomRecord[]): void {
  if (typeof window === 'undefined') return
  const blob: CustomTenantsStorageBlob = {
    v: CUSTOM_TENANTS_STORAGE_VERSION,
    tenants,
    mockOnly: true,
  }
  window.localStorage.setItem(CUSTOM_TENANTS_STORAGE_KEY, JSON.stringify(blob))
}

export function upsertCustomTenantInStorage(record: TenantCustomRecord): TenantCustomRecord[] {
  const list = loadCustomTenantsFromStorage()
  const next = list.filter((t) => t.id !== record.id).concat(record)
  saveCustomTenantsToStorage(next)
  return next
}

export function removeCustomTenantFromStorage(id: string): TenantCustomRecord[] {
  const next = loadCustomTenantsFromStorage().filter((t) => t.id !== id)
  saveCustomTenantsToStorage(next)
  return next
}
