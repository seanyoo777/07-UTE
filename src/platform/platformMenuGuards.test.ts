import { describe, expect, it } from 'vitest'
import { DEFAULT_LAYOUT_FLAGS, EMERGENCY_LAYOUT_PROFILE } from '../config/layoutFeatureFlags'
import { filterPlatformNavItems, isPlatformNavItemVisible } from './platformMenuGuards'
import { PLATFORM_NAV_ITEMS } from './platformShellConfig'

describe('platformMenuGuards', () => {
  it('shows trading and admin by default', () => {
    const items = filterPlatformNavItems({
      ...DEFAULT_LAYOUT_FLAGS,
      forceMobileStack: false,
    })
    const ids = items.map((i) => i.id)
    expect(ids).toContain('trading')
    expect(ids).toContain('admin')
    expect(ids).toContain('diagnostics')
  })

  it('hides diagnostics on emergency profile', () => {
    const emergency = {
      ...DEFAULT_LAYOUT_FLAGS,
      ...EMERGENCY_LAYOUT_PROFILE,
      readOnly: true,
      forceMobileStack: true,
    }
    const diag = PLATFORM_NAV_ITEMS.find((i) => i.id === 'diagnostics')!
    expect(isPlatformNavItemVisible(diag, emergency)).toBe(false)
    const items = filterPlatformNavItems(emergency)
    expect(items.map((i) => i.id)).not.toContain('diagnostics')
  })

  it('hides diagnostics when integration slots chrome is off', () => {
    const flags = {
      ...DEFAULT_LAYOUT_FLAGS,
      chrome: { ...DEFAULT_LAYOUT_FLAGS.chrome, showIntegrationSlots: false },
      forceMobileStack: false,
    }
    const diag = PLATFORM_NAV_ITEMS.find((i) => i.id === 'diagnostics')!
    expect(isPlatformNavItemVisible(diag, flags)).toBe(false)
  })
})
