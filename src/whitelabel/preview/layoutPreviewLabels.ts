import type { TenantLayoutPreset } from '../tenantPresetTypes'

export const SIDEBAR_WIDTH_LABEL: Record<TenantLayoutPreset['sidebarWidth'], string> = {
  narrow: 'Narrow',
  standard: 'Standard',
  wide: 'Wide',
}

export const TOPBAR_STYLE_LABEL: Record<TenantLayoutPreset['topbarStyle'], string> = {
  flat: 'Flat',
  elevated: 'Elevated',
  glass: 'Glass',
}

export const CARD_LAYOUT_LABEL: Record<TenantLayoutPreset['cardLayout'], string> = {
  flat: 'Flat',
  bordered: 'Bordered',
  elevated: 'Elevated',
}

export const GRID_DENSITY_LABEL: Record<TenantLayoutPreset['gridDensity'], string> = {
  dense: 'Dense',
  standard: 'Standard',
  spacious: 'Spacious',
}

export const SIDEBAR_WIDTH_VISUAL: Record<TenantLayoutPreset['sidebarWidth'], string> = {
  narrow: 'w-3',
  standard: 'w-5',
  wide: 'w-7',
}
