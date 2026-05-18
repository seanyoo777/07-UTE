import type { TenantMenuNavMapping } from './tenantMenuNavMapping'
import type { TenantWhitelabelPreset } from './tenantPresetTypes'

export const CUSTOM_TENANTS_STORAGE_KEY = 'ute.whitelabel.custom_tenants_v1' as const
export const ACTIVE_CONFIG_STORAGE_KEY = 'ute.whitelabel.active_config_v1' as const
export const CUSTOM_TENANTS_STORAGE_VERSION = 1 as const
export const ACTIVE_CONFIG_STORAGE_VERSION = 1 as const

export type TenantCustomRecord = {
  id: string
  sourcePresetId: string
  preset: TenantWhitelabelPreset
  navOverrides: TenantMenuNavMapping
  mockOnly: true
  createdAt: number
  updatedAt: number
}

export type CustomTenantsStorageBlob = {
  v: typeof CUSTOM_TENANTS_STORAGE_VERSION
  tenants: TenantCustomRecord[]
  mockOnly: true
}

export type WhitelabelActiveConfigBlob = {
  v: typeof ACTIVE_CONFIG_STORAGE_VERSION
  activePresetId: string
  mockOnly: true
  savedAt: number
}
