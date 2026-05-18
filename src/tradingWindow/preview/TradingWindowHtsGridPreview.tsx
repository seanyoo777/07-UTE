import type { TenantWhitelabelPreset } from '../../whitelabel/tenantPresetTypes'
import { useTradingWindowOverrideStore } from '../override/tradingWindowOverrideStore'
import { resolveTradingWindowBundle } from '../resolveTradingWindowBundle'
import { formatHtsGridSummary } from '../tradingWindowHtsGridCss'

type Props = {
  preset: TenantWhitelabelPreset
}

export function TradingWindowHtsGridPreview({ preset }: Props) {
  const revision = useTradingWindowOverrideStore((s) => s.revision)
  const bundle = resolveTradingWindowBundle(preset)
  void revision
  const grid = bundle.htsGrid

  return (
    <div
      className="rounded-md border border-so-border/50 bg-so-bg/60 p-2"
      data-testid="trading-window-hts-grid-preview"
    >
      <p className="text-[10px] font-semibold text-so-fg">HTS grid weights (mock)</p>
      <p className="mt-1 font-mono text-[10px] text-so-muted">{formatHtsGridSummary(grid)}</p>
      <div
        className="mt-2 flex h-8 gap-0.5 overflow-hidden rounded border border-so-border/60"
        aria-hidden
      >
        <div
          className="bg-so-accent/30"
          style={{ flex: grid.chart }}
          title={`chart ${grid.chart}`}
        />
        <div
          className="bg-so-surface-2"
          style={{ flex: grid.orderBook }}
          title={`book ${grid.orderBook}`}
        />
        <div
          className="bg-so-accent-2/35"
          style={{ flex: grid.orderPanel }}
          title={`order ${grid.orderPanel}`}
        />
      </div>
    </div>
  )
}
