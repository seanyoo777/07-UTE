import type { MenuPreviewModel } from '../tenantMenuNavMapping'
import type {
  TenantAdminPresetId,
  TenantLayoutPreset,
  TenantMenuPresetId,
  TenantWhitelabelPreset,
} from '../tenantPresetTypes'

export type TenantPreviewCardModel = {
  presetId: string
  brandName: string
  primaryColor: string
  accentColor: string
  menuPreset: TenantMenuPresetId
  adminPreset: TenantAdminPresetId
  isActive: boolean
}

export type BrandSummaryModel = {
  logoText: string
  primaryColor: string
  accentColor: string
  menuPreset: TenantMenuPresetId
  adminPreset: TenantAdminPresetId
  layoutPreset: TenantLayoutPreset
}

export type LayoutPreviewModel = {
  sidebarWidth: TenantLayoutPreset['sidebarWidth']
  topbarStyle: TenantLayoutPreset['topbarStyle']
  cardLayout: TenantLayoutPreset['cardLayout']
  gridDensity: TenantLayoutPreset['gridDensity']
}

export type AdminSkinPreviewCardModel = {
  skinId: TenantAdminPresetId
  label: string
  shellClass: string
  isActive: boolean
}

export type WhitelabelPreviewDiagnosticsModel = {
  selectedTenantId: string
  selectedBrandName: string
  themePersisted: boolean
  storedPresetId: string | null
  invalidFallbackDefaultId: string
  currentAdminSkin: TenantAdminPresetId
  presetValid: boolean
  menuVisibleOrder: string
  layoutSummary: string
}

export type WhitelabelPreviewBundle = {
  mockOnly: true
  activePresetId: string
  tenantCards: TenantPreviewCardModel[]
  brandSummary: BrandSummaryModel
  layoutPreview: LayoutPreviewModel
  menuPreview: MenuPreviewModel
  adminSkins: AdminSkinPreviewCardModel[]
  diagnostics: WhitelabelPreviewDiagnosticsModel
}

export function buildBrandSummary(preset: TenantWhitelabelPreset): BrandSummaryModel {
  return {
    logoText: preset.brandName,
    primaryColor: preset.theme.colors.accent,
    accentColor: preset.theme.colors.accent2,
    menuPreset: preset.menu,
    adminPreset: preset.admin,
    layoutPreset: preset.layout,
  }
}
