/** White-label preset schema — single engine, many brand faces (mock only). */

export const WHITELABEL_SCHEMA_VERSION = '1.0.0' as const

export const TENANT_MENU_PRESET_IDS = [
  'trading-first',
  'mobile-first',
  'broker-style',
  'futures-style',
] as const

export type TenantMenuPresetId = (typeof TENANT_MENU_PRESET_IDS)[number]

export const TENANT_ADMIN_PRESET_IDS = [
  'dark-professional',
  'banking',
  'trading-desk',
  'modern-glass',
] as const

export type TenantAdminPresetId = (typeof TENANT_ADMIN_PRESET_IDS)[number]

export type TenantChartStyle = 'minimal' | 'gradient' | 'high-contrast' | 'neon'
export type TenantSpacingScale = 'compact' | 'comfortable' | 'airy'
export type TenantBorderRadiusScale = 'sharp' | 'rounded' | 'pill'

export type TenantThemeConfig = {
  colors: {
    bg: string
    surface: string
    surface2: string
    border: string
    text: string
    muted: string
    bid: string
    ask: string
    accent: string
    accent2: string
    warn: string
  }
  typography: {
    fontSans: string
    fontMono: string
    baseSizePx: number
    headingWeight: number
  }
  chartStyle: TenantChartStyle
  spacing: TenantSpacingScale
  borderRadius: TenantBorderRadiusScale
}

export type TenantLayoutPreset = {
  sidebarWidth: 'narrow' | 'standard' | 'wide'
  topbarStyle: 'flat' | 'elevated' | 'glass'
  cardLayout: 'flat' | 'bordered' | 'elevated'
  gridDensity: 'dense' | 'standard' | 'spacious'
}

export type TenantWhitelabelPreset = {
  schemaVersion: typeof WHITELABEL_SCHEMA_VERSION
  id: string
  brandName: string
  tenantId: string
  companyId: string
  theme: TenantThemeConfig
  layout: TenantLayoutPreset
  menu: TenantMenuPresetId
  admin: TenantAdminPresetId
  mockOnly: true
}
