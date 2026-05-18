import type {
  MobileStackSlotId,
  TradingWindowHtsGrid,
  TradingWindowProfileId,
} from '../tradingWindowPresetTypes'
import type { MobileVisualPresetId } from '../mobile/mobileStackPreview'
import type {
  DockTabStyleChrome,
  OrderBookDensityChrome,
  OrderFormChromeMode,
} from '../tradingWindowPanelChrome'

export const TRADING_WINDOW_OVERRIDES_STORAGE_KEY = 'ute.trading_window_overrides_v1'

export const TRADING_WINDOW_OVERRIDES_STORAGE_VERSION = '1.0.0' as const

export const MOBILE_STACK_MODES = ['standard', 'trading-first', 'order-first'] as const

export type MobileStackMode = (typeof MOBILE_STACK_MODES)[number]

export type TradingWindowTenantOverride = {
  mockOnly: true
  tenantPresetId: string
  updatedAtMs: number
  profileId: TradingWindowProfileId
  htsGrid: TradingWindowHtsGrid
  orderBookDensity: OrderBookDensityChrome
  orderFormMode: OrderFormChromeMode
  dockTabStyle: DockTabStyleChrome
  dockHeight: 'short' | 'standard' | 'tall'
  mobileStackMode: MobileStackMode
  /** Phase 5 visual editor preset (compact / balanced / futures / mobile-mts). */
  mobileVisualPreset: MobileVisualPresetId
  /** Custom stack order from drag mock editor. */
  mobileStackOrder: MobileStackSlotId[]
}

export type TradingWindowOverridesStorageBlob = {
  v: typeof TRADING_WINDOW_OVERRIDES_STORAGE_VERSION
  mockOnly: true
  overrides: Record<string, TradingWindowTenantOverride>
}
