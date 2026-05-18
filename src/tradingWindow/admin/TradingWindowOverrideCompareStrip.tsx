import { resolveWhitelabelPreset } from '../../whitelabel/tenantPresetRegistry'
import { formatHtsGridSummary } from '../tradingWindowHtsGridCss'
import { formatPanelChromeSummary } from '../tradingWindowPanelChrome'
import {
  adminFormToOverride,
  applyTradingWindowTenantOverride,
  type TradingWindowAdminFormState,
} from '../override/tradingWindowOverrideModel'

type Props = {
  form: TradingWindowAdminFormState
}

function Chip({ label, value, changed }: { label: string; value: string; changed?: boolean }) {
  return (
    <span
      className={`rounded border px-1.5 py-0.5 font-mono text-[8px] ${
        changed
          ? 'border-amber-500/50 bg-amber-500/10 text-amber-200'
          : 'border-so-border/50 bg-so-bg/40 text-so-muted'
      }`}
    >
      {label}:{value}
    </span>
  )
}

export function TradingWindowOverrideCompareStrip({ form }: Props) {
  const tenant = resolveWhitelabelPreset(form.tenantPresetId)
  const baseline = applyTradingWindowTenantOverride(tenant, null)
  const draft = applyTradingWindowTenantOverride(tenant, adminFormToOverride(form))

  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-lg border border-so-border/50 bg-so-bg/50 px-2 py-2"
      data-testid="trading-window-override-compare-strip"
    >
      <span className="text-[9px] font-semibold uppercase tracking-wide text-so-muted">Compare</span>
      <Chip label="profile" value={draft.preset.profileId} changed={draft.preset.profileId !== baseline.preset.profileId} />
      <Chip
        label="grid"
        value={`${draft.htsGrid.chart}/${draft.htsGrid.orderBook}/${draft.htsGrid.orderPanel}`}
        changed={formatHtsGridSummary(draft.htsGrid) !== formatHtsGridSummary(baseline.htsGrid)}
      />
      <Chip
        label="panels"
        value={formatPanelChromeSummary(draft.preset).slice(0, 28)}
        changed={formatPanelChromeSummary(draft.preset) !== formatPanelChromeSummary(baseline.preset)}
      />
      <Chip
        label="mobile"
        value={form.mobileStackMode}
        changed={draft.preset.mobile.stackOrder.join(',') !== baseline.preset.mobile.stackOrder.join(',')}
      />
    </div>
  )
}
