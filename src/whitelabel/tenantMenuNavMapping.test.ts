import { describe, expect, it } from 'vitest'
import { DEFAULT_LAYOUT_FLAGS, resolveEffectiveLayoutFlags } from '../config/layoutFeatureFlags'
import {
  buildMenuPreview,
  resolvePlatformNavForTenant,
  validateWhitelabelFeatureGuardRespected,
  validateWhitelabelMenuOrder,
} from './tenantMenuNavMapping'

const defaultFlags = { ...DEFAULT_LAYOUT_FLAGS, forceMobileStack: false }

describe('tenantMenuNavMapping', () => {
  it('orders broker-style with admin first', () => {
    const nav = resolvePlatformNavForTenant(defaultFlags, 'broker-style')
    expect(nav[0]?.id).toBe('admin')
    expect(nav.find((n) => n.id === 'admin')?.emphasized).toBe(true)
  })

  it('hides diagnostics for mobile-first', () => {
    const nav = resolvePlatformNavForTenant(defaultFlags, 'mobile-first')
    expect(nav.map((n) => n.id)).not.toContain('diagnostics')
    const preview = buildMenuPreview('mobile-first', defaultFlags)
    const diag = preview.entries.find((e) => e.navId === 'diagnostics')
    expect(diag?.visible).toBe(false)
    expect(diag?.hiddenByMenuPreset).toBe(true)
  })

  it('validates menu order matrix', () => {
    expect(validateWhitelabelMenuOrder().ok).toBe(true)
  })

  it('respects emergency feature guard', () => {
    const emergency = resolveEffectiveLayoutFlags({
      env: { VITE_UTE_EMERGENCY_DISABLE: 'true' },
    })
    const nav = resolvePlatformNavForTenant(emergency, 'futures-style')
    expect(nav.map((n) => n.id)).not.toContain('diagnostics')
    expect(validateWhitelabelFeatureGuardRespected().ok).toBe(true)
  })
})
