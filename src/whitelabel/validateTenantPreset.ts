import {
  TENANT_ADMIN_PRESET_IDS,
  TENANT_MENU_PRESET_IDS,
  WHITELABEL_SCHEMA_VERSION,
  type TenantWhitelabelPreset,
} from './tenantPresetTypes'

export function validateTenantPreset(preset: TenantWhitelabelPreset): {
  ok: boolean
  message: string
} {
  if (preset.schemaVersion !== WHITELABEL_SCHEMA_VERSION) {
    return { ok: false, message: 'schemaVersion mismatch' }
  }
  if (preset.mockOnly !== true) {
    return { ok: false, message: 'mockOnly must be true' }
  }
  if (!preset.id || !preset.brandName) {
    return { ok: false, message: 'id and brandName required' }
  }
  const c = preset.theme.colors
  if (!c.bg || !c.accent || !c.bid || !c.ask) {
    return { ok: false, message: 'theme.colors incomplete' }
  }
  if (!TENANT_MENU_PRESET_IDS.includes(preset.menu)) {
    return { ok: false, message: 'invalid menu preset' }
  }
  if (!TENANT_ADMIN_PRESET_IDS.includes(preset.admin)) {
    return { ok: false, message: 'invalid admin preset' }
  }
  if (preset.theme.typography.baseSizePx < 10 || preset.theme.typography.baseSizePx > 20) {
    return { ok: false, message: 'typography.baseSizePx out of range' }
  }
  return { ok: true, message: 'tenant preset valid' }
}
