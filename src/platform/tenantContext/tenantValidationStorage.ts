import type { TenantConfigValidationSnapshot } from './tenantConfigValidationTypes'
import { TENANT_CONFIG_VALIDATION_SCHEMA_VERSION } from './tenantConfigValidationTypes'

const STORAGE_PREFIX = 'ute-tenant-validation:v1:'

export function tenantValidationStorageKey(scopeKey: string): string {
  return `${STORAGE_PREFIX}${scopeKey}`
}

export function loadTenantValidationSnapshot(
  scopeKey: string,
): TenantConfigValidationSnapshot | null {
  if (typeof window === 'undefined' || !window.localStorage) return null
  try {
    const raw = window.localStorage.getItem(tenantValidationStorageKey(scopeKey))
    if (!raw) return null
    const parsed = JSON.parse(raw) as TenantConfigValidationSnapshot
    if (
      parsed.schemaVersion !== TENANT_CONFIG_VALIDATION_SCHEMA_VERSION ||
      parsed.mockOnly !== true ||
      parsed.scopeKey !== scopeKey
    ) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function saveTenantValidationSnapshot(snapshot: TenantConfigValidationSnapshot): void {
  if (typeof window === 'undefined' || !window.localStorage) return
  try {
    window.localStorage.setItem(
      tenantValidationStorageKey(snapshot.scopeKey),
      JSON.stringify(snapshot),
    )
  } catch {
    /* quota */
  }
}
