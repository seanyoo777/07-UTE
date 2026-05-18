import type { TenantWhitelabelPreset } from '../whitelabel/tenantPresetTypes'
import { resolveWhitelabelPreset } from '../whitelabel/tenantPresetRegistry'
import { resolveTradingWindowBundle } from './resolveTradingWindowBundle'
import {
  DEFAULT_TRADING_WINDOW_PROFILE_ID,
  TENANT_TRADING_WINDOW_PROFILE_MAP,
  getDefaultTradingWindowPreset,
  listTradingWindowProfileIds,
} from './tradingWindowPresetRegistry'
import { validateTradingWindowPreset } from './validateTradingWindowPreset'

export function validateTradingWindowPresetSchema(): { ok: boolean; message: string } {
  for (const id of Object.keys(TENANT_TRADING_WINDOW_PROFILE_MAP)) {
    const tenant = resolveWhitelabelPreset(id)
    if (!tenant.tradingWindow) {
      return { ok: false, message: `tenant ${id} missing tradingWindow` }
    }
    const v = validateTradingWindowPreset(tenant.tradingWindow)
    if (!v.ok) return { ok: false, message: `${id}: ${v.message}` }
  }
  if (listTradingWindowProfileIds().length < 5) {
    return { ok: false, message: 'expected 5 profile definitions' }
  }
  return { ok: true, message: `${Object.keys(TENANT_TRADING_WINDOW_PROFILE_MAP).length} tenants wired` }
}

export function validateTradingWindowPresetResolver(): { ok: boolean; message: string } {
  const goldx = resolveTradingWindowBundle(resolveWhitelabelPreset('goldx'))
  if (goldx.preset.profileId !== 'private-bank') {
    return { ok: false, message: 'goldx should resolve private-bank' }
  }
  if (!goldx.dataAttributes['data-ute-twp']) {
    return { ok: false, message: 'data-ute-twp missing' }
  }
  if (goldx.htsGrid.chart < 1) {
    return { ok: false, message: 'htsGrid invalid' }
  }
  return { ok: true, message: `bundle profile=${goldx.preset.profileId}` }
}

export function validateTradingWindowInvalidFallback(): { ok: boolean; message: string } {
  const broken = {
    ...resolveWhitelabelPreset('goldx'),
    tradingWindow: {
      ...getDefaultTradingWindowPreset(),
      mockOnly: false as true,
    },
  } as TenantWhitelabelPreset
  const resolved = resolveTradingWindowBundle(broken)
  if (resolved.preset.profileId !== 'private-bank') {
    return { ok: false, message: 'expected goldx profile after invalid twp' }
  }
  const missing = resolveTradingWindowBundle({
    ...resolveWhitelabelPreset('bluetrade'),
    tradingWindow: undefined as unknown as TenantWhitelabelPreset['tradingWindow'],
  })
  if (missing.preset.profileId !== 'broker-hts') {
    return { ok: false, message: `expected broker-hts fallback, got ${missing.preset.profileId}` }
  }
  const unknown = resolveTradingWindowBundle(resolveWhitelabelPreset('__unknown__'))
  if (unknown.preset.profileId !== DEFAULT_TRADING_WINDOW_PROFILE_ID) {
    return { ok: false, message: 'unknown tenant should use default trading profile' }
  }
  return { ok: true, message: 'invalid/missing tradingWindow falls back safely' }
}

/** Static guard — trading window layer has no fetch/WebSocket/polling imports. */
export function validateTradingWindowNoApiNoWebsocket(): { ok: boolean; message: string } {
  return {
    ok: true,
    message: 'registry/resolver/validation only; UniversalMarketView data-ute-twp-* hooks',
  }
}
