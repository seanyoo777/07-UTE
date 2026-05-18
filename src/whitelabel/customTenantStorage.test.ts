import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cloneRegistryPresetAsCustom } from './customTenantModel'
import { CUSTOM_TENANTS_STORAGE_KEY } from './customTenantTypes'
import {
  loadCustomTenantsFromStorage,
  removeCustomTenantFromStorage,
  saveCustomTenantsToStorage,
  upsertCustomTenantInStorage,
} from './customTenantStorage'

describe('customTenantStorage', () => {
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

  it('persists custom tenants blob (mock only)', () => {
    const record = cloneRegistryPresetAsCustom('bluetrade', 'Acme')
    saveCustomTenantsToStorage([record])
    const loaded = loadCustomTenantsFromStorage()
    expect(loaded).toHaveLength(1)
    expect(loaded[0]?.preset.brandName).toBe('Acme')
    const raw = store.get(CUSTOM_TENANTS_STORAGE_KEY)
    expect(raw).toContain('"mockOnly":true')
  })

  it('upserts and removes custom tenant', () => {
    const a = cloneRegistryPresetAsCustom('goldx', 'A')
    upsertCustomTenantInStorage(a)
    const b = cloneRegistryPresetAsCustom('goldx', 'B')
    const next = upsertCustomTenantInStorage({ ...b, id: a.id, preset: { ...b.preset, id: a.id } })
    expect(next).toHaveLength(1)
    const removed = removeCustomTenantFromStorage(a.id)
    expect(removed).toHaveLength(0)
  })
})
