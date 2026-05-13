/** localStorage 키 (스키마 변경 시 v2, v3 …) */
export const PRO_LAYOUT_STORAGE_KEY = 'utx-pro-layout-v1'

export const PRO_LAYOUT_DEFAULTS = {
  /** 좌측 마켓 사이드바 (카테고리 + 심볼) */
  sidebarPx: 240,
  /** 호가창 (중앙 chart 옆) */
  bookPx: 280,
  /** 우측 통합 주문창 */
  orderPx: 340,
  /** 하단 dock (포지션·미체결·체결·주문내역) */
  dockPx: 220,
} as const

export const PRO_LAYOUT_LIMITS = {
  sidebar: { min: 180, max: 360 },
  book: { min: 220, max: 420 },
  order: { min: 280, max: 520 },
  dock: { min: 140, max: 480 },
  chartMinPx: 320,
} as const

export function clampLayout(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min
  return Math.max(min, Math.min(max, n))
}
