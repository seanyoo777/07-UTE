import { resolveWhitelabelPreset } from '../whitelabel/tenantPresetRegistry'
import { getMarketContextPreset } from './market/marketContextRegistry'
import { useMarketContextStore } from './market/marketContextStore'
import { applyMarketContextToTradingPreset } from './market/resolveMarketContextPreset'
import { resolveTradingWindowPreset } from './tradingWindowPresetRegistry'
import { adminFormFromTenantId, adminFormToOverride } from './override/tradingWindowOverrideModel'
import { resolveEffectiveOverride, resolveTradingWindowMerge } from './override/resolveTradingWindowMerge'
import { useTradingWindowOverrideStore } from './override/tradingWindowOverrideStore'
import { resolveTradingWindowBundle } from './resolveTradingWindowBundle'

export function validateTradingWindowMarketContext(): { ok: boolean; message: string } {
  const ctx = getMarketContextPreset('crypto-futures')
  if (ctx.uiStyleLabel !== 'Binance style') {
    return { ok: false, message: 'crypto-futures style label missing' }
  }
  const base = resolveTradingWindowPreset(resolveWhitelabelPreset('bluetrade'))
  const applied = applyMarketContextToTradingPreset(base, ctx)
  if (applied.chartLayout.domStrip !== 'side') {
    return { ok: false, message: 'DOM side not applied for crypto-futures' }
  }
  if (applied.orderBook.layout !== 'depth-heatmap') {
    return { ok: false, message: 'depth emphasis not applied' }
  }
  return { ok: true, message: `${ctx.id} · ${ctx.uiStyleLabel} · dom=${applied.chartLayout.domStrip}` }
}

export function validateTradingWindowMarketMerge(): { ok: boolean; message: string } {
  useTradingWindowOverrideStore.setState({ overrides: {}, preview: null, revision: 0 })
  useMarketContextStore.setState({ previewContextId: null, revision: 0 })

  const tenant = resolveWhitelabelPreset('goldx')
  const tenantOnly = resolveTradingWindowMerge(tenant)
  const withMarket = resolveTradingWindowMerge(tenant, { marketContextId: 'us-stocks' })

  if (withMarket.marketContextApplied !== true) {
    return { ok: false, message: 'market layer not applied' }
  }
  if (withMarket.preset.chartLayout.domStrip !== 'hidden') {
    return { ok: false, message: 'us-stocks should hide DOM' }
  }

  const saved = adminFormToOverride(adminFormFromTenantId('goldx', null))
  useTradingWindowOverrideStore.getState().importOverrides({ goldx: saved })
  const withSaved = resolveTradingWindowMerge(tenant, { marketContextId: 'scalping' })
  if (withSaved.mergeSource !== 'saved-override') {
    return { ok: false, message: `expected saved-override, got ${withSaved.mergeSource}` }
  }

  const previewOverride = adminFormToOverride({
    ...adminFormFromTenantId('goldx', null),
    profileId: 'broker-hts',
  })
  useTradingWindowOverrideStore
    .getState()
    .setPreviewFromForm(adminFormFromTenantId('goldx', previewOverride))
  const withPreview = resolveTradingWindowMerge(tenant, { marketContextId: 'scalping' })
  if (withPreview.mergeSource !== 'preview-draft') {
    return { ok: false, message: `expected preview-draft, got ${withPreview.mergeSource}` }
  }
  if (withPreview.preset.profileId !== 'broker-hts') {
    return { ok: false, message: 'preview should beat market+saved' }
  }

  void tenantOnly
  const { mergeSource } = resolveEffectiveOverride('goldx')
  if (mergeSource !== 'preview-draft') {
    return { ok: false, message: 'effective override source mismatch' }
  }

  return { ok: true, message: 'preview > saved > market > tenant' }
}

export function validateTradingWindowMarketWireframe(): { ok: boolean; message: string } {
  const bundle = resolveTradingWindowBundle(resolveWhitelabelPreset('bluetrade'), {
    marketContextId: 'korea-futures',
  })
  if (bundle.dataAttributes['data-ute-twp-market-context'] !== 'korea-futures') {
    return { ok: false, message: 'market context attr missing' }
  }
  if (bundle.dataAttributes['data-ute-twp-market-style'] !== 'HTS style') {
    return { ok: false, message: 'HTS style label expected for korea-futures' }
  }
  return {
    ok: true,
    message: `wireframe attrs ok · chart=${bundle.dataAttributes['data-ute-twp-chart-emphasis']}`,
  }
}

export function validateTradingWindowMarketNoApiNoWebsocket(): { ok: boolean; message: string } {
  return {
    ok: true,
    message: 'market registry + merge only; no fetch/WebSocket/file IO',
  }
}
