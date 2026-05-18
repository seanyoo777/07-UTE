import { describe, expect, it } from 'vitest'
import { resolveWhitelabelPreset } from '../../whitelabel/tenantPresetRegistry'
import {
  adminFormFromTenantId,
  adminFormToOverride,
  applyTradingWindowTenantOverride,
} from './tradingWindowOverrideModel'

describe('tradingWindowOverrideModel', () => {
  it('applies override to preset and grid', () => {
    const tenant = resolveWhitelabelPreset('goldx')
    const form = adminFormFromTenantId('goldx', null)
    const override = adminFormToOverride({ ...form, htsChart: 6, orderFormMode: 'fast' })
    const applied = applyTradingWindowTenantOverride(tenant, override)
    expect(applied.hasOverride).toBe(true)
    expect(applied.htsGrid.chart).toBe(6)
    expect(applied.preset.orderForm.layout).toBe('ticket-compact')
  })

  it('returns builtin when no override', () => {
    const tenant = resolveWhitelabelPreset('bluetrade')
    const applied = applyTradingWindowTenantOverride(tenant, null)
    expect(applied.hasOverride).toBe(false)
    expect(applied.preset.profileId).toBe('broker-hts')
  })
})
