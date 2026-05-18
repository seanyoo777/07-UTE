import type { TenantWhitelabelPreset } from '../whitelabel/tenantPresetTypes'
import { MOCK_TRADING_WINDOW_PROFILES } from './mockTradingWindowProfiles'
import type { TradingWindowPreset, TradingWindowProfileId } from './tradingWindowPresetTypes'
import { validateTradingWindowPreset } from './validateTradingWindowPreset'

export const DEFAULT_TRADING_WINDOW_PROFILE_ID: TradingWindowProfileId = 'broker-hts'

/** Built-in tenant id → trading window profile (Phase 1). */
export const TENANT_TRADING_WINDOW_PROFILE_MAP: Record<string, TradingWindowProfileId> = {
  goldx: 'private-bank',
  bluetrade: 'broker-hts',
  'prime-futures': 'global-futures',
}

/** Registry candidates — not attached to mock tenants until Phase 6+. */
export const TRADING_WINDOW_REGISTRY_CANDIDATES: TradingWindowProfileId[] = [
  'institutional-desk',
  'mobile-mts',
]

export function listTradingWindowProfileIds(): TradingWindowProfileId[] {
  return Object.keys(MOCK_TRADING_WINDOW_PROFILES) as TradingWindowProfileId[]
}

export function getTradingWindowProfile(
  profileId: TradingWindowProfileId,
): TradingWindowPreset {
  return MOCK_TRADING_WINDOW_PROFILES[profileId]
}

export function getDefaultTradingWindowPreset(): TradingWindowPreset {
  return MOCK_TRADING_WINDOW_PROFILES[DEFAULT_TRADING_WINDOW_PROFILE_ID]
}

export function resolveTradingWindowProfileForTenantId(
  tenantPresetId: string,
): TradingWindowProfileId {
  return TENANT_TRADING_WINDOW_PROFILE_MAP[tenantPresetId] ?? DEFAULT_TRADING_WINDOW_PROFILE_ID
}

/** Resolve trading window from tenant preset; invalid/missing → default broker-hts profile. */
export function resolveTradingWindowPreset(
  tenantPreset: TenantWhitelabelPreset,
): TradingWindowPreset {
  if (tenantPreset.tradingWindow) {
    const v = validateTradingWindowPreset(tenantPreset.tradingWindow)
    if (v.ok) return tenantPreset.tradingWindow
  }
  const profileId = resolveTradingWindowProfileForTenantId(tenantPreset.id)
  return getTradingWindowProfile(profileId)
}

export type TenantWhitelabelPresetWithoutTradingWindow = Omit<
  TenantWhitelabelPreset,
  'tradingWindow'
>

export function attachTradingWindowToPreset(
  preset: TenantWhitelabelPresetWithoutTradingWindow & {
    tradingWindow?: TradingWindowPreset
  },
): TenantWhitelabelPreset {
  if (preset.tradingWindow && validateTradingWindowPreset(preset.tradingWindow).ok) {
    return { ...preset, tradingWindow: preset.tradingWindow }
  }
  const profileId = resolveTradingWindowProfileForTenantId(preset.id)
  return {
    ...preset,
    tradingWindow: getTradingWindowProfile(profileId),
  }
}
