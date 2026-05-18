import type { ReactNode } from 'react'
import type { TradingWindowBundle } from '../tradingWindowPresetTypes'

type Props = {
  bundle: TradingWindowBundle
  children: ReactNode
}

export function TradingWindowOrderBookChrome({ bundle, children }: Props) {
  const { spreadHighlight } = bundle.preset.orderBook
  const showSpreadBadge = spreadHighlight !== 'none'

  return (
    <div
      className={`ute-twp-panel-chrome-root h-full min-h-0 ${bundle.classNames.orderBook}`}
      data-ute-twp-panel="orderbook"
    >
      {showSpreadBadge ? (
        <div className="ute-twp-spread-badge-row flex shrink-0 items-center justify-end gap-1 border-b border-so-border/40 px-2 py-0.5">
          <span
            className={`ute-twp-spread-badge rounded px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide ${
              spreadHighlight === 'bold'
                ? 'bg-so-warn/20 text-so-warn'
                : 'bg-so-surface-2 text-so-muted'
            }`}
            data-testid="ute-twp-spread-badge"
          >
            spread · {spreadHighlight}
          </span>
          <span className="text-[9px] text-so-muted">mock</span>
        </div>
      ) : null}
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  )
}
