import type { MarketId } from '../../markets/types'
import { normalizeStackOrder } from '../mobile/mobileStackPreview'
import { clampHtsGridWeight } from '../tradingWindowHtsGridDefaults'
import type { TradingWindowHtsGrid, TradingWindowPreset } from '../tradingWindowPresetTypes'
import { getMarketContextPreset } from './marketContextRegistry'
import type { MarketContextPreset, MarketContextPresetId } from './marketContextPresetTypes'

export function resolveDefaultMarketContextId(marketId: MarketId): MarketContextPresetId {
  switch (marketId) {
    case 'crypto':
      return 'crypto-futures'
    case 'global-futures':
      return 'global-futures'
    case 'kr-futures':
      return 'korea-futures'
    case 'us-stock':
      return 'us-stocks'
    case 'kr-stock':
      return 'swing'
    default:
      return 'swing'
  }
}

export function applyMarketContextToTradingPreset(
  preset: TradingWindowPreset,
  ctx: MarketContextPreset,
): TradingWindowPreset {
  let orderBook = { ...preset.orderBook, density: ctx.density }
  if (ctx.orderBookEmphasis === 'depth') {
    orderBook = {
      ...orderBook,
      layout: 'depth-heatmap',
      spreadHighlight: 'bold',
      levelCount: 20,
    }
  } else if (ctx.orderBookEmphasis === 'ladder') {
    orderBook = {
      ...orderBook,
      layout: 'compact-ladder',
      spreadHighlight: 'bold',
      levelCount: 20,
    }
  } else {
    orderBook = {
      ...orderBook,
      layout: 'two-column',
      spreadHighlight: 'bold',
    }
  }

  let chartLayout = { ...preset.chartLayout, domStrip: ctx.domVisibility }
  if (ctx.chartEmphasis === 'volume') {
    chartLayout = { ...chartLayout, toolbar: 'pro', studies: 'badges-only', timeframeStrip: 'top' }
  } else if (ctx.chartEmphasis === 'studies') {
    chartLayout = { ...chartLayout, toolbar: 'standard', studies: 'expanded', timeframeStrip: 'top' }
  } else {
    chartLayout = { ...chartLayout, toolbar: 'minimal', studies: 'off', timeframeStrip: 'floating' }
  }

  const mobile = { ...preset.mobile }
  if (ctx.mobileLayout.stackOrder) {
    mobile.stackOrder = normalizeStackOrder(ctx.mobileLayout.stackOrder)
  }
  if (ctx.mobileLayout.bottomSheetOrder) {
    mobile.bottomSheetOrder = ctx.mobileLayout.bottomSheetOrder
  }
  if (ctx.mobileLayout.thumbZone) {
    mobile.thumbZone = ctx.mobileLayout.thumbZone
  }
  if (ctx.mobileLayout.compactTicker != null) {
    mobile.compactTicker = ctx.mobileLayout.compactTicker
  }

  return {
    ...preset,
    orderBook,
    chartLayout,
    positionPanel: { ...preset.positionPanel, defaultTab: ctx.dockDefaultTab },
    mobile,
  }
}

export function applyMarketContextToHtsGrid(
  grid: TradingWindowHtsGrid,
  ctx: MarketContextPreset,
): TradingWindowHtsGrid {
  const nudge = ctx.gridNudge
  if (!nudge) return grid
  return {
    chart: clampHtsGridWeight(grid.chart + (nudge.chart ?? 0)),
    orderBook: clampHtsGridWeight(grid.orderBook + (nudge.orderBook ?? 0)),
    orderPanel: clampHtsGridWeight(grid.orderPanel + (nudge.orderPanel ?? 0)),
  }
}

export function resolveMarketContextPreset(id: MarketContextPresetId): MarketContextPreset {
  return getMarketContextPreset(id)
}

export function applyMarketContextLayer(
  preset: TradingWindowPreset,
  htsGrid: TradingWindowHtsGrid,
  marketContextId: MarketContextPresetId,
): { preset: TradingWindowPreset; htsGrid: TradingWindowHtsGrid; ctx: MarketContextPreset } {
  const ctx = getMarketContextPreset(marketContextId)
  return {
    preset: applyMarketContextToTradingPreset(preset, ctx),
    htsGrid: applyMarketContextToHtsGrid(htsGrid, ctx),
    ctx,
  }
}
