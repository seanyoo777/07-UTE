import type {
  OrderBookPreset,
  PositionPanelPreset,
  TradingWindowPreset,
  TradingWindowProfileId,
} from './tradingWindowPresetTypes'

export type OrderBookDensityChrome = 'compact' | 'standard' | 'futures-emphasis'

export type OrderFormChromeMode = 'premium' | 'standard' | 'fast'

export type DockTabStyleChrome = 'compact' | 'elevated' | 'institutional'

export type TradingWindowPanelChromeSummary = {
  orderBookDensity: OrderBookDensityChrome
  orderFormMode: OrderFormChromeMode
  dockTabStyle: DockTabStyleChrome
  spreadHighlight: OrderBookPreset['spreadHighlight']
  dockHeight: PositionPanelPreset['dockHeight']
}

export function resolveOrderBookDensityChrome(
  preset: TradingWindowPreset,
): OrderBookDensityChrome {
  if (preset.profileId === 'global-futures') return 'futures-emphasis'
  if (preset.orderBook.density === 'compact') return 'compact'
  return 'standard'
}

export function resolveOrderFormChromeMode(preset: TradingWindowPreset): OrderFormChromeMode {
  if (preset.profileId === 'private-bank') return 'premium'
  if (preset.profileId === 'global-futures') return 'fast'
  return 'standard'
}

export function resolveDockTabStyleChrome(preset: TradingWindowPreset): DockTabStyleChrome {
  if (preset.positionPanel.columnSet === 'institutional') return 'institutional'
  if (preset.profileId === 'global-futures' || preset.profileId === 'mobile-mts') {
    return 'compact'
  }
  if (preset.profileId === 'private-bank' || preset.profileId === 'broker-hts') {
    return 'elevated'
  }
  return 'elevated'
}

export function buildPanelChromeClassNames(preset: TradingWindowPreset): {
  orderBook: string
  orderPanel: string
  positionPanel: string
  dockPanel: string
} {
  const ob = preset.orderBook
  const form = preset.orderForm
  const pos = preset.positionPanel
  const densityChrome = resolveOrderBookDensityChrome(preset)
  const formChrome = resolveOrderFormChromeMode(preset)
  const dockTabs = resolveDockTabStyleChrome(preset)

  return {
    orderBook: [
      'ute-twp-panel-orderbook',
      `ute-twp-ob-${ob.layout}`,
      `ute-twp-ob-density-${ob.density}`,
      `ute-twp-ob-chrome-${densityChrome}`,
      `ute-twp-ob-spread-${ob.spreadHighlight}`,
    ].join(' '),
    orderPanel: [
      'ute-twp-panel-orderform',
      `ute-twp-form-${form.layout}`,
      `ute-twp-form-action-${form.primaryAction}`,
      `ute-twp-form-chrome-${formChrome}`,
    ].join(' '),
    positionPanel: [
      'ute-twp-panel-position',
      `ute-twp-pos-col-${pos.columnSet}`,
      `ute-twp-pos-pnl-${pos.pnlEmphasis}`,
      `ute-twp-pos-tab-${pos.defaultTab}`,
      pos.showMarginBlock ? 'ute-twp-pos-margin-on' : 'ute-twp-pos-margin-off',
    ].join(' '),
    dockPanel: [
      'ute-twp-panel-dock',
      `ute-twp-dock-tabs-${dockTabs}`,
      `ute-twp-dock-h-${pos.dockHeight}`,
    ].join(' '),
  }
}

export function buildPanelChromeDataAttributes(
  preset: TradingWindowPreset,
): Record<string, string> {
  const summary = summarizePanelChrome(preset)
  return {
    'data-ute-twp-panel-book-density': summary.orderBookDensity,
    'data-ute-twp-panel-form-mode': summary.orderFormMode,
    'data-ute-twp-panel-dock-tabs': summary.dockTabStyle,
    'data-ute-twp-panel-spread': summary.spreadHighlight,
  }
}

export function summarizePanelChrome(preset: TradingWindowPreset): TradingWindowPanelChromeSummary {
  return {
    orderBookDensity: resolveOrderBookDensityChrome(preset),
    orderFormMode: resolveOrderFormChromeMode(preset),
    dockTabStyle: resolveDockTabStyleChrome(preset),
    spreadHighlight: preset.orderBook.spreadHighlight,
    dockHeight: preset.positionPanel.dockHeight,
  }
}

export function formatPanelChromeSummary(preset: TradingWindowPreset): string {
  const s = summarizePanelChrome(preset)
  return `book ${s.orderBookDensity} · form ${s.orderFormMode} · dock ${s.dockTabStyle} (${s.dockHeight})`
}

export function mapPositionDefaultTab(
  tab: PositionPanelPreset['defaultTab'],
): 'positions' | 'open' | 'fills' | 'orders' {
  switch (tab) {
    case 'open-orders':
      return 'open'
    case 'fills':
      return 'fills'
    case 'history':
      return 'orders'
    default:
      return 'positions'
  }
}

export function panelChromeExpectationsForProfile(
  profileId: TradingWindowProfileId,
): Partial<TradingWindowPanelChromeSummary> {
  switch (profileId) {
    case 'private-bank':
      return { orderBookDensity: 'standard', orderFormMode: 'premium', dockTabStyle: 'elevated' }
    case 'broker-hts':
      return { orderBookDensity: 'standard', orderFormMode: 'standard', dockTabStyle: 'elevated' }
    case 'global-futures':
      return {
        orderBookDensity: 'futures-emphasis',
        orderFormMode: 'fast',
        dockTabStyle: 'compact',
      }
    default:
      return {}
  }
}
