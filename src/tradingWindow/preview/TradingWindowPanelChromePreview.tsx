import type { TenantWhitelabelPreset } from '../../whitelabel/tenantPresetTypes'
import { resolveTradingWindowBundle } from '../resolveTradingWindowBundle'
import { formatPanelChromeSummary, summarizePanelChrome } from '../tradingWindowPanelChrome'

type Props = {
  preset: TenantWhitelabelPreset
}

const MODES = ['orderBook', 'orderForm', 'dock'] as const

export function TradingWindowPanelChromePreview({ preset }: Props) {
  const bundle = resolveTradingWindowBundle(preset)
  const tw = bundle.preset
  const summary = summarizePanelChrome(tw)

  return (
    <div
      className="rounded-md border border-so-border/50 bg-so-bg/60 p-2"
      data-testid="trading-window-panel-chrome-preview"
    >
      <p className="text-[10px] font-semibold text-so-fg">Panel chrome (mock)</p>
      <p className="mt-1 font-mono text-[10px] text-so-muted">{formatPanelChromeSummary(tw)}</p>
      <div className="mt-2 grid grid-cols-3 gap-1.5" aria-hidden>
        <PanelModeChip
          label="호가"
          value={summary.orderBookDensity}
          active={bundle.classNames.orderBook.includes('ute-twp-ob-chrome')}
        />
        <PanelModeChip
          label="주문"
          value={summary.orderFormMode}
          active={bundle.classNames.orderPanel.includes('ute-twp-form-chrome')}
        />
        <PanelModeChip
          label="도크"
          value={summary.dockTabStyle}
          active={bundle.classNames.dockPanel.includes('ute-twp-dock-tabs')}
        />
      </div>
      <p className="mt-1.5 text-[9px] text-so-muted">
        panels: {MODES.join(' · ')} · spread {summary.spreadHighlight}
      </p>
    </div>
  )
}

function PanelModeChip({
  label,
  value,
  active,
}: {
  label: string
  value: string
  active: boolean
}) {
  return (
    <div
      className={`rounded border px-1.5 py-1 text-center ${
        active ? 'border-so-accent/40 bg-so-accent/10' : 'border-so-border/50 bg-so-surface/40'
      }`}
    >
      <p className="text-[8px] uppercase tracking-wide text-so-muted">{label}</p>
      <p className="font-mono text-[9px] font-semibold text-so-fg">{value}</p>
    </div>
  )
}
