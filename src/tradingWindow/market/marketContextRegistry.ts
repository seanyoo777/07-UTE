import type { MarketContextPreset, MarketContextPresetId } from './marketContextPresetTypes'

const BINANCE: Pick<MarketContextPreset, 'uiStyle' | 'uiStyleLabel'> = {
  uiStyle: 'binance',
  uiStyleLabel: 'Binance style',
}

const HTS: Pick<MarketContextPreset, 'uiStyle' | 'uiStyleLabel'> = {
  uiStyle: 'hts',
  uiStyleLabel: 'HTS style',
}

const ROBINHOOD: Pick<MarketContextPreset, 'uiStyle' | 'uiStyleLabel'> = {
  uiStyle: 'robinhood',
  uiStyleLabel: 'Robinhood style',
}

export const MARKET_CONTEXT_PRESETS: Record<MarketContextPresetId, MarketContextPreset> = {
  'crypto-futures': {
    mockOnly: true,
    id: 'crypto-futures',
    label: 'Crypto futures',
    ...BINANCE,
    chartEmphasis: 'volume',
    orderBookEmphasis: 'depth',
    domVisibility: 'side',
    dockDefaultTab: 'open-orders',
    density: 'compact',
    mobileLayout: {
      stackOrder: ['ticker', 'chart', 'order', 'book', 'history'],
      bottomSheetOrder: 'half',
      thumbZone: 'right',
      compactTicker: true,
    },
    gridNudge: { orderBook: 1 },
  },
  'global-futures': {
    mockOnly: true,
    id: 'global-futures',
    label: 'Global futures',
    ...HTS,
    chartEmphasis: 'price',
    orderBookEmphasis: 'ladder',
    domVisibility: 'bottom',
    dockDefaultTab: 'positions',
    density: 'compact',
    mobileLayout: {
      stackOrder: ['ticker', 'chart', 'book', 'order', 'history'],
      bottomSheetOrder: 'half',
      thumbZone: 'balanced',
    },
    gridNudge: { chart: 1 },
  },
  'korea-futures': {
    mockOnly: true,
    id: 'korea-futures',
    label: 'Korea futures',
    ...HTS,
    chartEmphasis: 'studies',
    orderBookEmphasis: 'ladder',
    domVisibility: 'bottom',
    dockDefaultTab: 'fills',
    density: 'compact',
    mobileLayout: {
      stackOrder: ['ticker', 'chart', 'book', 'order', 'history'],
      bottomSheetOrder: 'off',
      thumbZone: 'left',
    },
  },
  'us-stocks': {
    mockOnly: true,
    id: 'us-stocks',
    label: 'US stocks',
    ...ROBINHOOD,
    chartEmphasis: 'price',
    orderBookEmphasis: 'spread',
    domVisibility: 'hidden',
    dockDefaultTab: 'positions',
    density: 'standard',
    mobileLayout: {
      stackOrder: ['ticker', 'chart', 'order', 'history', 'book'],
      bottomSheetOrder: 'full',
      thumbZone: 'balanced',
      compactTicker: true,
    },
  },
  scalping: {
    mockOnly: true,
    id: 'scalping',
    label: 'Scalping',
    ...BINANCE,
    chartEmphasis: 'volume',
    orderBookEmphasis: 'spread',
    domVisibility: 'side',
    dockDefaultTab: 'open-orders',
    density: 'compact',
    mobileLayout: {
      stackOrder: ['ticker', 'chart', 'order', 'book', 'history'],
      bottomSheetOrder: 'off',
      thumbZone: 'right',
    },
    gridNudge: { chart: 1, orderPanel: 1 },
  },
  swing: {
    mockOnly: true,
    id: 'swing',
    label: 'Swing',
    ...ROBINHOOD,
    chartEmphasis: 'studies',
    orderBookEmphasis: 'spread',
    domVisibility: 'hidden',
    dockDefaultTab: 'history',
    density: 'airy',
    mobileLayout: {
      stackOrder: ['ticker', 'chart', 'history', 'order', 'book'],
      bottomSheetOrder: 'off',
      thumbZone: 'balanced',
    },
  },
}

export function getMarketContextPreset(id: MarketContextPresetId): MarketContextPreset {
  return MARKET_CONTEXT_PRESETS[id]
}

export function listMarketContextPresetIds(): MarketContextPresetId[] {
  return [...Object.keys(MARKET_CONTEXT_PRESETS)] as MarketContextPresetId[]
}
