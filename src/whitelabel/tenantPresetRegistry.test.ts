import { describe, expect, it } from 'vitest'
import {
  getDefaultWhitelabelPreset,
  listBuiltinPresetIds,
  listWhitelabelPresetIds,
  registerCustomTenantRecords,
  resolveWhitelabelPreset,
} from './tenantPresetRegistry'
import { cloneRegistryPresetAsCustom } from './customTenantModel'
import { validateTenantPreset } from './validateTenantPreset'

describe('tenantPresetRegistry', () => {
  it('lists three built-in mock tenants', () => {
    const ids = listBuiltinPresetIds()
    expect(ids).toContain('goldx')
    expect(ids).toContain('bluetrade')
    expect(ids).toContain('prime-futures')
    expect(ids).toHaveLength(3)
  })

  it('merges custom tenants into registry', () => {
    const custom = cloneRegistryPresetAsCustom('goldx', 'Merged')
    registerCustomTenantRecords([custom])
    const ids = listWhitelabelPresetIds()
    expect(ids).toContain('goldx')
    expect(ids).toContain(custom.id)
    expect(resolveWhitelabelPreset(custom.id).brandName).toBe('Merged')
    registerCustomTenantRecords([])
  })

  it('falls back to default for invalid id', () => {
    const fallback = resolveWhitelabelPreset('not-a-real-tenant')
    expect(fallback.id).toBe(getDefaultWhitelabelPreset().id)
  })

  it('validates all mock presets', () => {
    for (const id of listWhitelabelPresetIds()) {
      const preset = resolveWhitelabelPreset(id)
      expect(validateTenantPreset(preset).ok).toBe(true)
    }
  })
})
