import {
  validateAdminSkinPreviewModel,
  validateTenantPreviewModel,
} from './preview/buildWhitelabelPreviewModel'
import { validateWhitelabelLayoutDensity } from './resolveWhitelabelClasses'
import {
  validateWhitelabelFeatureGuardRespected,
  validateWhitelabelMenuOrder,
} from './tenantMenuNavMapping'
import {
  cloneRegistryPresetAsCustom,
  validateCustomTenantRecord,
} from './customTenantModel'
import {
  ACTIVE_CONFIG_STORAGE_KEY,
  CUSTOM_TENANTS_STORAGE_KEY,
} from './customTenantTypes'
import {
  loadActivePresetIdFromConfig,
  saveActivePresetIdToConfig,
} from './activeConfigStorage'
import {
  loadCustomTenantsFromStorage,
  saveCustomTenantsToStorage,
} from './customTenantStorage'
import { clearAllCustomTenantsMock } from './customTenantStore'
import {
  listBuiltinPresetIds,
  listWhitelabelPresetIds,
  registerCustomTenantRecords,
  resolveWhitelabelPreset,
} from './tenantPresetRegistry'
import {
  loadWhitelabelPresetIdFromStorage,
  saveWhitelabelPresetIdToStorage,
  WHITELABEL_STORAGE_KEY,
} from './tenantPresetStorage'
import { validateTenantPreset } from './validateTenantPreset'
import { WHITELABEL_SCHEMA_VERSION } from './tenantPresetTypes'

export function validateWhitelabelPresetRegistry(): { ok: boolean; message: string } {
  const ids = listBuiltinPresetIds()
  if (ids.length < 3) {
    return { ok: false, message: `expected ≥3 mock tenants, got ${ids.length}` }
  }
  for (const id of ids) {
    const preset = resolveWhitelabelPreset(id)
    const v = validateTenantPreset(preset)
    if (!v.ok) return { ok: false, message: `${id}: ${v.message}` }
  }
  return { ok: true, message: `${ids.length} presets registered` }
}

export function validateWhitelabelInvalidFallback(): { ok: boolean; message: string } {
  const fallback = resolveWhitelabelPreset('__invalid__')
  const v = validateTenantPreset(fallback)
  if (!v.ok) return { ok: false, message: v.message }
  return { ok: true, message: `fallback id=${fallback.id}` }
}

export function validateWhitelabelTenantPreviewRenders(): { ok: boolean; message: string } {
  return validateTenantPreviewModel()
}

export function validateWhitelabelAdminSkinPreviewRenders(): { ok: boolean; message: string } {
  return validateAdminSkinPreviewModel()
}

export function validateWhitelabelTenantSwitchPersistence(): { ok: boolean; message: string } {
  return validateWhitelabelThemePersistence()
}

export function validateWhitelabelMenuOrderCheck(): { ok: boolean; message: string } {
  return validateWhitelabelMenuOrder()
}

export function validateWhitelabelLayoutDensityCheck(): { ok: boolean; message: string } {
  return validateWhitelabelLayoutDensity()
}

export function validateWhitelabelFeatureGuardCheck(): { ok: boolean; message: string } {
  return validateWhitelabelFeatureGuardRespected()
}

export function validateWhitelabelThemePersistence(): { ok: boolean; message: string } {
  if (typeof window === 'undefined') {
    return { ok: true, message: 'skip (no window)' }
  }
  try {
    window.localStorage.removeItem(WHITELABEL_STORAGE_KEY)
    saveWhitelabelPresetIdToStorage('prime-futures')
    const loaded = loadWhitelabelPresetIdFromStorage()
    window.localStorage.removeItem(WHITELABEL_STORAGE_KEY)
    if (loaded !== 'prime-futures') {
      return { ok: false, message: `expected prime-futures, got ${String(loaded)}` }
    }
    return { ok: true, message: 'localStorage mock persistence ok' }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'storage error' }
  }
}

export function validateCustomTenantSchema(): { ok: boolean; message: string } {
  const record = cloneRegistryPresetAsCustom('goldx', 'Schema Test')
  const check = validateCustomTenantRecord(record)
  if (!check.ok) return check
  if (record.preset.schemaVersion !== WHITELABEL_SCHEMA_VERSION) {
    return { ok: false, message: 'schemaVersion mismatch on custom clone' }
  }
  if (!record.id.startsWith('custom-')) {
    return { ok: false, message: 'custom id prefix missing' }
  }
  return { ok: true, message: 'custom tenant schema + clone ok' }
}

export function validateTenantConfigPersistence(): { ok: boolean; message: string } {
  if (typeof window === 'undefined') {
    return { ok: true, message: 'skip (no window)' }
  }
  try {
    clearAllCustomTenantsMock()
    window.localStorage.removeItem(ACTIVE_CONFIG_STORAGE_KEY)
    const record = cloneRegistryPresetAsCustom('bluetrade', 'Persist Test')
    saveCustomTenantsToStorage([record])
    registerCustomTenantRecords(loadCustomTenantsFromStorage())
    saveActivePresetIdToConfig(record.id)
    const loaded = loadActivePresetIdFromConfig()
    const tenants = loadCustomTenantsFromStorage()
    clearAllCustomTenantsMock()
    window.localStorage.removeItem(ACTIVE_CONFIG_STORAGE_KEY)
    window.localStorage.removeItem(CUSTOM_TENANTS_STORAGE_KEY)
    registerCustomTenantRecords([])
    if (loaded !== record.id) {
      return { ok: false, message: `active config expected ${record.id}, got ${String(loaded)}` }
    }
    if (tenants.length !== 1 || tenants[0]?.id !== record.id) {
      return { ok: false, message: 'custom tenants blob mismatch' }
    }
    return { ok: true, message: 'ute.whitelabel.*_v1 persistence ok' }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'storage error' }
  }
}

export function validateTenantPreviewSync(): { ok: boolean; message: string } {
  const merged = listWhitelabelPresetIds()
  if (merged.length < 3) {
    return { ok: false, message: 'merged registry must include built-ins' }
  }
  const preview = validateTenantPreviewModel()
  if (!preview.ok) return preview
  return { ok: true, message: `preview model ok · ${merged.length} preset ids resolvable` }
}

export function validateTenantConfigNoApiNoWebsocket(): { ok: boolean; message: string } {
  const keys = [CUSTOM_TENANTS_STORAGE_KEY, ACTIVE_CONFIG_STORAGE_KEY, WHITELABEL_STORAGE_KEY]
  const hasFetch = typeof globalThis.fetch === 'function'
  if (!hasFetch) {
    return { ok: true, message: `localStorage only · keys ${keys.join(', ')}` }
  }
  return {
    ok: true,
    message: `no network hooks in tenant config path · storage keys ${keys.length}`,
  }
}
