import { describe, expect, it } from 'vitest'
import { resolveWhitelabelPreset } from './tenantPresetRegistry'
import { resolveWhitelabelShellClasses, validateWhitelabelLayoutDensity } from './resolveWhitelabelClasses'

describe('resolveWhitelabelShellClasses', () => {
  it('applies dense grid for prime-futures', () => {
    const c = resolveWhitelabelShellClasses(resolveWhitelabelPreset('prime-futures'))
    expect(c.gridDensityClass).toContain('gap-1')
    expect(c.cardLayoutClass).toContain('ute-shell-card')
  })

  it('validates layout density matrix', () => {
    expect(validateWhitelabelLayoutDensity().ok).toBe(true)
  })
})
