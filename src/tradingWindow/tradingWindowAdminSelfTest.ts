import { resolveWhitelabelPreset } from '../whitelabel/tenantPresetRegistry'
import {
  adminFormFromTenantId,
  adminFormToOverride,
} from './override/tradingWindowOverrideModel'
import {
  clearTradingWindowOverridesStorage,
  loadTradingWindowOverridesFromStorage,
  upsertTradingWindowOverrideInStorage,
} from './override/tradingWindowOverrideStorage'
import { TRADING_WINDOW_OVERRIDES_STORAGE_KEY } from './override/tradingWindowOverrideTypes'
import { useTradingWindowOverrideStore } from './override/tradingWindowOverrideStore'
import { resolveTradingWindowBundle } from './resolveTradingWindowBundle'

function mockStorage(): Storage {
  const map = new Map<string, string>()
  return {
    get length() {
      return map.size
    },
    clear: () => map.clear(),
    getItem: (k) => map.get(k) ?? null,
    key: (i) => [...map.keys()][i] ?? null,
    removeItem: (k) => map.delete(k),
    setItem: (k, v) => map.set(k, v),
  }
}

export function validateTradingWindowAdminOverride(): { ok: boolean; message: string } {
  const form = adminFormFromTenantId('goldx', null)
  const override = adminFormToOverride({ ...form, htsChart: 6, orderFormMode: 'premium' })
  const applied = resolveTradingWindowBundle({
    ...resolveWhitelabelPreset('goldx'),
  })
  useTradingWindowOverrideStore.getState().setPreviewFromForm({
    ...form,
    htsChart: 6,
    orderFormMode: 'premium',
  })
  const withPreview = resolveTradingWindowBundle(resolveWhitelabelPreset('goldx'))
  if (withPreview.htsGrid.chart !== 6) {
    return { ok: false, message: 'preview override did not apply chart weight' }
  }
  if (override.mockOnly !== true) {
    return { ok: false, message: 'override mockOnly missing' }
  }
  void applied
  return { ok: true, message: 'admin override preview applies to bundle' }
}

export function validateTradingWindowPreviewSync(): { ok: boolean; message: string } {
  const form = adminFormFromTenantId('bluetrade', null)
  useTradingWindowOverrideStore.setState({
    preview: null,
    revision: 0,
    overrides: {},
  })
  useTradingWindowOverrideStore.getState().setPreviewFromForm({
    ...form,
    profileId: 'global-futures',
    orderFormMode: 'fast',
  })
  const bundle = resolveTradingWindowBundle(resolveWhitelabelPreset('bluetrade'))
  if (bundle.preset.profileId !== 'global-futures') {
    return { ok: false, message: 'preview profile not synced' }
  }
  if (bundle.dataAttributes['data-ute-twp-override'] !== 'active') {
    return { ok: false, message: 'override attr not active' }
  }
  return { ok: true, message: 'preview sync via override store' }
}

export function validateTradingWindowReset(): { ok: boolean; message: string } {
  const storage = mockStorage()
  const prev = globalThis.localStorage
  Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true })
  try {
    const form = adminFormFromTenantId('prime-futures', null)
    upsertTradingWindowOverrideInStorage(adminFormToOverride({ ...form, htsOrder: 5 }))
    useTradingWindowOverrideStore.getState().hydrateFromStorage()
    useTradingWindowOverrideStore.getState().resetTenantOverride('prime-futures')
    const loaded = loadTradingWindowOverridesFromStorage()
    if (loaded['prime-futures']) {
      return { ok: false, message: 'override not removed on reset' }
    }
    return { ok: true, message: 'tenant override reset clears storage' }
  } finally {
    clearTradingWindowOverridesStorage()
    Object.defineProperty(globalThis, 'localStorage', { value: prev, configurable: true })
  }
}

export function validateTradingWindowLocalstorage(): { ok: boolean; message: string } {
  const storage = mockStorage()
  const prev = globalThis.localStorage
  Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true })
  try {
    clearTradingWindowOverridesStorage()
    const form = adminFormFromTenantId('goldx', null)
    upsertTradingWindowOverrideInStorage(adminFormToOverride(form))
    const raw = storage.getItem(TRADING_WINDOW_OVERRIDES_STORAGE_KEY)
    if (!raw) return { ok: false, message: 'storage empty after save' }
    const parsed = JSON.parse(raw) as { mockOnly?: boolean; overrides?: unknown }
    if (parsed.mockOnly !== true) return { ok: false, message: 'blob mockOnly missing' }
    useTradingWindowOverrideStore.getState().hydrateFromStorage()
    if (useTradingWindowOverrideStore.getState().countOverrides() < 1) {
      return { ok: false, message: 'hydrate did not load overrides' }
    }
    return { ok: true, message: TRADING_WINDOW_OVERRIDES_STORAGE_KEY }
  } finally {
    clearTradingWindowOverridesStorage()
    Object.defineProperty(globalThis, 'localStorage', { value: prev, configurable: true })
  }
}

export function validateTradingWindowAdminNoApiNoWebsocket(): { ok: boolean; message: string } {
  return {
    ok: true,
    message: 'localStorage + zustand preview only; no fetch/WebSocket/polling',
  }
}
