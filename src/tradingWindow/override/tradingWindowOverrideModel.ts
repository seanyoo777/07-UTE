import type { TenantWhitelabelPreset } from '../../whitelabel/tenantPresetTypes'
import { resolveWhitelabelPreset } from '../../whitelabel/tenantPresetRegistry'
import { getTradingWindowProfile } from '../tradingWindowPresetRegistry'
import { resolveTradingWindowPreset } from '../tradingWindowPresetRegistry'
import {
  resolveDockTabStyleChrome,
  resolveOrderBookDensityChrome,
  resolveOrderFormChromeMode,
  type DockTabStyleChrome,
  type OrderBookDensityChrome,
  type OrderFormChromeMode,
} from '../tradingWindowPanelChrome'
import type {
  TradingWindowHtsGrid,
  TradingWindowPreset,
  TradingWindowProfileId,
} from '../tradingWindowPresetTypes'
import { clampHtsGridWeight, getHtsGridForProfile } from '../tradingWindowHtsGridDefaults'
import type {
  MobileStackMode,
  TradingWindowTenantOverride,
} from './tradingWindowOverrideTypes'
import {
  applyMobileVisualPreset,
  inferMobileVisualPreset,
  MOBILE_VISUAL_PRESET_IDS,
  normalizeStackOrder,
  type MobileVisualPresetId,
} from '../mobile/mobileStackPreview'
import type { MobileStackSlotId } from '../tradingWindowPresetTypes'
import { MOBILE_STACK_MODES } from './tradingWindowOverrideTypes'

export type TradingWindowAdminFormState = {
  tenantPresetId: string
  profileId: TradingWindowProfileId
  htsChart: number
  htsBook: number
  htsOrder: number
  orderBookDensity: OrderBookDensityChrome
  orderFormMode: OrderFormChromeMode
  dockTabStyle: DockTabStyleChrome
  dockHeight: 'short' | 'standard' | 'tall'
  mobileStackMode: MobileStackMode
  mobileVisualPreset: MobileVisualPresetId
  mobileStackOrder: MobileStackSlotId[]
}

export function adminFormFromTenantId(
  tenantPresetId: string,
  saved?: TradingWindowTenantOverride | null,
): TradingWindowAdminFormState {
  if (saved) return overrideToAdminForm(saved)
  const tenant = resolveWhitelabelPreset(tenantPresetId)
  const tw = resolveTradingWindowPreset(tenant)
  const grid = getHtsGridForProfile(tw.profileId)
  return {
    tenantPresetId,
    profileId: tw.profileId,
    htsChart: grid.chart,
    htsBook: grid.orderBook,
    htsOrder: grid.orderPanel,
    orderBookDensity: resolveOrderBookDensityChrome(tw),
    orderFormMode: resolveOrderFormChromeMode(tw),
    dockTabStyle: resolveDockTabStyleChrome(tw),
    dockHeight: tw.positionPanel.dockHeight,
    mobileStackMode: inferMobileStackMode(tw.mobile.stackOrder),
    mobileVisualPreset: inferMobileVisualPreset(tw.mobile.stackOrder, tw.mobile),
    mobileStackOrder: [...tw.mobile.stackOrder],
  }
}

export function overrideToAdminForm(override: TradingWindowTenantOverride): TradingWindowAdminFormState {
  return {
    tenantPresetId: override.tenantPresetId,
    profileId: override.profileId,
    htsChart: override.htsGrid.chart,
    htsBook: override.htsGrid.orderBook,
    htsOrder: override.htsGrid.orderPanel,
    orderBookDensity: override.orderBookDensity,
    orderFormMode: override.orderFormMode,
    dockTabStyle: override.dockTabStyle,
    dockHeight: override.dockHeight,
    mobileStackMode: override.mobileStackMode,
    mobileVisualPreset: override.mobileVisualPreset,
    mobileStackOrder: [...override.mobileStackOrder],
  }
}

export function adminFormToOverride(form: TradingWindowAdminFormState): TradingWindowTenantOverride {
  return {
    mockOnly: true,
    tenantPresetId: form.tenantPresetId,
    updatedAtMs: Date.now(),
    profileId: form.profileId,
    htsGrid: {
      chart: clampHtsGridWeight(form.htsChart),
      orderBook: clampHtsGridWeight(form.htsBook),
      orderPanel: clampHtsGridWeight(form.htsOrder),
    },
    orderBookDensity: form.orderBookDensity,
    orderFormMode: form.orderFormMode,
    dockTabStyle: form.dockTabStyle,
    dockHeight: form.dockHeight,
    mobileStackMode: form.mobileStackMode,
    mobileVisualPreset: form.mobileVisualPreset,
    mobileStackOrder: normalizeStackOrder(form.mobileStackOrder),
  }
}

export function inferMobileStackMode(
  stack: TradingWindowPreset['mobile']['stackOrder'],
): MobileStackMode {
  const key = stack.join(',')
  if (key.includes('order') && stack.indexOf('order') < stack.indexOf('book')) {
    return 'order-first'
  }
  return 'standard'
}

function applyDensityChrome(
  preset: TradingWindowPreset,
  density: OrderBookDensityChrome,
): TradingWindowPreset['orderBook'] {
  const ob = { ...preset.orderBook }
  if (density === 'compact') {
    return { ...ob, density: 'compact', levelCount: 20, spreadHighlight: 'bold' }
  }
  if (density === 'futures-emphasis') {
    return { ...ob, density: 'compact', layout: 'compact-ladder', spreadHighlight: 'bold', levelCount: 20 }
  }
  if (density === 'standard') {
    return { ...ob, density: 'standard', spreadHighlight: 'bold' }
  }
  return ob
}

function applyFormChrome(
  preset: TradingWindowPreset,
  mode: OrderFormChromeMode,
): TradingWindowPreset['orderForm'] {
  const form = { ...preset.orderForm }
  if (mode === 'premium') {
    return { ...form, layout: 'vertical', advanced: 'collapsed', confirmModal: 'mock-only' }
  }
  if (mode === 'fast') {
    return {
      ...form,
      layout: 'ticket-compact',
      primaryAction: 'dual-buttons',
      advanced: 'always-visible',
      qtyInput: 'contracts',
    }
  }
  return { ...form, layout: 'vertical', advanced: 'accordion' }
}

function applyDockChrome(
  preset: TradingWindowPreset,
  tabStyle: DockTabStyleChrome,
  dockHeight: TradingWindowTenantOverride['dockHeight'],
): TradingWindowPreset['positionPanel'] {
  const pos = { ...preset.positionPanel, dockHeight }
  if (tabStyle === 'compact') {
    return { ...pos, defaultTab: 'open-orders', columnSet: 'pro' }
  }
  if (tabStyle === 'institutional') {
    return { ...pos, defaultTab: 'fills', columnSet: 'institutional', pnlEmphasis: 'muted' }
  }
  return { ...pos, defaultTab: 'positions', columnSet: 'retail', pnlEmphasis: 'standard' }
}

export function applyTradingWindowTenantOverride(
  tenantPreset: TenantWhitelabelPreset,
  override: TradingWindowTenantOverride | null | undefined,
  base?: { preset: TradingWindowPreset; htsGrid: TradingWindowHtsGrid },
): {
  preset: TradingWindowPreset
  htsGrid: TradingWindowTenantOverride['htsGrid']
  hasOverride: boolean
  driftFromBuiltin: boolean
} {
  const builtinPreset = base?.preset ?? resolveTradingWindowPreset(tenantPreset)
  const builtinGrid = base?.htsGrid ?? getHtsGridForProfile(builtinPreset.profileId)
  if (!override || override.tenantPresetId !== tenantPreset.id) {
    return {
      preset: builtinPreset,
      htsGrid: builtinGrid,
      hasOverride: false,
      driftFromBuiltin: false,
    }
  }

  const profileBase = getTradingWindowProfile(override.profileId)
  const mobileFromVisual = applyMobileVisualPreset(override.mobileVisualPreset)
  const merged: TradingWindowPreset = {
    ...profileBase,
    orderBook: applyDensityChrome(profileBase, override.orderBookDensity),
    orderForm: applyFormChrome(profileBase, override.orderFormMode),
    positionPanel: applyDockChrome(profileBase, override.dockTabStyle, override.dockHeight),
    mobile: {
      ...profileBase.mobile,
      ...mobileFromVisual,
      stackOrder: normalizeStackOrder(override.mobileStackOrder),
    },
  }

  const driftFromBuiltin =
    merged.profileId !== builtinPreset.profileId ||
    override.htsGrid.chart !== builtinGrid.chart ||
    override.orderBookDensity !== resolveOrderBookDensityChrome(builtinPreset)

  return {
    preset: merged,
    htsGrid: { ...override.htsGrid },
    hasOverride: true,
    driftFromBuiltin,
  }
}

/** Backfill Phase 5 fields on legacy override blobs. */
export function coerceTradingWindowTenantOverride(
  row: unknown,
): TradingWindowTenantOverride | null {
  if (!row || typeof row !== 'object') return null
  const o = row as Partial<TradingWindowTenantOverride>
  if (o.mockOnly !== true || !o.tenantPresetId?.trim()) return null
  const form = adminFormFromTenantId(o.tenantPresetId, null)
  const merged: TradingWindowTenantOverride = {
    ...adminFormToOverride({
      ...form,
      profileId: o.profileId ?? form.profileId,
      htsChart: o.htsGrid?.chart ?? form.htsChart,
      htsBook: o.htsGrid?.orderBook ?? form.htsBook,
      htsOrder: o.htsGrid?.orderPanel ?? form.htsOrder,
      orderBookDensity: o.orderBookDensity ?? form.orderBookDensity,
      orderFormMode: o.orderFormMode ?? form.orderFormMode,
      dockTabStyle: o.dockTabStyle ?? form.dockTabStyle,
      dockHeight: o.dockHeight ?? form.dockHeight,
      mobileStackMode: o.mobileStackMode ?? form.mobileStackMode,
      mobileVisualPreset: o.mobileVisualPreset ?? form.mobileVisualPreset,
      mobileStackOrder: o.mobileStackOrder
        ? normalizeStackOrder(o.mobileStackOrder)
        : form.mobileStackOrder,
    }),
    updatedAtMs: o.updatedAtMs ?? Date.now(),
  }
  return merged
}

export function validateTradingWindowTenantOverride(
  row: unknown,
): { ok: boolean; message: string } {
  if (!row || typeof row !== 'object') return { ok: false, message: 'not an object' }
  const o = row as TradingWindowTenantOverride
  if (o.mockOnly !== true) return { ok: false, message: 'mockOnly required' }
  if (!o.tenantPresetId?.trim()) return { ok: false, message: 'tenantPresetId required' }
  if (!o.htsGrid || o.htsGrid.chart < 1) return { ok: false, message: 'htsGrid invalid' }
  if (!MOBILE_STACK_MODES.includes(o.mobileStackMode)) {
    return { ok: false, message: 'mobileStackMode invalid' }
  }
  if (!MOBILE_VISUAL_PRESET_IDS.includes(o.mobileVisualPreset)) {
    return { ok: false, message: 'mobileVisualPreset invalid' }
  }
  if (!Array.isArray(o.mobileStackOrder) || o.mobileStackOrder.length < 3) {
    return { ok: false, message: 'mobileStackOrder invalid' }
  }
  return { ok: true, message: 'override valid' }
}

export function adminFormDriftsFromSaved(
  form: TradingWindowAdminFormState,
  saved: TradingWindowTenantOverride | null,
): boolean {
  if (!saved) {
    const baseline = adminFormFromTenantId(form.tenantPresetId, null)
    return JSON.stringify(form) !== JSON.stringify(baseline)
  }
  return JSON.stringify(adminFormToOverride(form)) !== JSON.stringify(saved)
}
