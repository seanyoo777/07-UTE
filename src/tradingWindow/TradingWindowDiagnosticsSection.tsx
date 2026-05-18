import { shouldEnableTradingWindowPresets } from '../config/layoutUiGuards'
import { useEffectiveLayoutFlags } from '../hooks/useEffectiveLayoutFlags'
import { useTenantWhitelabelStore } from '../whitelabel/tenantWhitelabelStore'
import { buildTradingWindowOverrideDiagnostics } from './override/tradingWindowOverrideDiagnostics'
import { useTradingWindowOverrideStore } from './override/tradingWindowOverrideStore'
import { resolveTradingWindowBundle } from './resolveTradingWindowBundle'
import { formatHtsGridSummary } from './tradingWindowHtsGridCss'
import { formatPanelChromeSummary } from './tradingWindowPanelChrome'
import { validateTradingWindowPreset } from './validateTradingWindowPreset'

export function TradingWindowDiagnosticsSection() {
  const layoutFlags = useEffectiveLayoutFlags()
  const preset = useTenantWhitelabelStore((s) => s.preset)
  const revision = useTradingWindowOverrideStore((s) => s.revision)
  if (!shouldEnableTradingWindowPresets(layoutFlags)) return null

  void revision
  const bundle = resolveTradingWindowBundle(preset)
  const overrideDiag = buildTradingWindowOverrideDiagnostics(preset)
  const tw = bundle.preset
  const valid = validateTradingWindowPreset(tw)

  return (
    <div
      className="rounded-md border border-so-border/50 bg-so-bg/60 p-2 text-[10px]"
      data-testid="trading-window-diagnostics"
    >
      <p className="font-semibold text-so-fg">Trading window preset (mock)</p>
      <p className="mt-1 text-so-muted">
        profile <span className="font-mono text-so-fg">{tw.profileId}</span> · {tw.label}
      </p>
      <p className="text-so-muted">
        book={tw.orderBook.layout} · chart={tw.chartLayout.toolbar} · dock=
        {tw.positionPanel.dockHeight}
      </p>
      <p className="text-so-muted" data-testid="trading-window-hts-grid-diagnostics">
        hts grid · {formatHtsGridSummary(bundle.htsGrid)}
      </p>
      <p className="text-so-muted" data-testid="trading-window-panel-chrome-diagnostics">
        panels · {formatPanelChromeSummary(tw)}
      </p>
      <p className="text-so-muted">
        mobile stack <span className="font-mono text-so-fg">{tw.mobile.stackOrder.join(' → ')}</span>
      </p>
      <p className="text-so-muted">valid={valid.ok ? 'yes' : 'no'} · mockOnly</p>
      <p className="text-so-muted" data-testid="trading-window-override-diagnostics">
        overrides={overrideDiag.activeOverrideCount} · active=
        {overrideDiag.hasActiveTenantOverride ? 'yes' : 'no'} · drift=
        {overrideDiag.presetDrift ? 'yes' : 'no'} · preview=
        {overrideDiag.previewing ? 'yes' : 'no'}
      </p>
    </div>
  )
}
