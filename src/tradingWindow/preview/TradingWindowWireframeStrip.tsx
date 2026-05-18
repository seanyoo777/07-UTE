import type { TenantWhitelabelPreset } from '../../whitelabel/tenantPresetTypes'
import { useMarketContextStore } from '../market/marketContextStore'
import { useTradingWindowOverrideStore } from '../override/tradingWindowOverrideStore'
import { resolveTradingWindowBundle } from '../resolveTradingWindowBundle'
import { slotLabel } from '../mobile/mobileStackWireframe'
import {
  buildHtsWireframeModel,
  buildMobileWireframeModel,
} from '../mobile/mobileStackWireframe'

type Props = {
  preset: TenantWhitelabelPreset
}

export function TradingWindowWireframeStrip({ preset }: Props) {
  const revision = useTradingWindowOverrideStore((s) => s.revision)
  const marketRevision = useMarketContextStore((s) => s.revision)
  const previewContextId = useMarketContextStore((s) => s.previewContextId)
  void revision
  void marketRevision
  const bundle = resolveTradingWindowBundle(
    preset,
    previewContextId ? { marketContextId: previewContextId } : undefined,
  )
  const hts = buildHtsWireframeModel(bundle.htsGrid, {
    dockOpen: true,
    orderBookEmphasis: bundle.preset.orderBook.density === 'compact',
  })
  const mobile = buildMobileWireframeModel(
    bundle.preset.mobile.stackOrder,
    bundle.preset.mobile.bottomSheetOrder,
    bundle.preset.mobile.thumbZone,
  )

  return (
    <div
      className="rounded-md border border-so-border/50 bg-so-bg/60 p-2"
      data-testid="trading-window-wireframe-strip"
    >
      <p className="text-[10px] font-semibold text-so-fg">Trading wireframes (mock)</p>
      <p className="mt-0.5 font-mono text-[9px] text-so-muted">
        merge={bundle.dataAttributes['data-ute-twp-merge-source'] ?? 'none'} · market=
        {bundle.dataAttributes['data-ute-twp-market-context'] ?? 'none'} · mobile{' '}
        {bundle.preset.mobile.stackOrder.join('→')}
      </p>

      <div className="mt-2 grid gap-2 md:grid-cols-2">
        <div>
          <p className="mb-1 text-[8px] uppercase tracking-wide text-so-muted">Desktop HTS</p>
          <div className="flex h-14 overflow-hidden rounded border border-so-border/60">
            <div
              className="bg-so-accent/25"
              style={{ flex: hts.chart }}
              title="chart"
            />
            <div
              className={`bg-so-surface-2 ${hts.orderBookEmphasis ? 'ring-1 ring-so-warn/40' : ''}`}
              style={{ flex: hts.book }}
              title="order book"
            />
            <div className="bg-so-accent-2/30" style={{ flex: hts.order }} title="order panel" />
          </div>
          {hts.dockOpen ? (
            <div className="mt-0.5 h-3 rounded-sm border border-so-border/40 bg-so-surface/80 text-center text-[7px] text-so-muted">
              dock
            </div>
          ) : null}
        </div>

        <div>
          <p className="mb-1 text-[8px] uppercase tracking-wide text-so-muted">Mobile MTS</p>
          <div className="flex h-14 flex-col overflow-hidden rounded border border-so-border/60">
            {mobile.stackOrder.map((slot) => (
              <div
                key={slot}
                className="min-h-0 flex-1 border-b border-so-border/30 bg-so-surface/40 text-center text-[7px] leading-tight text-so-muted last:border-0"
              >
                {slotLabel(slot)}
              </div>
            ))}
            <div
              className={`shrink-0 bg-so-accent/15 text-center text-[7px] text-so-accent ${
                mobile.bottomSheet === 'full' ? 'h-5' : mobile.bottomSheet === 'half' ? 'h-3' : 'h-1'
              }`}
            >
              sheet
            </div>
          </div>
          <p className="mt-0.5 text-[7px] text-so-muted">
            thumb {mobile.thumbZone} · safe {mobile.safeInsetPx}px
          </p>
        </div>
      </div>
    </div>
  )
}
