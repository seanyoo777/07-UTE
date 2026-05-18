import type { TradingWindowHtsGrid, TradingWindowProfileId } from '../tradingWindowPresetTypes'
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
}

export type TradingWindowOverridesStorageBlob = {
  v: typeof TRADING_WINDOW_OVERRIDES_STORAGE_VERSION
  mockOnly: true
  overrides: Record<string, TradingWindowTenantOverride>
}
