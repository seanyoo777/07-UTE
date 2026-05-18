import { MOCK_TENANT_PRESETS } from './mockTenantPresets'
import {
  TENANT_MENU_NAV_MAPPINGS,
  type TenantMenuNavMapping,
} from './tenantMenuNavMapping'
import type { TenantCustomRecord } from './customTenantTypes'
import type { TenantMenuPresetId, TenantWhitelabelPreset } from './tenantPresetTypes'

export const DEFAULT_WHITELABEL_PRESET_ID = 'bluetrade' as const

const BUILTIN_REGISTRY = new Map<string, TenantWhitelabelPreset>(
  MOCK_TENANT_PRESETS.map((p) => [p.id, p]),
)

let customRecords: TenantCustomRecord[] = []

export function registerCustomTenantRecords(records: TenantCustomRecord[]): void {
  customRecords = [...records]
}

export function getCustomTenantRecords(): readonly TenantCustomRecord[] {
  return customRecords
}

export function isBuiltinPresetId(id: string): boolean {
  return BUILTIN_REGISTRY.has(id)
}

export function isCustomPresetId(id: string): boolean {
  return customRecords.some((r) => r.id === id)
}

export function getCustomTenantRecord(id: string): TenantCustomRecord | undefined {
  return customRecords.find((r) => r.id === id)
}

export function listBuiltinPresetIds(): string[] {
  return [...BUILTIN_REGISTRY.keys()]
}

export function listWhitelabelPresetIds(): string[] {
  const customIds = customRecords.map((r) => r.id)
  return [...BUILTIN_REGISTRY.keys(), ...customIds]
}

export function getWhitelabelPreset(id: string): TenantWhitelabelPreset | undefined {
  const custom = customRecords.find((r) => r.id === id)
  if (custom) return custom.preset
  return BUILTIN_REGISTRY.get(id)
}

export function getDefaultWhitelabelPreset(): TenantWhitelabelPreset {
  return BUILTIN_REGISTRY.get(DEFAULT_WHITELABEL_PRESET_ID) ?? MOCK_TENANT_PRESETS[0]!
}

export function resolveWhitelabelPreset(id: string | null | undefined): TenantWhitelabelPreset {
  if (id) {
    const custom = customRecords.find((r) => r.id === id)
    if (custom) return custom.preset
    if (BUILTIN_REGISTRY.has(id)) {
      return BUILTIN_REGISTRY.get(id)!
    }
  }
  return getDefaultWhitelabelPreset()
}

export function resolveNavMappingForPresetId(
  presetId: string,
  menuPreset: TenantMenuPresetId,
): TenantMenuNavMapping {
  const custom = customRecords.find((r) => r.id === presetId)
  if (custom) return custom.navOverrides
  return TENANT_MENU_NAV_MAPPINGS[menuPreset]
}
