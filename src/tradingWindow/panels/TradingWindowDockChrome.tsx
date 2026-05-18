import type { ReactNode } from 'react'
import type { TradingWindowBundle } from '../tradingWindowPresetTypes'

type Props = {
  bundle: TradingWindowBundle
  children: ReactNode
}

export function TradingWindowDockChrome({ bundle, children }: Props) {
  const { positionPanel } = bundle.preset

  return (
    <div
      className={`ute-twp-panel-chrome-root h-full min-h-0 flex flex-col ${bundle.classNames.positionPanel} ${bundle.classNames.dockPanel}`}
      data-ute-twp-panel="dock"
      data-ute-twp-dock-default-tab={positionPanel.defaultTab}
    >
      {positionPanel.showMarginBlock ? (
        <div className="ute-twp-dock-margin-strip shrink-0 border-b border-so-border/50 bg-so-surface-2/80 px-2 py-0.5 text-[9px] text-so-muted">
          Margin block · mock
        </div>
      ) : null}
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  )
}
