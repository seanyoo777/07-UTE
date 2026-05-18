import { describe, expect, it } from 'vitest'
import { resolveWhitelabelPreset } from '../tenantPresetRegistry'
import {
  buildWhitelabelPreviewBundle,
  validateAdminSkinPreviewModel,
  validateTenantPreviewModel,
} from './buildWhitelabelPreviewModel'

describe('buildWhitelabelPreviewModel', () => {
  it('builds bundle for active preset', () => {
    const preset = resolveWhitelabelPreset('goldx')
    const bundle = buildWhitelabelPreviewBundle(preset)
    expect(bundle.mockOnly).toBe(true)
    expect(bundle.tenantCards).toHaveLength(3)
    expect(bundle.adminSkins).toHaveLength(4)
    expect(bundle.menuPreview.visibleOrder[0]).toBe('admin')
    expect(bundle.brandSummary.logoText).toBe('GOLDX')
    expect(bundle.diagnostics.currentAdminSkin).toBe('banking')
  })

  it('validates tenant preview model', () => {
    expect(validateTenantPreviewModel().ok).toBe(true)
  })

  it('validates admin skin preview model', () => {
    expect(validateAdminSkinPreviewModel().ok).toBe(true)
  })
})
