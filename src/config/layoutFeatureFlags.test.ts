import { describe, expect, it } from 'vitest'
import {
  DEFAULT_LAYOUT_FLAGS,
  EMERGENCY_LAYOUT_PROFILE,
  parseLayoutPreset,
  resolveEffectiveLayoutFlags,
} from './layoutFeatureFlags'

describe('parseLayoutPreset', () => {
  it('returns hts for unknown preset', () => {
    expect(parseLayoutPreset('not-a-preset')).toBe('hts')
    expect(parseLayoutPreset('')).toBe('hts')
  })

  it('normalizes case', () => {
    expect(parseLayoutPreset('MOBILE')).toBe('mobile')
    expect(parseLayoutPreset('Compact')).toBe('compact')
  })
})

describe('resolveEffectiveLayoutFlags', () => {
  it('returns defaults when env is empty object', () => {
    const f = resolveEffectiveLayoutFlags({ env: {} })
    expect(f.layoutPreset).toBe(DEFAULT_LAYOUT_FLAGS.layoutPreset)
    expect(f.emergencyDisable).toBe(false)
    expect(f.chrome.showPremiumShell).toBe(true)
    expect(f.forceMobileStack).toBe(false)
  })

  it('applies layout preset from env', () => {
    const f = resolveEffectiveLayoutFlags({
      env: { VITE_UTE_LAYOUT_PRESET: 'tournament' },
    })
    expect(f.layoutPreset).toBe('tournament')
  })

  it('falls back unknown preset to hts', () => {
    const f = resolveEffectiveLayoutFlags({
      env: { VITE_UTE_LAYOUT_PRESET: 'unknown' },
    })
    expect(f.layoutPreset).toBe('hts')
  })

  it('applies read-only from VITE_UTE_READ_ONLY or VITE_UTE_READONLY', () => {
    expect(
      resolveEffectiveLayoutFlags({ env: { VITE_UTE_READ_ONLY: 'true' } }).readOnly,
    ).toBe(true)
    expect(
      resolveEffectiveLayoutFlags({ env: { VITE_UTE_READONLY: '1' } }).readOnly,
    ).toBe(true)
  })

  it('applies emergency profile with priority over preset and integrations', () => {
    const f = resolveEffectiveLayoutFlags({
      env: {
        VITE_UTE_EMERGENCY_DISABLE: 'true',
        VITE_UTE_LAYOUT_PRESET: 'tournament',
        VITE_UTE_ONEAI_CHROME: 'true',
      },
    })
    expect(f.emergencyDisable).toBe(true)
    expect(f.layoutPreset).toBe(EMERGENCY_LAYOUT_PROFILE.layoutPreset)
    expect(f.integrations.oneAi).toBe(false)
    expect(f.chrome.showIntegrationSlots).toBe(false)
    expect(f.chrome.showBottomDock).toBe(false)
  })

  it('sets forceMobileStack for mobile preset', () => {
    const f = resolveEffectiveLayoutFlags({
      env: { VITE_UTE_LAYOUT_PRESET: 'mobile' },
    })
    expect(f.forceMobileStack).toBe(true)
  })

  it('sets forceMobileStack for hts on mobile viewport', () => {
    const f = resolveEffectiveLayoutFlags({
      env: { VITE_UTE_LAYOUT_PRESET: 'hts' },
      viewportIsMobile: true,
    })
    expect(f.forceMobileStack).toBe(true)
  })

  it('merges chrome flags from env', () => {
    const f = resolveEffectiveLayoutFlags({
      env: { VITE_UTE_SHOW_PREMIUM_SHELL: 'false' },
    })
    expect(f.chrome.showPremiumShell).toBe(false)
  })

  it('applies overrides before emergency', () => {
    const f = resolveEffectiveLayoutFlags({
      env: { VITE_UTE_EMERGENCY_DISABLE: 'false' },
      overrides: { emergencyDisable: true },
    })
    expect(f.layoutPreset).toBe('simple')
  })
})
