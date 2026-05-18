import type { TenantWhitelabelPreset } from '../../whitelabel/tenantPresetTypes'
import { MARKET_CONTEXT_PRESETS, listMarketContextPresetIds } from '../market/marketContextRegistry'
import { useMarketContextStore } from '../market/marketContextStore'
import { slotLabel } from '../mobile/mobileStackWireframe'
import { buildHtsWireframeModel, buildMobileWireframeModel } from '../mobile/mobileStackWireframe'
import { useTradingWindowOverrideStore } from '../override/tradingWindowOverrideStore'
import { resolveTradingWindowBundle } from '../resolveTradingWindowBundle'

type Props = {
  preset: TenantWhitelabelPreset
}

export function TradingWindowMarketWireframeStrip({ preset }: Props) {
  const overrideRevision = useTradingWindowOverrideStore((s) => s.revision)
  const marketRevision = useMarketContextStore((s) => s.revision)
  const previewContextId = useMarketContextStore((s) => s.previewContextId)
  void overrideRevision
  void marketRevision

  const ids = listMarketContextPresetIds()

  return (
    <div
      className="rounded-md border border-so-border/50 bg-so-bg/60 p-2"
      data-testid="trading-window-market-wireframe-strip"
    >
      <p className="text-[10px] font-semibold text-so-fg">Market context wireframes (mock)</p>
      <p className="mt-0.5 text-[9px] text-so-muted">
        Per-market layout · Binance / HTS / Robinhood style labels
        {previewContextId ? ` · preview=${previewContextId}` : ''}
      </p>

      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {ids.map((marketContextId) => {
          const ctx = MARKET_CONTEXT_PRESETS[marketContextId]
          const bundle = resolveTradingWindowBundle(preset, { marketContextId })
          const hts = buildHtsWireframeModel(bundle.htsGrid, {
            dockOpen: true,
            orderBookEmphasis: bundle.preset.orderBook.density === 'compact',
          })
          const mobile = buildMobileWireframeModel(
            bundle.preset.mobile.stackOrder,
            bundle.preset.mobile.bottomSheetOrder,
            bundle.preset.mobile.thumbZone,
          )
          const domOn = bundle.preset.chartLayout.domStrip !== 'hidden'

          return (
            <article
              key={marketContextId}
              className={`rounded border p-1.5 ${
                previewContextId === marketContextId
                  ? 'border-violet-500/40 bg-violet-500/5'
                  : 'border-so-border/50'
              }`}
              data-ute-twp-market-wireframe={marketContextId}
            >
              <p className="text-[9px] font-semibold text-so-fg">{ctx.label}</p>
              <p className="text-[8px] text-violet-300/90">{ctx.uiStyleLabel}</p>
              <p className="mt-0.5 font-mono text-[7px] text-so-muted">
                dom={bundle.dataAttributes['data-ute-twp-dom-visibility']} · book=
                {bundle.dataAttributes['data-ute-twp-orderbook-emphasis']}
              </p>

              <div className="mt-1 flex h-10 overflow-hidden rounded border border-so-border/50">
                <div className="bg-so-accent/20" style={{ flex: hts.chart }} title="chart" />
                <div
                  className={`bg-so-surface-2 ${hts.orderBookEmphasis ? 'ring-1 ring-so-warn/30' : ''}`}
                  style={{ flex: hts.book }}
                />
                <div className="bg-so-accent-2/25" style={{ flex: hts.order }} />
                {domOn ? (
                  <div className="w-2 shrink-0 bg-so-warn/20" title="DOM" />
                ) : null}
              </div>
              <div className="mt-0.5 h-2 rounded-sm bg-so-surface/70 text-center text-[6px] text-so-muted">
                dock · {bundle.preset.positionPanel.defaultTab}
              </div>

              <div className="mt-1 flex h-8 flex-col overflow-hidden rounded border border-so-border/40">
                {mobile.stackOrder.slice(0, 3).map((slot) => (
                  <div
                    key={slot}
                    className="flex-1 border-b border-so-border/20 text-center text-[6px] leading-none text-so-muted last:border-0"
                  >
                    {slotLabel(slot)}
                  </div>
                ))}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
