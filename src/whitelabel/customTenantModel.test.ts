import { describe, expect, it } from 'vitest'
import {
  cloneRegistryPresetAsCustom,
  customRecordFromForm,
  formDriftsFromPreset,
  formStateFromPreset,
  validateCustomTenantRecord,
} from './customTenantModel'
import { resolveWhitelabelPreset } from './tenantPresetRegistry'

describe('customTenantModel', () => {
  it('clones built-in preset as custom record', () => {
    const record = cloneRegistryPresetAsCustom('prime-futures', 'Clone Test')
    expect(validateCustomTenantRecord(record).ok).toBe(true)
    expect(record.sourcePresetId).toBe('prime-futures')
    expect(record.preset.brandName).toBe('Clone Test')
  })

  it('detects form drift from built-in preset', () => {
    const preset = resolveWhitelabelPreset('bluetrade')
    const form = formStateFromPreset(preset)
    expect(formDriftsFromPreset(form, preset)).toBe(false)
    expect(formDriftsFromPreset({ ...form, brandName: 'Changed' }, preset)).toBe(true)
  })

  it('builds custom record from form', () => {
    const preset = resolveWhitelabelPreset('goldx')
    const form = formStateFromPreset(preset)
    const record = customRecordFromForm({ ...form, brandName: 'Custom Gold' }, null, 'goldx')
    expect(record.preset.brandName).toBe('Custom Gold')
    expect(validateCustomTenantRecord(record).ok).toBe(true)
  })
})
