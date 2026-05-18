import type {
  ChartLayoutPreset,
  MobileStackSlotId,
  MobileTradingPreset,
  OrderBookPreset,
  PositionPanelPreset,
} from '../tradingWindowPresetTypes'

export const MARKET_CONTEXT_PRESET_IDS = [
  'crypto-futures',
  'global-futures',
  'korea-futures',
  'us-stocks',
  'scalping',
  'swing',
] as const

export type MarketContextPresetId = (typeof MARKET_CONTEXT_PRESET_IDS)[number]

export type MarketContextUiStyle = 'binance' | 'hts' | 'robinhood'

export type ChartEmphasis = 'price' | 'volume' | 'studies'

export type OrderBookEmphasis = 'depth' | 'spread' | 'ladder'

export type DomVisibility = ChartLayoutPreset['domStrip']

export type MarketContextPreset = {
  mockOnly: true
  id: MarketContextPresetId
  label: string
  uiStyle: MarketContextUiStyle
  /** Display label e.g. "Binance style" */
  uiStyleLabel: string
  chartEmphasis: ChartEmphasis
  orderBookEmphasis: OrderBookEmphasis
  domVisibility: DomVisibility
  dockDefaultTab: PositionPanelPreset['defaultTab']
  density: OrderBookPreset['density']
  mobileLayout: {
    stackOrder?: MobileStackSlotId[]
    bottomSheetOrder?: MobileTradingPreset['bottomSheetOrder']
    thumbZone?: MobileTradingPreset['thumbZone']
    compactTicker?: boolean
  }
  /** Optional HTS flex weight nudges (mock layout only). */
  gridNudge?: {
    chart?: number
    orderBook?: number
    orderPanel?: number
  }
}
