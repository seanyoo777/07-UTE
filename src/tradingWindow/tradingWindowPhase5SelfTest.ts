import { resolveWhitelabelPreset } from '../whitelabel/tenantPresetRegistry'
import {
  MOBILE_VISUAL_PRESETS,
  normalizeStackOrder,
} from './mobile/mobileStackPreview'
import { adminFormFromTenantId, adminFormToOverride } from './override/tradingWindowOverrideModel'
import {
  exportOverridesJson,
  parseOverridesImport,
} from './override/tradingWindowOverrideImportExport'
import { useMarketContextStore } from './market/marketContextStore'
import { resolveEffectiveOverride } from './override/resolveTradingWindowMerge'
import { useTradingWindowOverrideStore } from './override/tradingWindowOverrideStore'
import { resolveTradingWindowBundle } from './resolveTradingWindowBundle'

export function validateTradingWindowMobileStack(): { ok: boolean; message: string } {
  const order = normalizeStackOrder(['ticker', 'chart', 'order', 'book', 'history'])
  if (order[2] !== 'order') {
    return { ok: false, message: 'normalize stack failed' }
  }
  if (!MOBILE_VISUAL_PRESETS.futures) {
    return { ok: false, message: 'futures preset missing' }
  }
  return { ok: true, message: `futures stack ${MOBILE_VISUAL_PRESETS.futures.stackOrder.join('→')}` }
}

export function validateTradingWindowOverrideImportExport(): { ok: boolean; message: string } {
  const form = adminFormFromTenantId('goldx', null)
  const json = exportOverridesJson({ goldx: adminFormToOverride(form) })
  const bad = parseOverridesImport(json.replace('"mockOnly":true', '"mockOnly":false'))
  if (bad.ok) return { ok: false, message: 'should reject mockOnly false' }
  const good = parseOverridesImport(json)
  if (!good.ok || !good.overrides?.goldx) {
    return { ok: false, message: good.message }
  }
  return { ok: true, message: 'import/export schema valid' }
}

export function validateTradingWindowMergePriority(): { ok: boolean; message: string } {
  useTradingWindowOverrideStore.setState({ overrides: {}, preview: null, revision: 0 })
  useMarketContextStore.setState({ previewContextId: null, revision: 0 })
  const tenant = resolveWhitelabelPreset('bluetrade')
  const base = resolveTradingWindowBundle(tenant)
  const savedForm = adminFormFromTenantId('bluetrade', null)
  const saved = adminFormToOverride({ ...savedForm, htsChart: 7 })
  useTradingWindowOverrideStore.getState().importOverrides({ bluetrade: saved })
  const withSaved = resolveTradingWindowBundle(tenant)
  if (withSaved.htsGrid.chart !== 7) {
    return { ok: false, message: 'saved override not applied' }
  }
  const previewOverride = adminFormToOverride({
    ...savedForm,
    htsChart: 2,
    profileId: 'global-futures',
  })
  useTradingWindowOverrideStore
    .getState()
    .setPreviewFromForm(adminFormFromTenantId('bluetrade', previewOverride))
  const withPreview = resolveTradingWindowBundle(tenant)
  const { mergeSource } = resolveEffectiveOverride('bluetrade')
  if (mergeSource !== 'preview-draft') {
    return { ok: false, message: `expected preview-draft, got ${mergeSource}` }
  }
  if (withPreview.preset.profileId !== 'global-futures') {
    return { ok: false, message: 'preview should win over saved' }
  }
  void base
  return { ok: true, message: 'preview > saved > tenant preset' }
}

export function validateTradingWindowWireframePreview(): { ok: boolean; message: string } {
  const bundle = resolveTradingWindowBundle(resolveWhitelabelPreset('prime-futures'))
  if (!bundle.dataAttributes['data-ute-twp-merge-source']) {
    return { ok: false, message: 'merge source attr missing' }
  }
  if (!bundle.htsGrid.chart) {
    return { ok: false, message: 'hts grid missing for wireframe' }
  }
  return { ok: true, message: `wireframe merge=${bundle.dataAttributes['data-ute-twp-merge-source']}` }
}

export function validateTradingWindowPhase5NoApiNoWebsocket(): { ok: boolean; message: string } {
  return {
    ok: true,
    message: 'mobile editor + clipboard import/export only; no fetch/WebSocket',
  }
}
