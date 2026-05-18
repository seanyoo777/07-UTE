import { useCallback, useRef, type ReactNode } from 'react'
import { ResizeHandle } from '../components/layout/ResizeHandle'
import { PRO_LAYOUT_LIMITS } from '../config/proLayout'
import { usePersistedProLayout } from '../hooks/usePersistedProLayout'

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
}

const DOCK_SPLITTER_PX = 6

/**
 * HTS 데스크탑 레이아웃 (TGX-CEX 패턴을 6-카테고리 통합용으로 일반화).
 *
 * 가로 영역: [sidebar] | [chart flex] | [orderBook] | [orderPanel]
 * 세로 영역: 상단 가로영역 + 하단 dock (포지션/미체결/체결/주문내역)
 *
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
}: Props) {
  const layout = usePersistedProLayout()
  const mainRowRef = useRef<HTMLDivElement>(null)

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

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-so-bg text-[13px] text-so-text">
      <div
        ref={mainRowRef}
        className="flex min-h-[360px] flex-1 flex-row overflow-hidden"
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

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{chart}</div>

        <ResizeHandle
          orientation="vertical"
          label="호가창 너비"
          onDragDelta={layout.applyBookDelta}
          onDoubleClickReset={layout.resetBook}
        />

        <aside
          style={{ width: layout.bookPx }}
          className="flex min-h-0 min-w-0 shrink-0 flex-col overflow-hidden border-l border-so-border bg-so-bg/30"
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
          style={{ width: layout.orderPx }}
          className="flex min-h-0 min-w-0 shrink-0 flex-col overflow-hidden border-l border-so-border bg-so-bg/30"
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
