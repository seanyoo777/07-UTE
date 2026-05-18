import type { ReactNode } from 'react'
import type { TradingWindowBundle } from '../tradingWindowPresetTypes'
import { resolveOrderFormChromeMode } from '../tradingWindowPanelChrome'

type Props = {
  bundle: TradingWindowBundle
  children: ReactNode
}

export function TradingWindowOrderPanelChrome({ bundle, children }: Props) {
  const formMode = resolveOrderFormChromeMode(bundle.preset)
  const fastHint = formMode === 'fast'

  return (
    <div
      className={`ute-twp-panel-chrome-root h-full min-h-0 ${bundle.classNames.orderPanel}`}
      data-ute-twp-panel="orderform"
    >
      {fastHint ? (
        <div className="ute-twp-form-fast-strip shrink-0 border-b border-so-accent/25 bg-so-accent/5 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-so-accent">
          Quick order · mock
        </div>
      ) : null}
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  )
}
