import type { TenantWhitelabelPreset } from './tenantPresetTypes'

const CSS_VAR_MAP: Record<keyof TenantWhitelabelPreset['theme']['colors'], string> = {
  bg: '--color-so-bg',
  surface: '--color-so-surface',
  surface2: '--color-so-surface-2',
  border: '--color-so-border',
  text: '--color-so-text',
  muted: '--color-so-muted',
  bid: '--color-so-bid',
  ask: '--color-so-ask',
  accent: '--color-so-accent',
  accent2: '--color-so-accent-2',
  warn: '--color-so-warn',
}

/** Apply theme tokens to document root — runtime white-label (mock only). */
export function applyTenantTheme(preset: TenantWhitelabelPreset): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const { colors, typography, chartStyle, spacing, borderRadius } = preset.theme

  for (const [key, cssVar] of Object.entries(CSS_VAR_MAP)) {
    root.style.setProperty(cssVar, colors[key as keyof typeof colors])
  }
  root.style.setProperty('--color-so-fg', colors.text)
  root.style.setProperty('--color-so-panel', colors.surface)

  root.style.setProperty('--font-sans', typography.fontSans)
  root.style.setProperty('--font-mono', typography.fontMono)
  root.style.fontSize = `${typography.baseSizePx}px`

  root.dataset.uteWhitelabel = preset.id
  root.dataset.uteChartStyle = chartStyle
  root.dataset.uteSpacing = spacing
  root.dataset.uteRadius = borderRadius
  root.dataset.uteMenu = preset.menu
  root.dataset.uteAdmin = preset.admin
  root.dataset.uteLayoutSidebar = preset.layout.sidebarWidth
  root.dataset.uteLayoutTopbar = preset.layout.topbarStyle
  root.dataset.uteLayoutCard = preset.layout.cardLayout
  root.dataset.uteLayoutGrid = preset.layout.gridDensity
}
