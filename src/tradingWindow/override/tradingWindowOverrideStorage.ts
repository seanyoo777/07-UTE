import type {
  TradingWindowOverridesStorageBlob,
  TradingWindowTenantOverride,
} from './tradingWindowOverrideTypes'
import {
  TRADING_WINDOW_OVERRIDES_STORAGE_KEY,
  TRADING_WINDOW_OVERRIDES_STORAGE_VERSION,
} from './tradingWindowOverrideTypes'
import {
  coerceTradingWindowTenantOverride,
  validateTradingWindowTenantOverride,
} from './tradingWindowOverrideModel'

export function loadTradingWindowOverridesFromStorage(): Record<string, TradingWindowTenantOverride> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(TRADING_WINDOW_OVERRIDES_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as TradingWindowOverridesStorageBlob
    if (parsed.v !== TRADING_WINDOW_OVERRIDES_STORAGE_VERSION || parsed.mockOnly !== true) {
      return {}
    }
    if (!parsed.overrides || typeof parsed.overrides !== 'object') return {}
    const out: Record<string, TradingWindowTenantOverride> = {}
    for (const [id, row] of Object.entries(parsed.overrides)) {
      const coerced = coerceTradingWindowTenantOverride(row)
      if (coerced && validateTradingWindowTenantOverride(coerced).ok) {
        out[id] = coerced
      }
    }
    return out
  } catch {
    return {}
  }
}

export function saveTradingWindowOverridesToStorage(
  overrides: Record<string, TradingWindowTenantOverride>,
): void {
  if (typeof window === 'undefined') return
  const blob: TradingWindowOverridesStorageBlob = {
    v: TRADING_WINDOW_OVERRIDES_STORAGE_VERSION,
    mockOnly: true,
    overrides,
  }
  window.localStorage.setItem(TRADING_WINDOW_OVERRIDES_STORAGE_KEY, JSON.stringify(blob))
}

export function upsertTradingWindowOverrideInStorage(
  override: TradingWindowTenantOverride,
): Record<string, TradingWindowTenantOverride> {
  const all = loadTradingWindowOverridesFromStorage()
  all[override.tenantPresetId] = override
  saveTradingWindowOverridesToStorage(all)
  return all
}

export function removeTradingWindowOverrideFromStorage(
  tenantPresetId: string,
): Record<string, TradingWindowTenantOverride> {
  const all = loadTradingWindowOverridesFromStorage()
  delete all[tenantPresetId]
  saveTradingWindowOverridesToStorage(all)
  return all
}

export function clearTradingWindowOverridesStorage(): void {
  saveTradingWindowOverridesToStorage({})
}
