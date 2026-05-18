/** Trading window preset schema — UI-only; same engine, different HTS face (mock only). */

export const TRADING_WINDOW_SCHEMA_VERSION = '1.0.0' as const

export const TRADING_WINDOW_PROFILE_IDS = [
  'private-bank',
  'broker-hts',
  'global-futures',
  'institutional-desk',
  'mobile-mts',
] as const

export type TradingWindowProfileId = (typeof TRADING_WINDOW_PROFILE_IDS)[number]

export const MOBILE_STACK_SLOT_IDS = [
  'ticker',
  'chart',
  'book',
  'order',
  'history',
] as const

export type MobileStackSlotId = (typeof MOBILE_STACK_SLOT_IDS)[number]

export type OrderBookPreset = {
  layout: 'two-column' | 'center-ladder' | 'compact-ladder' | 'depth-heatmap'
  levelCount: 10 | 15 | 20
  spreadHighlight: 'subtle' | 'bold' | 'none'
  clickToFill: 'on' | 'off'
  density: 'compact' | 'standard' | 'airy'
}

export type ChartLayoutPreset = {
  toolbar: 'minimal' | 'standard' | 'pro'
  timeframeStrip: 'hidden' | 'top' | 'floating'
  domStrip: 'hidden' | 'bottom' | 'side'
  studies: 'off' | 'badges-only' | 'expanded'
  aspectPolicy: 'fill' | 'fixed-16-9'
}

export type PositionPanelPreset = {
  dockHeight: 'short' | 'standard' | 'tall'
  defaultTab: 'positions' | 'open-orders' | 'fills' | 'history'
  columnSet: 'retail' | 'pro' | 'institutional'
  pnlEmphasis: 'muted' | 'standard' | 'hero'
  showMarginBlock: boolean
}

export type OrderFormPreset = {
  layout: 'vertical' | 'horizontal-split' | 'ticket-compact' | 'institutional-ticket'
  primaryAction: 'buy-sell-tabs' | 'side-toggle' | 'dual-buttons'
  advanced: 'collapsed' | 'accordion' | 'always-visible'
  qtyInput: 'shares' | 'notional' | 'contracts'
  confirmModal: 'off' | 'mock-only'
}

export type SpeedOrderModuleLabels = {
  chart?: string
  orderBook?: string
  orderPanel?: string
  dock?: string
}

export type SpeedOrderPreset = {
  integrationState: 'planned' | 'in-progress' | 'integrated'
  moduleLabels: SpeedOrderModuleLabels
  hotkeysStrip: 'hidden' | 'mock'
  vendorSnapshot: 'off' | 'strip'
}

export type MobileTradingPreset = {
  stackOrder: MobileStackSlotId[]
  stickyHeader: 'ticker' | 'chart-toolbar' | 'none'
  bottomSheetOrder: 'off' | 'half' | 'full'
  thumbZone: 'left' | 'right' | 'balanced'
  compactTicker: boolean
}

export type TradingWindowPreset = {
  schemaVersion: typeof TRADING_WINDOW_SCHEMA_VERSION
  mockOnly: true
  profileId: TradingWindowProfileId
  label: string
  orderBook: OrderBookPreset
  chartLayout: ChartLayoutPreset
  positionPanel: PositionPanelPreset
  orderForm: OrderFormPreset
  speedOrder: SpeedOrderPreset
  mobile: MobileTradingPreset
}

export type TradingWindowHtsGrid = {
  chart: number
  orderBook: number
  orderPanel: number
}

export type TradingWindowBundle = {
  mockOnly: true
  preset: TradingWindowPreset
  htsGrid: TradingWindowHtsGrid
  classNames: {
    workspace: string
    orderBook: string
    chart: string
    orderPanel: string
    dock: string
  }
  dataAttributes: Record<string, string>
}
