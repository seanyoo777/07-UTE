import type { TenantWhitelabelPreset } from '../whitelabel/tenantPresetTypes'
import type { MarketContextPresetId } from './market/marketContextPresetTypes'
import {
  resolveTradingWindowMerge,
  type ResolveTradingWindowMergeOptions,
} from './override/resolveTradingWindowMerge'
import { buildHtsGridDataAttributes } from './tradingWindowHtsGridCss'
import {
  buildPanelChromeClassNames,
  buildPanelChromeDataAttributes,
} from './tradingWindowPanelChrome'
import type {
  TradingWindowBundle,
  TradingWindowHtsGrid,
  TradingWindowPreset,
} from './tradingWindowPresetTypes'

export type ResolveTradingWindowBundleOptions = ResolveTradingWindowMergeOptions

function buildClassNames(preset: TradingWindowPreset, marketContextId: MarketContextPresetId | null) {
  const p = preset.profileId
  const ch = preset.chartLayout
  const panels = buildPanelChromeClassNames(preset)
  const dockHeight = preset.positionPanel.dockHeight
  const marketClass = marketContextId ? `ute-twp-market-${marketContextId}` : ''
  return {
    workspace: `ute-twp-root ute-twp-profile-${p} ${marketClass}`.trim(),
    chart: `ute-twp-chart ute-twp-chart-toolbar-${ch.toolbar} ute-twp-chart-dom-${ch.domStrip}`,
    orderBook: panels.orderBook,
    orderPanel: panels.orderPanel,
    positionPanel: panels.positionPanel,
    dockPanel: panels.dockPanel,
    dock: `ute-twp-dock ute-twp-dock-h-${dockHeight}`,
  }
}

function buildDataAttributes(
  preset: TradingWindowPreset,
  htsGrid: TradingWindowHtsGrid,
  meta: {
    mergeSource: string
    hasOverride: boolean
    driftFromBuiltin: boolean
    usedFallback: boolean
    marketContextId: MarketContextPresetId | null
    marketUiStyleLabel: string
    chartEmphasis: string
    orderBookEmphasis: string
    domVisibility: string
  },
): Record<string, string> {
  return {
    ...buildHtsGridDataAttributes(htsGrid),
    ...buildPanelChromeDataAttributes(preset),
    'data-ute-twp': preset.profileId,
    'data-ute-twp-mock-only': 'true',
    'data-ute-twp-override': meta.hasOverride ? 'active' : 'none',
    'data-ute-twp-override-drift': meta.driftFromBuiltin ? 'yes' : 'no',
    'data-ute-twp-merge-source': meta.mergeSource,
    'data-ute-twp-fallback': meta.usedFallback ? 'yes' : 'no',
    'data-ute-twp-market-context': meta.marketContextId ?? 'none',
    'data-ute-twp-market-style': meta.marketUiStyleLabel,
    'data-ute-twp-chart-emphasis': meta.chartEmphasis,
    'data-ute-twp-orderbook-emphasis': meta.orderBookEmphasis,
    'data-ute-twp-dom-visibility': meta.domVisibility,
    'data-ute-twp-orderbook-layout': preset.orderBook.layout,
    'data-ute-twp-chart-toolbar': preset.chartLayout.toolbar,
    'data-ute-twp-dock-height': preset.positionPanel.dockHeight,
    'data-ute-twp-dock-tab': preset.positionPanel.defaultTab,
    'data-ute-twp-orderform-layout': preset.orderForm.layout,
    'data-ute-twp-speed-order-state': preset.speedOrder.integrationState,
    'data-ute-twp-mobile-stack': preset.mobile.stackOrder.join(','),
  }
}

export function resolveTradingWindowBundle(
  tenantPreset: TenantWhitelabelPreset,
  options?: ResolveTradingWindowBundleOptions,
): TradingWindowBundle {
  const merged = resolveTradingWindowMerge(tenantPreset, options)
  const preset = merged.preset
  const htsGrid = merged.htsGrid
  const hasOverride =
    merged.mergeSource === 'saved-override' || merged.mergeSource === 'preview-draft'

  return {
    mockOnly: true,
    preset,
    htsGrid,
    classNames: buildClassNames(preset, merged.marketContextId),
    dataAttributes: buildDataAttributes(preset, htsGrid, {
      mergeSource: merged.mergeSource,
      hasOverride,
      driftFromBuiltin: merged.driftFromBuiltin,
      usedFallback: merged.usedFallback,
      marketContextId: merged.marketContextId,
      marketUiStyleLabel: merged.marketUiStyleLabel,
      chartEmphasis: merged.chartEmphasis,
      orderBookEmphasis: merged.orderBookEmphasis,
      domVisibility: merged.domVisibility,
    }),
  }
}
