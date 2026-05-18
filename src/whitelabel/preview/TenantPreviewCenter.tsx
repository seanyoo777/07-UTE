import { useMemo } from 'react'
import { shouldEnableTradingWindowPresets } from '../../config/layoutUiGuards'
import { useEffectiveLayoutFlags } from '../../hooks/useEffectiveLayoutFlags'
import { PlatformMockOnlyBadge } from '../../platform/PlatformMockOnlyBadge'
import { TradingWindowHtsGridPreview } from '../../tradingWindow/preview/TradingWindowHtsGridPreview'
import { TradingWindowPanelChromePreview } from '../../tradingWindow/preview/TradingWindowPanelChromePreview'
import { useTenantWhitelabelStore } from '../tenantWhitelabelStore'
import { AdminSkinPreview } from './AdminSkinPreview'
import { BrandSummaryCard } from './BrandSummaryCard'
import { buildWhitelabelPreviewBundle } from './buildWhitelabelPreviewModel'
import { LayoutPreviewStrip } from './LayoutPreviewStrip'
import { MenuOrderPreview } from './MenuOrderPreview'
import type { TenantPreviewCardModel } from './whitelabelPreviewTypes'

function TenantPreviewCard({
  card,
  onSwitch,
}: {
  card: TenantPreviewCardModel
  onSwitch: (presetId: string) => void
}) {
  return (
    <article
      className={`flex flex-col rounded-lg border p-3 transition-colors ${
        card.isActive
          ? 'border-so-accent/50 bg-so-accent/5 ring-1 ring-so-accent/25'
          : 'border-so-border/60 bg-so-bg/50 hover:border-so-border'
      }`}
      data-ute-tenant-card={card.presetId}
      data-active={card.isActive ? 'true' : 'false'}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-md text-[10px] font-bold"
          style={{
            color: card.primaryColor,
            border: `1px solid ${card.primaryColor}55`,
            background: `${card.primaryColor}18`,
          }}
        >
          {card.brandName.slice(0, 1)}
        </div>
        {card.isActive ? (
          <span className="rounded bg-so-bid/15 px-1.5 py-0.5 text-[8px] font-bold uppercase text-so-bid">
            Selected
          </span>
        ) : null}
      </div>
      <h3 className="mt-2 text-sm font-semibold text-so-fg">{card.brandName}</h3>
      <p className="mt-0.5 font-mono text-[9px] text-so-muted">{card.presetId}</p>
      <p className="mt-1 text-[9px] text-so-muted">
        {card.menuPreset} · {card.adminPreset}
      </p>
      <div className="mt-2 flex gap-1">
        <span
          className="h-2 flex-1 rounded-sm"
          style={{ background: card.primaryColor }}
          title="primary"
        />
        <span
          className="h-2 flex-1 rounded-sm"
          style={{ background: card.accentColor }}
          title="accent"
        />
      </div>
      <button
        type="button"
        disabled={card.isActive}
        onClick={() => onSwitch(card.presetId)}
        className="mt-3 w-full rounded-md border border-so-border/60 bg-so-surface/60 px-2 py-1.5 text-[10px] font-semibold text-so-fg hover:bg-so-border/20 disabled:cursor-default disabled:opacity-50"
      >
        {card.isActive ? 'Current preset' : 'Switch preset'}
      </button>
    </article>
  )
}

/**
 * Operator-facing tenant brand preview — mock switch + layout/admin previews.
 */
export function TenantPreviewCenter() {
  const preset = useTenantWhitelabelStore((s) => s.preset)
  const setActivePresetId = useTenantWhitelabelStore((s) => s.setActivePresetId)
  const layoutFlags = useEffectiveLayoutFlags()
  const showTradingWindowGrid = shouldEnableTradingWindowPresets(layoutFlags)
  const bundle = useMemo(() => buildWhitelabelPreviewBundle(preset), [preset])

  return (
    <section
      className="space-y-4 rounded-xl border border-violet-500/25 bg-violet-500/5 p-4"
      aria-label="Tenant preview center"
      data-testid="tenant-preview-center"
      data-mock-only="true"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-so-fg">Tenant Preview Center</h2>
          <p className="mt-0.5 text-[10px] text-so-muted">
            Preview and switch white-label tenants — localStorage only, no API.
          </p>
        </div>
        <PlatformMockOnlyBadge />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {bundle.tenantCards.map((card) => (
          <TenantPreviewCard key={card.presetId} card={card} onSwitch={setActivePresetId} />
        ))}
      </div>

      <BrandSummaryCard summary={bundle.brandSummary} />
      <MenuOrderPreview menuPreset={preset.menu} />
      <LayoutPreviewStrip layout={bundle.layoutPreview} />
      {showTradingWindowGrid ? (
        <>
          <TradingWindowHtsGridPreview preset={preset} />
          <TradingWindowPanelChromePreview preset={preset} />
        </>
      ) : null}
      <AdminSkinPreview skins={bundle.adminSkins} />
    </section>
  )
}
