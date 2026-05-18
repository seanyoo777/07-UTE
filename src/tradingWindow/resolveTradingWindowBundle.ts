import type { TenantWhitelabelPreset } from '../whitelabel/tenantPresetTypes'
import { applyTradingWindowTenantOverride } from './override/tradingWindowOverrideModel'
import { useTradingWindowOverrideStore } from './override/tradingWindowOverrideStore'
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
  meta: { hasOverride: boolean; driftFromBuiltin: boolean },
): Record<string, string> {
  return {
    ...buildHtsGridDataAttributes(htsGrid),
    ...buildPanelChromeDataAttributes(preset),
    'data-ute-twp': preset.profileId,
    'data-ute-twp-mock-only': 'true',
    'data-ute-twp-override': meta.hasOverride ? 'active' : 'none',
    'data-ute-twp-override-drift': meta.driftFromBuiltin ? 'yes' : 'no',
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
  const override = useTradingWindowOverrideStore.getState().getOverrideForTenant(tenantPreset.id)
  const applied = applyTradingWindowTenantOverride(tenantPreset, override)
  const preset = applied.preset
  const htsGrid = applied.htsGrid
  return {
    mockOnly: true,
    preset,
    htsGrid,
    classNames: buildClassNames(preset),
    dataAttributes: buildDataAttributes(preset, htsGrid, {
      hasOverride: applied.hasOverride,
      driftFromBuiltin: applied.driftFromBuiltin,
    }),
  }
}
