import type { TenantWhitelabelPreset } from '../whitelabel/tenantPresetTypes'
import { resolveTradingWindowPreset } from './tradingWindowPresetRegistry'
import { buildHtsGridDataAttributes } from './tradingWindowHtsGridCss'
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
  const ob = preset.orderBook
  const ch = preset.chartLayout
  const dock = preset.positionPanel
  const form = preset.orderForm
  return {
    workspace: `ute-twp-root ute-twp-profile-${p}`,
    orderBook: `ute-twp-orderbook ute-twp-ob-${ob.layout} ute-twp-ob-density-${ob.density}`,
    chart: `ute-twp-chart ute-twp-chart-toolbar-${ch.toolbar}`,
    orderPanel: `ute-twp-orderform ute-twp-form-${form.layout}`,
    dock: `ute-twp-dock ute-twp-dock-${dock.dockHeight}`,
  }
}

function buildDataAttributes(
  preset: TradingWindowPreset,
  htsGrid: TradingWindowHtsGrid,
): Record<string, string> {
  return {
    ...buildHtsGridDataAttributes(htsGrid),
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
