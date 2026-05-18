import { create } from 'zustand'
import type { TradingWindowTenantOverride } from './tradingWindowOverrideTypes'
import {
  adminFormToOverride,
  type TradingWindowAdminFormState,
} from './tradingWindowOverrideModel'
import {
  loadTradingWindowOverridesFromStorage,
  removeTradingWindowOverrideFromStorage,
  upsertTradingWindowOverrideInStorage,
  clearTradingWindowOverridesStorage,
} from './tradingWindowOverrideStorage'

type PreviewState = {
  tenantPresetId: string
  override: TradingWindowTenantOverride
} | null

type TradingWindowOverrideState = {
  overrides: Record<string, TradingWindowTenantOverride>
  hydrated: boolean
  preview: PreviewState
  revision: number
  hydrateFromStorage: () => void
  getOverrideForTenant: (tenantPresetId: string) => TradingWindowTenantOverride | null
  setPreviewFromForm: (form: TradingWindowAdminFormState) => void
  clearPreview: () => void
  saveOverrideFromForm: (form: TradingWindowAdminFormState) => TradingWindowTenantOverride
  resetTenantOverride: (tenantPresetId: string) => void
  resetAllOverrides: () => void
  countOverrides: () => number
}

export const useTradingWindowOverrideStore = create<TradingWindowOverrideState>()((set, get) => ({
  overrides: {},
  hydrated: false,
  preview: null,
  revision: 0,
  hydrateFromStorage: () => {
    const overrides = loadTradingWindowOverridesFromStorage()
    set({ overrides, hydrated: true, preview: null, revision: get().revision + 1 })
  },
  getOverrideForTenant: (tenantPresetId) => {
    const state = get()
    if (state.preview?.tenantPresetId === tenantPresetId) {
      return state.preview.override
    }
    return state.overrides[tenantPresetId] ?? null
  },
  setPreviewFromForm: (form) => {
    const override = adminFormToOverride(form)
    set({
      preview: { tenantPresetId: form.tenantPresetId, override },
      revision: get().revision + 1,
    })
  },
  clearPreview: () => {
    if (!get().preview) return
    set({ preview: null, revision: get().revision + 1 })
  },
  saveOverrideFromForm: (form) => {
    const override = adminFormToOverride(form)
    const overrides = upsertTradingWindowOverrideInStorage(override)
    set({
      overrides,
      preview: { tenantPresetId: form.tenantPresetId, override },
      revision: get().revision + 1,
    })
    return override
  },
  resetTenantOverride: (tenantPresetId) => {
    const overrides = removeTradingWindowOverrideFromStorage(tenantPresetId)
    const preview = get().preview
    set({
      overrides,
      preview: preview?.tenantPresetId === tenantPresetId ? null : preview,
      revision: get().revision + 1,
    })
  },
  resetAllOverrides: () => {
    clearTradingWindowOverridesStorage()
    set({ overrides: {}, preview: null, revision: get().revision + 1 })
  },
  countOverrides: () => Object.keys(get().overrides).length,
}))
