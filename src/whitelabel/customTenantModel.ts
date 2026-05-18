import { MOCK_TENANT_PRESETS } from './mockTenantPresets'
import { TENANT_MENU_NAV_MAPPINGS } from './tenantMenuNavMapping'
import { resolveWhitelabelPreset } from './tenantPresetRegistry'
import type { TenantCustomRecord } from './customTenantTypes'
import type { TenantMenuNavMapping } from './tenantMenuNavMapping'
import type { PlatformNavId } from '../platform/platformShellConfig'
import {
  TENANT_ADMIN_PRESET_IDS,
  TENANT_MENU_PRESET_IDS,
  WHITELABEL_SCHEMA_VERSION,
  type TenantAdminPresetId,
  type TenantLayoutPreset,
  type TenantMenuPresetId,
  type TenantSpacingScale,
  type TenantWhitelabelPreset,
} from './tenantPresetTypes'
import { validateTenantPreset } from './validateTenantPreset'

export type TenantAdminFormState = {
  brandName: string
  accentColor: string
  admin: TenantAdminPresetId
  menu: TenantMenuPresetId
  layout: TenantLayoutPreset
  spacing: TenantSpacingScale
  navOrder: PlatformNavId[]
  emphasizedNavIds: PlatformNavId[]
  hideNavIds: PlatformNavId[]
}

const NAV_IDS: PlatformNavId[] = ['trading', 'admin', 'diagnostics']

export function navMappingFromForm(form: TenantAdminFormState): TenantMenuNavMapping {
  return {
    navOrder: [...form.navOrder],
    emphasizedNavIds: [...form.emphasizedNavIds],
    hideNavIds: [...form.hideNavIds],
  }
}

export function formStateFromPreset(
  preset: TenantWhitelabelPreset,
  navOverrides?: TenantMenuNavMapping | null,
): TenantAdminFormState {
  const mapping = navOverrides ?? TENANT_MENU_NAV_MAPPINGS[preset.menu]
  return {
    brandName: preset.brandName,
    accentColor: preset.theme.colors.accent,
    admin: preset.admin,
    menu: preset.menu,
    layout: { ...preset.layout },
    spacing: preset.theme.spacing,
    navOrder: [...mapping.navOrder],
    emphasizedNavIds: [...mapping.emphasizedNavIds],
    hideNavIds: [...mapping.hideNavIds],
  }
}

export function applyFormToPreset(
  base: TenantWhitelabelPreset,
  form: TenantAdminFormState,
  targetId?: string,
): TenantWhitelabelPreset {
  const id = targetId ?? base.id
  return {
    ...base,
    schemaVersion: WHITELABEL_SCHEMA_VERSION,
    id,
    brandName: form.brandName.trim() || base.brandName,
    tenantId: base.tenantId.startsWith('custom-') ? base.tenantId : `${id}-tenant`,
    companyId: base.companyId.includes('custom') ? base.companyId : `${id}-co`,
    mockOnly: true,
    admin: form.admin,
    menu: form.menu,
    layout: { ...form.layout },
    theme: {
      ...base.theme,
      spacing: form.spacing,
      colors: {
        ...base.theme.colors,
        accent: form.accentColor,
        accent2: form.accentColor,
      },
    },
  }
}

function slugifyBrand(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24)
}

export function createCustomTenantId(brandName: string): string {
  const slug = slugifyBrand(brandName) || 'tenant'
  return `custom-${slug}-${Date.now().toString(36)}`
}

export function cloneRegistryPresetAsCustom(
  sourcePresetId: string,
  brandName?: string,
): TenantCustomRecord {
  const source = resolveWhitelabelPreset(sourcePresetId)
  const id = createCustomTenantId(brandName ?? source.brandName)
  const preset = applyFormToPreset(
    {
      ...source,
      id,
      tenantId: `${id}-tenant`,
      companyId: `${id}-co`,
    },
    formStateFromPreset(source),
    id,
  )
  if (brandName) {
    preset.brandName = brandName.trim()
  }
  const now = Date.now()
  return {
    id,
    sourcePresetId: source.id,
    preset,
    navOverrides: { ...TENANT_MENU_NAV_MAPPINGS[source.menu] },
    mockOnly: true,
    createdAt: now,
    updatedAt: now,
  }
}

export function customRecordFromForm(
  form: TenantAdminFormState,
  existing?: TenantCustomRecord | null,
  sourcePresetId?: string,
): TenantCustomRecord {
  const source = resolveWhitelabelPreset(sourcePresetId ?? existing?.sourcePresetId ?? 'bluetrade')
  const id = existing?.id ?? createCustomTenantId(form.brandName)
  const preset = applyFormToPreset(
    existing?.preset ?? {
      ...source,
      id,
      tenantId: `${id}-tenant`,
      companyId: `${id}-co`,
    },
    form,
    id,
  )
  const now = Date.now()
  return {
    id,
    sourcePresetId: existing?.sourcePresetId ?? source.id,
    preset,
    navOverrides: navMappingFromForm(form),
    mockOnly: true,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
}

export function resetFormToSourcePreset(
  sourcePresetId: string,
): { form: TenantAdminFormState; preset: TenantWhitelabelPreset } {
  const preset = resolveWhitelabelPreset(sourcePresetId)
  return {
    preset,
    form: formStateFromPreset(preset),
  }
}

export function validateCustomTenantRecord(record: TenantCustomRecord): {
  ok: boolean
  message: string
} {
  const presetCheck = validateTenantPreset(record.preset)
  if (!presetCheck.ok) return presetCheck
  if (record.mockOnly !== true) {
    return { ok: false, message: 'mockOnly must be true' }
  }
  if (!record.id.startsWith('custom-')) {
    return { ok: false, message: 'custom tenant id must start with custom-' }
  }
  if (!MOCK_TENANT_PRESETS.some((p) => p.id === record.sourcePresetId)) {
    return { ok: false, message: 'sourcePresetId must reference built-in preset' }
  }
  for (const id of record.navOverrides.navOrder) {
    if (!NAV_IDS.includes(id)) return { ok: false, message: `invalid nav id ${id}` }
  }
  if (!TENANT_MENU_PRESET_IDS.includes(record.preset.menu)) {
    return { ok: false, message: 'invalid menu preset on custom record' }
  }
  if (!TENANT_ADMIN_PRESET_IDS.includes(record.preset.admin)) {
    return { ok: false, message: 'invalid admin preset on custom record' }
  }
  return { ok: true, message: 'custom tenant valid' }
}

export function formDriftsFromPreset(
  form: TenantAdminFormState,
  preset: TenantWhitelabelPreset,
  navOverrides?: TenantMenuNavMapping | null,
): boolean {
  const base = formStateFromPreset(preset, navOverrides)
  return JSON.stringify(form) !== JSON.stringify(base)
}

export function syncNavFromMenuPreset(form: TenantAdminFormState): TenantAdminFormState {
  const mapping = TENANT_MENU_NAV_MAPPINGS[form.menu]
  return {
    ...form,
    navOrder: [...mapping.navOrder],
    emphasizedNavIds: [...mapping.emphasizedNavIds],
    hideNavIds: [...mapping.hideNavIds],
  }
}
