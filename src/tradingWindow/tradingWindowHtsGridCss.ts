import type { CSSProperties } from 'react'
import type { TradingWindowHtsGrid } from './tradingWindowPresetTypes'

export const UTE_TWP_HTS_GRID_ACTIVE_CLASS = 'ute-twp-hts-grid-active'

export function htsGridTotalWeight(grid: TradingWindowHtsGrid): number {
  return grid.chart + grid.orderBook + grid.orderPanel
}

export function htsGridSharePercent(grid: TradingWindowHtsGrid, slot: keyof TradingWindowHtsGrid): number {
  const total = htsGridTotalWeight(grid)
  if (total <= 0) return 0
  return Math.round((grid[slot] / total) * 100)
}

export function buildHtsGridDataAttributes(grid: TradingWindowHtsGrid): Record<string, string> {
  return {
    'data-ute-twp-grid-chart': String(grid.chart),
    'data-ute-twp-grid-book': String(grid.orderBook),
    'data-ute-twp-grid-order': String(grid.orderPanel),
    'data-ute-twp-grid-total': String(htsGridTotalWeight(grid)),
  }
}

export function buildHtsGridInlineStyle(
  grid: TradingWindowHtsGrid,
  widths: { bookPx: number; orderPx: number },
): CSSProperties {
  return {
    ['--ute-twp-flex-chart' as string]: String(grid.chart),
    ['--ute-twp-flex-book' as string]: String(grid.orderBook),
    ['--ute-twp-flex-order' as string]: String(grid.orderPanel),
    ['--ute-twp-book-width' as string]: `${widths.bookPx}px`,
    ['--ute-twp-order-width' as string]: `${widths.orderPx}px`,
  }
}

export function formatHtsGridSummary(grid: TradingWindowHtsGrid): string {
  return `chart ${grid.chart} · book ${grid.orderBook} · order ${grid.orderPanel} (${htsGridSharePercent(grid, 'chart')}/${htsGridSharePercent(grid, 'orderBook')}/${htsGridSharePercent(grid, 'orderPanel')}%)`
}
