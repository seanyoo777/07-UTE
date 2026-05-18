import { create } from 'zustand'
import { usePlatformTenantStore } from '../platform/platformTenantStore'
import { loadActivePresetIdFromConfig, saveActivePresetIdToConfig } from './activeConfigStorage'
import { applyTenantTheme } from './applyTenantTheme'
import { loadCustomTenantsFromStorage } from './customTenantStorage'
import { registerCustomTenantRecords } from './tenantPresetRegistry'
import {
  resolveNavMappingForPresetId,
  resolveWhitelabelPreset,
} from './tenantPresetRegistry'
import {
  loadWhitelabelPresetIdFromStorage,
  saveWhitelabelPresetIdToStorage,
} from './tenantPresetStorage'
import type { TenantMenuNavMapping } from './tenantMenuNavMapping'
import type { TenantWhitelabelPreset } from './tenantPresetTypes'
import { validateTenantPreset } from './validateTenantPreset'

type TenantWhitelabelState = {
  activePresetId: string
  preset: TenantWhitelabelPreset
  navMapping: TenantMenuNavMapping
  hydrated: boolean
  previewing: boolean
  hydrateFromStorage: () => void
  setActivePresetId: (id: string, options?: { persist?: boolean }) => void
  previewPreset: (preset: TenantWhitelabelPreset, navMapping: TenantMenuNavMapping) => void
  cancelPreview: () => void
}

function syncTenantFromPreset(preset: TenantWhitelabelPreset) {
  usePlatformTenantStore.getState().setTenant({
    id: preset.tenantId,
    companyId: preset.companyId,
    displayName: preset.brandName,
    environmentLabel: `mock · ${preset.brandName.toLowerCase()} white-label`,
  })
}

function activatePreset(
  preset: TenantWhitelabelPreset,
  options: { persist: boolean },
): { preset: TenantWhitelabelPreset; navMapping: TenantMenuNavMapping } {
  const validation = validateTenantPreset(preset)
  const resolved = validation.ok ? preset : resolveWhitelabelPreset(null)
  const navMapping = resolveNavMappingForPresetId(resolved.id, resolved.menu)
  applyTenantTheme(resolved)
  syncTenantFromPreset(resolved)
  if (options.persist) {
    saveActivePresetIdToConfig(resolved.id)
    saveWhitelabelPresetIdToStorage(resolved.id)
  }
  return { preset: resolved, navMapping }
}

let savedBeforePreview: {
  presetId: string
  preset: TenantWhitelabelPreset
  navMapping: TenantMenuNavMapping
} | null = null

export const useTenantWhitelabelStore = create<TenantWhitelabelState>()((set, get) => ({
  activePresetId: resolveWhitelabelPreset(null).id,
  preset: resolveWhitelabelPreset(null),
  navMapping: resolveNavMappingForPresetId(
    resolveWhitelabelPreset(null).id,
    resolveWhitelabelPreset(null).menu,
  ),
  hydrated: false,
  previewing: false,
  hydrateFromStorage: () => {
    registerCustomTenantRecords(loadCustomTenantsFromStorage())
    const storedId =
      loadActivePresetIdFromConfig() ?? loadWhitelabelPresetIdFromStorage()
    const { preset, navMapping } = activatePreset(resolveWhitelabelPreset(storedId), {
      persist: false,
    })
    set({ activePresetId: preset.id, preset, navMapping, hydrated: true, previewing: false })
    savedBeforePreview = null
  },
  setActivePresetId: (id, options) => {
    const persist = options?.persist !== false
    const { preset, navMapping } = activatePreset(resolveWhitelabelPreset(id), { persist })
    savedBeforePreview = null
    set({ activePresetId: preset.id, preset, navMapping, previewing: false })
  },
  previewPreset: (preset, navMapping) => {
    const state = get()
    if (!state.previewing) {
      savedBeforePreview = {
        presetId: state.activePresetId,
        preset: state.preset,
        navMapping: state.navMapping,
      }
    }
    const validation = validateTenantPreset(preset)
    const resolved = validation.ok ? preset : state.preset
    applyTenantTheme(resolved)
    syncTenantFromPreset(resolved)
    set({
      activePresetId: resolved.id,
      preset: resolved,
      navMapping,
      previewing: true,
    })
  },
  cancelPreview: () => {
    const snap = savedBeforePreview
    if (!snap) {
      set({ previewing: false })
      return
    }
    applyTenantTheme(snap.preset)
    syncTenantFromPreset(snap.preset)
    savedBeforePreview = null
    set({
      activePresetId: snap.presetId,
      preset: snap.preset,
      navMapping: snap.navMapping,
      previewing: false,
    })
  },
}))
