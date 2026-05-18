import { PRO_LAYOUT_LIMITS, clampLayout } from '../config/proLayout'
import type { TradingWindowHtsGrid } from './tradingWindowPresetTypes'
import { htsGridTotalWeight } from './tradingWindowHtsGridCss'

const RESIZE_HANDLE_PX = 6
const RESIZE_HANDLE_COUNT = 2

/** Map flex weights → initial book/order px for resize handles (chart stays flex-1). */
export function seedHtsLayoutPixelsFromGrid(
  grid: TradingWindowHtsGrid,
  availablePx: number,
): { bookPx: number; orderPx: number } {
  const total = htsGridTotalWeight(grid)
  const bookShare = grid.orderBook / total
  const orderShare = grid.orderPanel / total
  const bookPx = clampLayout(
    Math.round(availablePx * bookShare),
    PRO_LAYOUT_LIMITS.book.min,
    PRO_LAYOUT_LIMITS.book.max,
  )
  const orderPx = clampLayout(
    Math.round(availablePx * orderShare),
    PRO_LAYOUT_LIMITS.order.min,
    PRO_LAYOUT_LIMITS.order.max,
  )
  return { bookPx, orderPx }
}

export function estimateHtsMainRowAvailablePx(
  rowWidthPx: number,
  sidebarPx: number,
  showSidebar: boolean,
): number {
  const sidebar = showSidebar ? sidebarPx : 0
  const handles = showSidebar
    ? RESIZE_HANDLE_PX * (RESIZE_HANDLE_COUNT + 1)
    : RESIZE_HANDLE_PX * RESIZE_HANDLE_COUNT
  return Math.max(480, rowWidthPx - sidebar - handles)
}
