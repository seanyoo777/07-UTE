import type { WhitelabelActiveConfigBlob } from './customTenantTypes'
import {
  ACTIVE_CONFIG_STORAGE_KEY,
  ACTIVE_CONFIG_STORAGE_VERSION,
} from './customTenantTypes'
import { saveWhitelabelPresetIdToStorage } from './tenantPresetStorage'

export function loadActivePresetIdFromConfig(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(ACTIVE_CONFIG_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as WhitelabelActiveConfigBlob
    if (parsed.v !== ACTIVE_CONFIG_STORAGE_VERSION || parsed.mockOnly !== true) return null
    return typeof parsed.activePresetId === 'string' ? parsed.activePresetId : null
  } catch {
    return null
  }
}

export function saveActivePresetIdToConfig(activePresetId: string): void {
  if (typeof window === 'undefined') return
  const blob: WhitelabelActiveConfigBlob = {
    v: ACTIVE_CONFIG_STORAGE_VERSION,
    activePresetId,
    mockOnly: true,
    savedAt: Date.now(),
  }
  window.localStorage.setItem(ACTIVE_CONFIG_STORAGE_KEY, JSON.stringify(blob))
  saveWhitelabelPresetIdToStorage(activePresetId)
}
