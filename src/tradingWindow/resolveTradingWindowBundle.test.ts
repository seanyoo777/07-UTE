import { describe, expect, it } from 'vitest'
import { resolveWhitelabelPreset } from '../whitelabel/tenantPresetRegistry'
import type { TenantWhitelabelPreset } from '../whitelabel/tenantPresetTypes'
import { getDefaultTradingWindowPreset } from './tradingWindowPresetRegistry'
import { resolveTradingWindowBundle } from './resolveTradingWindowBundle'

describe('resolveTradingWindowBundle', () => {
  it('returns class map and data-ute-twp-* attributes', () => {
    const bundle = resolveTradingWindowBundle(resolveWhitelabelPreset('bluetrade'))
    expect(bundle.mockOnly).toBe(true)
    expect(bundle.preset.profileId).toBe('broker-hts')
    expect(bundle.classNames.workspace).toContain('ute-twp-profile-broker-hts')
    expect(bundle.dataAttributes['data-ute-twp']).toBe('broker-hts')
    expect(bundle.dataAttributes['data-ute-twp-mock-only']).toBe('true')
    expect(bundle.dataAttributes['data-ute-twp-grid-chart']).toBe('4')
    expect(bundle.htsGrid.chart).toBeGreaterThan(0)
  })

  it('falls back when tradingWindow is invalid', () => {
    const broken = {
      ...resolveWhitelabelPreset('goldx'),
      tradingWindow: {
        ...getDefaultTradingWindowPreset(),
        mockOnly: false as true,
      },
    } as TenantWhitelabelPreset
    const bundle = resolveTradingWindowBundle(broken)
    expect(bundle.preset.profileId).toBe('private-bank')
  })
})
