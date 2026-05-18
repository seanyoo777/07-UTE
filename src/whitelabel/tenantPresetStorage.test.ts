import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  loadWhitelabelPresetIdFromStorage,
  saveWhitelabelPresetIdToStorage,
  WHITELABEL_STORAGE_KEY,
} from './tenantPresetStorage'

describe('tenantPresetStorage', () => {
  const store = new Map<string, string>()

  beforeEach(() => {
    store.clear()
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => {
          store.set(k, v)
        },
        removeItem: (k: string) => {
          store.delete(k)
        },
      },
    })
  })

  it('persists and loads preset id (mock only blob)', () => {
    saveWhitelabelPresetIdToStorage('goldx')
    expect(loadWhitelabelPresetIdFromStorage()).toBe('goldx')
    const raw = store.get(WHITELABEL_STORAGE_KEY)
    expect(raw).toContain('"mockOnly":true')
  })
})
