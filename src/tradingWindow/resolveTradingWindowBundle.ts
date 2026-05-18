import type { TenantWhitelabelPreset } from '../whitelabel/tenantPresetTypes'
import { resolveTradingWindowPreset } from './tradingWindowPresetRegistry'
import { buildHtsGridDataAttributes } from './tradingWindowHtsGridCss'
import {
  buildPanelChromeClassNames,
  buildPanelChromeDataAttributes,
} from './tradingWindowPanelChrome'
import type {
  TradingWindowBundle,
  TradingWindowHtsGrid,
  TradingWindowPreset,
  TradingWindowProfileId,
} from './tradingWindowPresetTypes'

const HTS_GRID_BY_PROFILE: Record<TradingWindowProfileId, TradingWindowHtsGrid> = {
  'private-bank': { chart: 5, orderBook: 2, orderPanel: 2 },
  'broker-hts': { chart: 4, orderBook: 2, orderPanel: 2 },
  'global-futures': { chart: 3, orderBook: 2, orderPanel: 3 },
  'institutional-desk': { chart: 4, orderBook: 3, orderPanel: 2 },
  'mobile-mts': { chart: 4, orderBook: 2, orderPanel: 2 },
}

function buildClassNames(preset: TradingWindowPreset) {
  const p = preset.profileId
  const ch = preset.chartLayout
  const panels = buildPanelChromeClassNames(preset)
  const dockHeight = preset.positionPanel.dockHeight
  return {
    workspace: `ute-twp-root ute-twp-profile-${p}`,
    chart: `ute-twp-chart ute-twp-chart-toolbar-${ch.toolbar}`,
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
): Record<string, string> {
  return {
    ...buildHtsGridDataAttributes(htsGrid),
    ...buildPanelChromeDataAttributes(preset),
    'data-ute-twp': preset.profileId,
    'data-ute-twp-mock-only': 'true',
    'data-ute-twp-orderbook-layout': preset.orderBook.layout,
    'data-ute-twp-chart-toolbar': preset.chartLayout.toolbar,
    'data-ute-twp-dock-height': preset.positionPanel.dockHeight,
    'data-ute-twp-orderform-layout': preset.orderForm.layout,
    'data-ute-twp-speed-order-state': preset.speedOrder.integrationState,
    'data-ute-twp-mobile-stack': preset.mobile.stackOrder.join(','),
  }
}

export function resolveTradingWindowBundle(
  tenantPreset: TenantWhitelabelPreset,
): TradingWindowBundle {
  const preset = resolveTradingWindowPreset(tenantPreset)
  const htsGrid = HTS_GRID_BY_PROFILE[preset.profileId]
  return {
    mockOnly: true,
    preset,
    htsGrid,
    classNames: buildClassNames(preset),
    dataAttributes: buildDataAttributes(preset, htsGrid),
  }
}
