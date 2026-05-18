import { resolveWhitelabelPreset } from './tenantPresetRegistry'
import type { TenantSpacingScale, TenantWhitelabelPreset } from './tenantPresetTypes'

const SIDEBAR_WIDTH: Record<TenantWhitelabelPreset['layout']['sidebarWidth'], string> = {
  narrow: 'w-12 md:w-28',
  standard: 'w-14 md:w-40',
  wide: 'w-16 md:w-48',
}

const TOPBAR_STYLE: Record<TenantWhitelabelPreset['layout']['topbarStyle'], string> = {
  flat: 'border-b border-so-border/80 bg-so-panel/90',
  elevated: 'border-b border-so-border bg-so-panel shadow-md shadow-black/20',
  glass: 'border-b border-so-border/40 bg-so-panel/70 backdrop-blur-md',
}

const GRID_DENSITY: Record<TenantWhitelabelPreset['layout']['gridDensity'], string> = {
  dense: 'gap-1 [--ute-card-pad:0.5rem]',
  standard: 'gap-2 [--ute-card-pad:0.75rem]',
  spacious: 'gap-4 [--ute-card-pad:1rem]',
}

const CARD_LAYOUT: Record<TenantWhitelabelPreset['layout']['cardLayout'], string> = {
  flat: '[--ute-card-border:transparent] [&_.ute-shell-card]:border-0 [&_.ute-shell-card]:bg-so-surface/40',
  bordered:
    '[--ute-card-border:var(--color-so-border)] [&_.ute-shell-card]:border [&_.ute-shell-card]:border-so-border/70',
  elevated:
    '[--ute-card-border:var(--color-so-border)] [&_.ute-shell-card]:border [&_.ute-shell-card]:border-so-border/50 [&_.ute-shell-card]:shadow-lg [&_.ute-shell-card]:shadow-black/25',
}

const THEME_SPACING: Record<TenantSpacingScale, string> = {
  compact: '[--ute-shell-pad:0.5rem] ute-layout-compact',
  comfortable: '[--ute-shell-pad:0.75rem]',
  airy: '[--ute-shell-pad:1.25rem] ute-layout-spacious',
}

const ADMIN_SHELL: Record<TenantWhitelabelPreset['admin'], string> = {
  'dark-professional': 'bg-so-bg',
  banking: 'bg-[#0a0f14]',
  'trading-desk': 'bg-gradient-to-b from-so-bg to-so-surface',
  'modern-glass': 'bg-so-bg/95 backdrop-blur-sm',
}

export function resolveWhitelabelShellClasses(preset: TenantWhitelabelPreset) {
  return {
    sidebarWidthClass: SIDEBAR_WIDTH[preset.layout.sidebarWidth],
    topbarClass: TOPBAR_STYLE[preset.layout.topbarStyle],
    gridDensityClass: GRID_DENSITY[preset.layout.gridDensity],
    cardLayoutClass: CARD_LAYOUT[preset.layout.cardLayout],
    workspaceSpacingClass: THEME_SPACING[preset.theme.spacing],
    adminShellClass: ADMIN_SHELL[preset.admin],
    cardLayoutData: preset.layout.cardLayout,
    gridDensityData: preset.layout.gridDensity,
    menuPreset: preset.menu,
  }
}

export function validateWhitelabelLayoutDensity(): { ok: boolean; message: string } {
  const dense = resolveWhitelabelShellClasses(resolveWhitelabelPreset('prime-futures'))
  const wide = resolveWhitelabelShellClasses(resolveWhitelabelPreset('goldx'))
  if (!dense.gridDensityClass.includes('gap-1')) {
    return { ok: false, message: 'prime-futures must use dense grid' }
  }
  if (!wide.sidebarWidthClass.includes('w-16')) {
    return { ok: false, message: 'goldx must use wide sidebar' }
  }
  if (!dense.cardLayoutClass.includes('ute-shell-card')) {
    return { ok: false, message: 'card layout class missing' }
  }
  return { ok: true, message: 'layout density + sidebar + card tokens ok' }
}
