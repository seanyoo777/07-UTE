import type { MarketId } from '../../markets/types'
import type { TenantWhitelabelPreset } from '../../whitelabel/tenantPresetTypes'
import { useMarketContextStore } from '../market/marketContextStore'
import { resolveTradingWindowBundle } from '../resolveTradingWindowBundle'
import { resolveEffectiveOverride } from './resolveTradingWindowMerge'
import { useTradingWindowOverrideStore } from './tradingWindowOverrideStore'
import { TRADING_WINDOW_OVERRIDES_STORAGE_KEY } from './tradingWindowOverrideTypes'

export type TradingWindowOverrideDiagnostics = {
  activeOverrideCount: number
  hasActiveTenantOverride: boolean
  presetDrift: boolean
  fallbackActive: boolean
  previewing: boolean
  storageKey: string
  mergeSource: string
  mobileStackMode: string
  mobileVisualPreset: string
  importExportReady: boolean
  previewDraftActive: boolean
  activeMarketContext: string
  marketUiStyleLabel: string
  chartEmphasis: string
  domEmphasis: string
  orderBookEmphasis: string
}

export function buildTradingWindowOverrideDiagnostics(
  tenantPreset: TenantWhitelabelPreset,
  marketId?: MarketId,
): TradingWindowOverrideDiagnostics {
  const store = useTradingWindowOverrideStore.getState()
  const marketStore = useMarketContextStore.getState()
  const effectiveMarketId = marketStore.getEffectiveContextId(marketId)
  const bundle = resolveTradingWindowBundle(tenantPreset, {
    marketId,
    marketContextId: marketStore.previewContextId ?? undefined,
  })
  const { mergeSource } = resolveEffectiveOverride(tenantPreset.id)
  const saved = store.overrides[tenantPreset.id]

  return {
    activeOverrideCount: store.countOverrides(),
    hasActiveTenantOverride: bundle.dataAttributes['data-ute-twp-override'] === 'active',
    presetDrift: bundle.dataAttributes['data-ute-twp-override-drift'] === 'yes',
    fallbackActive: bundle.dataAttributes['data-ute-twp-fallback'] === 'yes',
    previewing: store.preview?.tenantPresetId === tenantPreset.id,
    storageKey: TRADING_WINDOW_OVERRIDES_STORAGE_KEY,
    mergeSource: bundle.dataAttributes['data-ute-twp-merge-source'] ?? mergeSource,
    mobileStackMode: saved?.mobileStackMode ?? bundle.preset.mobile.stackOrder.join(','),
    mobileVisualPreset: saved?.mobileVisualPreset ?? '—',
    importExportReady: true,
    previewDraftActive: mergeSource === 'preview-draft',
    activeMarketContext: bundle.dataAttributes['data-ute-twp-market-context'] ?? effectiveMarketId,
    marketUiStyleLabel: bundle.dataAttributes['data-ute-twp-market-style'] ?? '—',
    chartEmphasis: bundle.dataAttributes['data-ute-twp-chart-emphasis'] ?? '—',
    domEmphasis: bundle.dataAttributes['data-ute-twp-dom-visibility'] ?? '—',
    orderBookEmphasis: bundle.dataAttributes['data-ute-twp-orderbook-emphasis'] ?? '—',
  }
}
