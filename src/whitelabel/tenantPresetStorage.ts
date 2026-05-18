export const WHITELABEL_STORAGE_KEY = 'ute-whitelabel-preset-id' as const
export const WHITELABEL_STORAGE_VERSION = 1 as const

export type WhitelabelStorageBlob = {
  v: typeof WHITELABEL_STORAGE_VERSION
  presetId: string
  savedAt: number
  mockOnly: true
}

export function loadWhitelabelPresetIdFromStorage(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(WHITELABEL_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as WhitelabelStorageBlob
    if (parsed.v !== WHITELABEL_STORAGE_VERSION || parsed.mockOnly !== true) return null
    return typeof parsed.presetId === 'string' ? parsed.presetId : null
  } catch {
    return null
  }
}

export function saveWhitelabelPresetIdToStorage(presetId: string): void {
  if (typeof window === 'undefined') return
  const blob: WhitelabelStorageBlob = {
    v: WHITELABEL_STORAGE_VERSION,
    presetId,
    savedAt: Date.now(),
    mockOnly: true,
  }
  window.localStorage.setItem(WHITELABEL_STORAGE_KEY, JSON.stringify(blob))
}
