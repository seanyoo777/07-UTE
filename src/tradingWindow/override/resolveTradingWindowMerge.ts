import type { TenantWhitelabelPreset } from '../../whitelabel/tenantPresetTypes'
import { applyTradingWindowTenantOverride } from './tradingWindowOverrideModel'
import { useTradingWindowOverrideStore } from './tradingWindowOverrideStore'
import type { TradingWindowTenantOverride } from './tradingWindowOverrideTypes'
import type { TradingWindowHtsGrid, TradingWindowPreset } from '../tradingWindowPresetTypes'

/** Effective override layer applied to tenant preset (mock only). */
export type TradingWindowMergeSource = 'tenant-preset' | 'saved-override' | 'preview-draft'

export type TradingWindowMergeResult = {
  preset: TradingWindowPreset
  htsGrid: TradingWindowHtsGrid
  mergeSource: TradingWindowMergeSource
  hasSavedOverride: boolean
  hasPreviewDraft: boolean
  usedFallback: boolean
  driftFromBuiltin: boolean
}

/**
 * 3-tier merge priority:
 * 1. tenant preset (built-in / custom tenant tradingWindow)
 * 2. saved override (localStorage)
 * 3. preview draft (session) — highest
 */
export function resolveEffectiveOverride(
  tenantPresetId: string,
): { override: TradingWindowTenantOverride | null; mergeSource: TradingWindowMergeSource } {
  const store = useTradingWindowOverrideStore.getState()
  const saved = store.overrides[tenantPresetId] ?? null
  const preview =
    store.preview?.tenantPresetId === tenantPresetId ? store.preview.override : null

  if (preview) {
    return { override: preview, mergeSource: 'preview-draft' }
  }
  if (saved) {
    return { override: saved, mergeSource: 'saved-override' }
  }
  return { override: null, mergeSource: 'tenant-preset' }
}

export function resolveTradingWindowMerge(
  tenantPreset: TenantWhitelabelPreset,
): TradingWindowMergeResult {
  const { override, mergeSource } = resolveEffectiveOverride(tenantPreset.id)
  const store = useTradingWindowOverrideStore.getState()
  const applied = applyTradingWindowTenantOverride(tenantPreset, override)

  return {
    preset: applied.preset,
    htsGrid: applied.htsGrid,
    mergeSource,
    hasSavedOverride: Boolean(store.overrides[tenantPreset.id]),
    hasPreviewDraft: store.preview?.tenantPresetId === tenantPreset.id,
    usedFallback: !applied.hasOverride && mergeSource === 'tenant-preset',
    driftFromBuiltin: applied.driftFromBuiltin,
  }
}
