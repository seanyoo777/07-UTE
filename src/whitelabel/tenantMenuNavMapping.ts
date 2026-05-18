import {
  DEFAULT_LAYOUT_FLAGS,
  resolveEffectiveLayoutFlags,
  type EffectiveLayoutFlags,
} from '../config/layoutFeatureFlags'
import { isPlatformNavItemVisible } from '../platform/platformNavVisibility'
import { PLATFORM_NAV_ITEMS, type PlatformNavId, type PlatformNavItem } from '../platform/platformShellConfig'
import { TENANT_MENU_PRESET_IDS, type TenantMenuPresetId } from './tenantPresetTypes'

export type ResolvedPlatformNavItem = PlatformNavItem & {
  emphasized: boolean
}

export type TenantMenuNavMapping = {
  navOrder: PlatformNavId[]
  emphasizedNavIds: PlatformNavId[]
  /** Sidebar hide — Diagnostics stays on header / admin (mock only). */
  hideNavIds: PlatformNavId[]
}

export const TENANT_MENU_NAV_MAPPINGS: Record<TenantMenuPresetId, TenantMenuNavMapping> = {
  'trading-first': {
    navOrder: ['trading', 'admin', 'diagnostics'],
    emphasizedNavIds: ['trading'],
    hideNavIds: [],
  },
  'mobile-first': {
    navOrder: ['trading', 'admin'],
    emphasizedNavIds: ['trading'],
    hideNavIds: ['diagnostics'],
  },
  'broker-style': {
    navOrder: ['admin', 'trading', 'diagnostics'],
    emphasizedNavIds: ['admin'],
    hideNavIds: [],
  },
  'futures-style': {
    navOrder: ['trading', 'diagnostics', 'admin'],
    emphasizedNavIds: ['trading', 'diagnostics'],
    hideNavIds: [],
  },
}

export type MenuPreviewEntry = {
  navId: PlatformNavId
  label: string
  visible: boolean
  emphasized: boolean
  hiddenByMenuPreset: boolean
  hiddenByFeatureFlag: boolean
}

export type MenuPreviewModel = {
  menuPreset: TenantMenuPresetId
  visibleOrder: PlatformNavId[]
  entries: MenuPreviewEntry[]
}

export function resolvePlatformNavForTenant(
  flags: EffectiveLayoutFlags,
  menuPreset: TenantMenuPresetId,
  navOverride?: TenantMenuNavMapping | null,
): ResolvedPlatformNavItem[] {
  const mapping = navOverride ?? TENANT_MENU_NAV_MAPPINGS[menuPreset]
  const flagVisible = PLATFORM_NAV_ITEMS.filter((item) => isPlatformNavItemVisible(item, flags))
  const menuVisible = flagVisible.filter((item) => !mapping.hideNavIds.includes(item.id))

  const ordered: ResolvedPlatformNavItem[] = []
  for (const id of mapping.navOrder) {
    const item = menuVisible.find((i) => i.id === id)
    if (item) {
      ordered.push({
        ...item,
        emphasized: mapping.emphasizedNavIds.includes(id),
      })
    }
  }
  for (const item of menuVisible) {
    if (!ordered.some((o) => o.id === item.id)) {
      ordered.push({
        ...item,
        emphasized: mapping.emphasizedNavIds.includes(item.id),
      })
    }
  }
  return ordered
}

export function buildMenuPreview(
  menuPreset: TenantMenuPresetId,
  flags: EffectiveLayoutFlags,
  navOverride?: TenantMenuNavMapping | null,
): MenuPreviewModel {
  const mapping = navOverride ?? TENANT_MENU_NAV_MAPPINGS[menuPreset]
  const resolved = resolvePlatformNavForTenant(flags, menuPreset, navOverride)

  const entries: MenuPreviewEntry[] = PLATFORM_NAV_ITEMS.map((item) => {
    const hiddenByFeatureFlag = !isPlatformNavItemVisible(item, flags)
    const hiddenByMenuPreset = mapping.hideNavIds.includes(item.id)
    const visible = !hiddenByFeatureFlag && !hiddenByMenuPreset
    const emphasized = resolved.find((r) => r.id === item.id)?.emphasized ?? false
    return {
      navId: item.id,
      label: item.label,
      visible,
      emphasized,
      hiddenByMenuPreset,
      hiddenByFeatureFlag,
    }
  })

  return {
    menuPreset,
    visibleOrder: resolved.map((r) => r.id),
    entries,
  }
}

export function validateWhitelabelMenuOrder(): { ok: boolean; message: string } {
  const orders = TENANT_MENU_PRESET_IDS.map((id) => ({
    id,
    order: TENANT_MENU_NAV_MAPPINGS[id].navOrder.join(','),
  }))
  const unique = new Set(orders.map((o) => o.order))
  if (unique.size !== TENANT_MENU_PRESET_IDS.length) {
    return { ok: false, message: 'menu presets must have distinct nav orders' }
  }
  if (TENANT_MENU_NAV_MAPPINGS['broker-style'].navOrder[0] !== 'admin') {
    return { ok: false, message: 'broker-style must lead with admin' }
  }
  if (TENANT_MENU_NAV_MAPPINGS['mobile-first'].hideNavIds[0] !== 'diagnostics') {
    return { ok: false, message: 'mobile-first must hide diagnostics in sidebar' }
  }
  return { ok: true, message: `4 presets · orders ${orders.map((o) => o.id).join(', ')}` }
}

export function validateWhitelabelFeatureGuardRespected(): { ok: boolean; message: string } {
  const emergency = resolveEffectiveLayoutFlags({
    env: { VITE_UTE_EMERGENCY_DISABLE: 'true' },
  })
  const futuresNav = resolvePlatformNavForTenant(emergency, 'futures-style')
  if (futuresNav.some((n) => n.id === 'diagnostics')) {
    return { ok: false, message: 'emergency must hide diagnostics despite futures-style' }
  }

  const noSlots = resolveEffectiveLayoutFlags({
    env: { VITE_UTE_SHOW_INTEGRATION_SLOTS: 'false' },
    overrides: { emergencyDisable: false },
  })
  const tradingNav = resolvePlatformNavForTenant(noSlots, 'trading-first')
  if (tradingNav.some((n) => n.id === 'diagnostics')) {
    return { ok: false, message: 'showIntegrationSlots=false must hide diagnostics' }
  }

  const defaultNav = resolvePlatformNavForTenant(
    { ...DEFAULT_LAYOUT_FLAGS, forceMobileStack: false },
    'trading-first',
  )
  if (defaultNav[0]?.id !== 'trading') {
    return { ok: false, message: 'trading-first must lead with trading' }
  }

  return { ok: true, message: 'emergency + chrome guards respected' }
}
