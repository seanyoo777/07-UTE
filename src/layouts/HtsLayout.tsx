import { useCallback, useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { ResizeHandle } from '../components/layout/ResizeHandle'
import { PRO_LAYOUT_LIMITS } from '../config/proLayout'
import { usePersistedProLayout } from '../hooks/usePersistedProLayout'
import {
  estimateHtsMainRowAvailablePx,
  seedHtsLayoutPixelsFromGrid,
} from '../tradingWindow/seedHtsLayoutFromGrid'
import {
  UTE_TWP_HTS_GRID_ACTIVE_CLASS,
  buildHtsGridInlineStyle,
} from '../tradingWindow/tradingWindowHtsGridCss'
import type { TradingWindowHtsGrid } from '../tradingWindow/tradingWindowPresetTypes'

type Props = {
  sidebar: ReactNode
  chart: ReactNode
  orderBook: ReactNode
  orderPanel: ReactNode
  dock: ReactNode
  /** UI chrome — false hides market sidebar column + resize handle. */
  showSidebar?: boolean
  /** UI chrome — false hides bottom dock row + horizontal resize. */
  showDock?: boolean
  /** Trading-window flex weights (chart · book · order); null = legacy fixed px columns. */
  htsGrid?: TradingWindowHtsGrid | null
}

const DOCK_SPLITTER_PX = 6

function gridProfileKey(grid: TradingWindowHtsGrid): string {
  return `${grid.chart}:${grid.orderBook}:${grid.orderPanel}`
}

/**
 * HTS 데스크탑 레이아웃 (TGX-CEX 패턴을 6-카테고리 통합용으로 일반화).
 *
 * 가로 영역: [sidebar] | [chart flex] | [orderBook] | [orderPanel]
 * 세로 영역: 상단 가로영역 + 하단 dock (포지션/미체결/체결/주문내역)
 *
 * `htsGrid` set: CSS flex weights via `--ute-twp-flex-*` (Phase 2).
 * 각 영역 폭/높이는 ResizeHandle 로 드래그 조절 + localStorage 영속.
 */
export function HtsLayout({
  sidebar,
  chart,
  orderBook,
  orderPanel,
  dock,
  showSidebar = true,
  showDock = true,
  htsGrid = null,
}: Props) {
  const layout = usePersistedProLayout()
  const mainRowRef = useRef<HTMLDivElement>(null)
  const lastSeededGridKey = useRef<string | null>(null)

  const gridActive = htsGrid != null
  const gridKey = htsGrid ? gridProfileKey(htsGrid) : null

  useEffect(() => {
    if (!htsGrid || !gridKey) return
    if (lastSeededGridKey.current === gridKey) return

    const applySeed = () => {
      const rowW = mainRowRef.current?.getBoundingClientRect().width ?? 0
      if (rowW < 200) return false
      const available = estimateHtsMainRowAvailablePx(rowW, layout.sidebarPx, showSidebar)
      const { bookPx, orderPx } = seedHtsLayoutPixelsFromGrid(htsGrid, available)
      layout.seedBookOrderFromGrid(bookPx, orderPx)
      lastSeededGridKey.current = gridKey
      return true
    }

    if (!applySeed()) {
      const id = requestAnimationFrame(() => {
        applySeed()
      })
      return () => cancelAnimationFrame(id)
    }
    return undefined
  }, [htsGrid, gridKey, layout, showSidebar])

  const onDockDrag = useCallback(
    (d: number) => {
      const el = mainRowRef.current
      const mainH = el?.getBoundingClientRect().height ?? 0
      const maxDockPx = Math.min(
        PRO_LAYOUT_LIMITS.dock.max,
        Math.max(
          PRO_LAYOUT_LIMITS.dock.min,
          Math.floor(mainH + layout.dockPx - PRO_LAYOUT_LIMITS.chartMinPx - DOCK_SPLITTER_PX),
        ),
      )
      layout.applyDockDelta(d, maxDockPx)
    },
    [layout],
  )

  const rootStyle: CSSProperties | undefined = gridActive
    ? buildHtsGridInlineStyle(htsGrid, { bookPx: layout.bookPx, orderPx: layout.orderPx })
    : undefined

  return (
    <div
      className={`flex h-full min-h-0 flex-col overflow-hidden bg-so-bg text-[13px] text-so-text ${gridActive ? UTE_TWP_HTS_GRID_ACTIVE_CLASS : ''}`}
      style={rootStyle}
      data-ute-twp-hts-grid={gridActive ? 'active' : 'legacy'}
    >
      <div
        ref={mainRowRef}
        className={`ute-twp-hts-main-row flex min-h-[360px] flex-1 flex-row overflow-hidden ${gridActive ? 'ute-twp-hts-main-row--weighted' : ''}`}
      >
        {showSidebar ? (
          <>
            <aside
              style={{ width: layout.sidebarPx }}
              className="flex min-h-0 shrink-0 flex-col overflow-hidden"
            >
              {sidebar}
            </aside>
            <ResizeHandle
              orientation="vertical"
              label="시장 사이드바 너비"
              onDragDelta={layout.applySidebarDelta}
              onDoubleClickReset={layout.resetSidebar}
            />
          </>
        ) : null}

        <div
          className={`ute-twp-hts-chart-cell flex min-h-0 min-w-0 flex-col overflow-hidden ${gridActive ? '' : 'flex-1'}`}
        >
          {chart}
        </div>

        <ResizeHandle
          orientation="vertical"
          label="호가창 너비"
          onDragDelta={layout.applyBookDelta}
          onDoubleClickReset={layout.resetBook}
        />

        <aside
          style={gridActive ? undefined : { width: layout.bookPx }}
          className="ute-twp-hts-book-cell flex min-h-0 min-w-0 shrink-0 flex-col overflow-hidden border-l border-so-border bg-so-bg/30"
        >
          {orderBook}
        </aside>

        <ResizeHandle
          orientation="vertical"
          label="주문 패널 너비"
          onDragDelta={layout.applyOrderDelta}
          onDoubleClickReset={layout.resetOrder}
        />

        <aside
          style={gridActive ? undefined : { width: layout.orderPx }}
          className="ute-twp-hts-order-cell flex min-h-0 min-w-0 shrink-0 flex-col overflow-hidden border-l border-so-border bg-so-bg/30"
        >
          {orderPanel}
        </aside>
      </div>

      {showDock ? (
        <>
          <ResizeHandle
            orientation="horizontal"
            label="포지션·체결 도크 높이"
            onDragDelta={onDockDrag}
            onDoubleClickReset={layout.resetDock}
          />

          <div
            style={{ height: layout.dockPx }}
            className="flex w-full min-h-0 shrink-0 flex-col overflow-hidden"
          >
            {dock}
          </div>
        </>
      ) : null}
    </div>
  )
}
