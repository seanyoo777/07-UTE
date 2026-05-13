import type { ReactNode } from 'react'

type Props = {
  ticker: ReactNode
  chart: ReactNode
  orderBook: ReactNode
  orderPanel: ReactNode
  history: ReactNode
}

/**
 * 공통 트레이딩 화면 레이아웃 (05-SpeedOrder 패턴 일반화).
 *
 * 데스크탑 (lg+):
 *   ┌──────────────── ticker ────────────────┐
 *   │ chart (좌)  │ orderBook │ orderPanel   │
 *   │             │           │              │
 *   │             ├───────────┴──────────────┤
 *   │   history (full width)                 │
 *   └────────────────────────────────────────┘
 *
 * 모바일:
 *   세로 스택: ticker → chart → orderBook → orderPanel → history
 */
export function TradingLayout({ ticker, chart, orderBook, orderPanel, history }: Props) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-so-bg text-[13px] text-so-text">
      <div className="shrink-0">{ticker}</div>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 p-2 lg:grid-cols-[minmax(0,1fr)_280px_320px] lg:gap-3 lg:p-3">
        <div className="flex min-h-0 min-w-0 flex-col gap-2 lg:gap-3">
          <div className="min-h-[220px] min-w-0 flex-1">{chart}</div>
          <div className="min-h-[200px] shrink-0 lg:max-h-[260px]">{history}</div>
        </div>
        <div className="min-h-[280px] min-w-0">{orderBook}</div>
        <div className="min-h-0 min-w-0">{orderPanel}</div>
      </div>
    </div>
  )
}
