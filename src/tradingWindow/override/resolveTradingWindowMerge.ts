import type { MarketId } from '../../markets/types'
import type { TenantWhitelabelPreset } from '../../whitelabel/tenantPresetTypes'
import { applyMarketContextLayer } from '../market/resolveMarketContextPreset'
import { useMarketContextStore } from '../market/marketContextStore'
import type { MarketContextPresetId } from '../market/marketContextPresetTypes'
import { resolveTradingWindowPreset } from '../tradingWindowPresetRegistry'
import { getHtsGridForProfile } from '../tradingWindowHtsGridDefaults'
import type { TradingWindowHtsGrid, TradingWindowPreset } from '../tradingWindowPresetTypes'
import { applyTradingWindowTenantOverride } from './tradingWindowOverrideModel'
import { useTradingWindowOverrideStore } from './tradingWindowOverrideStore'
import type { TradingWindowTenantOverride } from './tradingWindowOverrideTypes'

/** Override tier applied after market + tenant base (mock only). */
export type TradingWindowMergeSource =
  | 'tenant-preset'
  | 'market-preset'
  | 'saved-override'
  | 'preview-draft'

export type TradingWindowMergeResult = {
  preset: TradingWindowPreset
  htsGrid: TradingWindowHtsGrid
  mergeSource: TradingWindowMergeSource
  hasSavedOverride: boolean
  hasPreviewDraft: boolean
  usedFallback: boolean
  driftFromBuiltin: boolean
  marketContextId: MarketContextPresetId | null
  marketContextApplied: boolean
  marketUiStyleLabel: string
  chartEmphasis: string
  orderBookEmphasis: string
  domVisibility: string
}

export type ResolveTradingWindowMergeOptions = {
  marketId?: MarketId
  marketContextId?: MarketContextPresetId
}

function resolveMarketContextIdForMerge(
  options?: ResolveTradingWindowMergeOptions,
): MarketContextPresetId | null {
  if (options?.marketContextId) return options.marketContextId
  if (options?.marketId) {
    return useMarketContextStore.getState().getEffectiveContextId(options.marketId)
  }
  const preview = useMarketContextStore.getState().previewContextId
  return preview
}

/**
 * 4-tier merge priority:
 * 1. tenant preset (built-in / custom tenant tradingWindow)
 * 2. market context preset (route market or admin preview selection)
 * 3. saved override (localStorage)
 * 4. preview draft (session) — highest
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
  options?: ResolveTradingWindowMergeOptions,
): TradingWindowMergeResult {
  const { override, mergeSource } = resolveEffectiveOverride(tenantPreset.id)
  const store = useTradingWindowOverrideStore.getState()

  const tenantBuiltin = resolveTradingWindowPreset(tenantPreset)
  const tenantGrid = getHtsGridForProfile(tenantBuiltin.profileId)

  const marketContextId = resolveMarketContextIdForMerge(options)
  let basePreset = tenantBuiltin
  let baseGrid = tenantGrid
  let marketContextApplied = false
  let marketUiStyleLabel = '—'
  let chartEmphasis = '—'
  let orderBookEmphasis = '—'
  let domVisibility = '—'

  if (marketContextId) {
    const layered = applyMarketContextLayer(tenantBuiltin, tenantGrid, marketContextId)
    basePreset = layered.preset
    baseGrid = layered.htsGrid
    marketContextApplied = true
    marketUiStyleLabel = layered.ctx.uiStyleLabel
    chartEmphasis = layered.ctx.chartEmphasis
    orderBookEmphasis = layered.ctx.orderBookEmphasis
    domVisibility = layered.ctx.domVisibility
  }

  const applied = applyTradingWindowTenantOverride(tenantPreset, override, {
    preset: basePreset,
    htsGrid: baseGrid,
  })

  const effectiveMergeSource: TradingWindowMergeSource =
    mergeSource !== 'tenant-preset'
      ? mergeSource
      : marketContextApplied
        ? 'market-preset'
        : 'tenant-preset'

  return {
    preset: applied.preset,
    htsGrid: applied.htsGrid,
    mergeSource: effectiveMergeSource,
    hasSavedOverride: Boolean(store.overrides[tenantPreset.id]),
    hasPreviewDraft: store.preview?.tenantPresetId === tenantPreset.id,
    usedFallback: !applied.hasOverride && !marketContextApplied && mergeSource === 'tenant-preset',
    driftFromBuiltin: applied.driftFromBuiltin,
    marketContextId,
    marketContextApplied,
    marketUiStyleLabel,
    chartEmphasis,
    orderBookEmphasis,
    domVisibility,
  }
}
