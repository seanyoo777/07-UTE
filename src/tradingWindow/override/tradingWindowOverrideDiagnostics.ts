import type { TenantWhitelabelPreset } from '../../whitelabel/tenantPresetTypes'
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
}

export function buildTradingWindowOverrideDiagnostics(
  tenantPreset: TenantWhitelabelPreset,
): TradingWindowOverrideDiagnostics {
  const store = useTradingWindowOverrideStore.getState()
  const bundle = resolveTradingWindowBundle(tenantPreset)
  const { mergeSource } = resolveEffectiveOverride(tenantPreset.id)
  const saved = store.overrides[tenantPreset.id]

  return {
    activeOverrideCount: store.countOverrides(),
    hasActiveTenantOverride: bundle.dataAttributes['data-ute-twp-override'] === 'active',
    presetDrift: bundle.dataAttributes['data-ute-twp-override-drift'] === 'yes',
    fallbackActive: bundle.dataAttributes['data-ute-twp-fallback'] === 'yes',
    previewing: store.preview?.tenantPresetId === tenantPreset.id,
    storageKey: TRADING_WINDOW_OVERRIDES_STORAGE_KEY,
    mergeSource,
    mobileStackMode: saved?.mobileStackMode ?? bundle.preset.mobile.stackOrder.join(','),
    mobileVisualPreset: saved?.mobileVisualPreset ?? '—',
    importExportReady: true,
    previewDraftActive: mergeSource === 'preview-draft',
  }
}
