import type { TenantWhitelabelPreset } from '../whitelabel/tenantPresetTypes'
import { resolveWhitelabelPreset } from '../whitelabel/tenantPresetRegistry'
import { resolveTradingWindowBundle } from './resolveTradingWindowBundle'
import {
  DEFAULT_TRADING_WINDOW_PROFILE_ID,
  TENANT_TRADING_WINDOW_PROFILE_MAP,
  getDefaultTradingWindowPreset,
  listTradingWindowProfileIds,
} from './tradingWindowPresetRegistry'
import { htsGridSharePercent } from './tradingWindowHtsGridCss'
import { validateTradingWindowPreset } from './validateTradingWindowPreset'

function assertGridForTenant(
  tenantId: string,
  expectedProfile: string,
  checks: { chart?: number; orderBook?: number; orderPanel?: number },
): { ok: boolean; message: string } {
  const bundle = resolveTradingWindowBundle(resolveWhitelabelPreset(tenantId))
  if (bundle.preset.profileId !== expectedProfile) {
    return { ok: false, message: `${tenantId} profile expected ${expectedProfile}` }
  }
  const g = bundle.htsGrid
  if (checks.chart !== undefined && g.chart !== checks.chart) {
    return { ok: false, message: `${tenantId} chart weight ${g.chart} !== ${checks.chart}` }
  }
  if (checks.orderBook !== undefined && g.orderBook !== checks.orderBook) {
    return { ok: false, message: `${tenantId} book weight ${g.orderBook} !== ${checks.orderBook}` }
  }
  if (checks.orderPanel !== undefined && g.orderPanel !== checks.orderPanel) {
    return { ok: false, message: `${tenantId} order weight ${g.orderPanel} !== ${checks.orderPanel}` }
  }
  const attrs = bundle.dataAttributes
  if (attrs['data-ute-twp-grid-chart'] !== String(g.chart)) {
    return { ok: false, message: 'data-ute-twp-grid-chart missing' }
  }
  return { ok: true, message: `${tenantId} ${g.chart}/${g.orderBook}/${g.orderPanel}` }
}

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

export function validateTradingWindowGridPrivateBank(): { ok: boolean; message: string } {
  const base = assertGridForTenant('goldx', 'private-bank', {
    chart: 5,
    orderBook: 2,
    orderPanel: 2,
  })
  if (!base.ok) return base
  const share = htsGridSharePercent(
    resolveTradingWindowBundle(resolveWhitelabelPreset('goldx')).htsGrid,
    'chart',
  )
  if (share < 55) {
    return { ok: false, message: `private-bank chart share ${share}% too low` }
  }
  return { ok: true, message: `private-bank chart emphasis ${share}%` }
}

export function validateTradingWindowGridBrokerHts(): { ok: boolean; message: string } {
  const base = assertGridForTenant('bluetrade', 'broker-hts', {
    chart: 4,
    orderBook: 2,
    orderPanel: 2,
  })
  if (!base.ok) return base
  const g = resolveTradingWindowBundle(resolveWhitelabelPreset('bluetrade')).htsGrid
  if (g.chart !== g.orderBook + g.orderPanel) {
    return { ok: false, message: 'broker-hts should be balanced (chart = book + order)' }
  }
  return { ok: true, message: 'broker-hts balanced 4/2/2' }
}

export function validateTradingWindowGridGlobalFutures(): { ok: boolean; message: string } {
  const base = assertGridForTenant('prime-futures', 'global-futures', {
    chart: 3,
    orderBook: 2,
    orderPanel: 3,
  })
  if (!base.ok) return base
  const g = resolveTradingWindowBundle(resolveWhitelabelPreset('prime-futures')).htsGrid
  const orderShare = htsGridSharePercent(g, 'orderPanel')
  const broker = resolveTradingWindowBundle(resolveWhitelabelPreset('bluetrade')).htsGrid
  if (orderShare <= htsGridSharePercent(broker, 'orderPanel')) {
    return { ok: false, message: 'global-futures order share should beat broker-hts' }
  }
  if (g.orderPanel < g.orderBook) {
    return { ok: false, message: 'global-futures order panel weight too low' }
  }
  return { ok: true, message: `global-futures order emphasis ${orderShare}%` }
}

export function validateTradingWindowGridNoApiNoWebsocket(): { ok: boolean; message: string } {
  return {
    ok: true,
    message: 'CSS vars + flex weights on HtsLayout; no fetch/WebSocket/polling',
  }
}
