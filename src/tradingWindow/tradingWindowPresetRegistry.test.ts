import { describe, expect, it } from 'vitest'
import { resolveWhitelabelPreset } from '../whitelabel/tenantPresetRegistry'
import {
  DEFAULT_TRADING_WINDOW_PROFILE_ID,
  TENANT_TRADING_WINDOW_PROFILE_MAP,
  TRADING_WINDOW_REGISTRY_CANDIDATES,
  getTradingWindowProfile,
  listTradingWindowProfileIds,
  resolveTradingWindowPreset,
  resolveTradingWindowProfileForTenantId,
} from './tradingWindowPresetRegistry'

describe('tradingWindowPresetRegistry', () => {
  it('maps mock tenants to profiles', () => {
    expect(TENANT_TRADING_WINDOW_PROFILE_MAP.goldx).toBe('private-bank')
    expect(TENANT_TRADING_WINDOW_PROFILE_MAP.bluetrade).toBe('broker-hts')
    expect(TENANT_TRADING_WINDOW_PROFILE_MAP['prime-futures']).toBe('global-futures')
  })

  it('lists five profile definitions including registry candidates', () => {
    const ids = listTradingWindowProfileIds()
    expect(ids).toHaveLength(5)
    for (const candidate of TRADING_WINDOW_REGISTRY_CANDIDATES) {
      expect(ids).toContain(candidate)
      expect(getTradingWindowProfile(candidate).mockOnly).toBe(true)
    }
  })

  it('resolves trading window from tenant preset', () => {
    const goldx = resolveTradingWindowPreset(resolveWhitelabelPreset('goldx'))
    expect(goldx.profileId).toBe('private-bank')
    const unknown = resolveTradingWindowProfileForTenantId('not-mapped')
    expect(unknown).toBe(DEFAULT_TRADING_WINDOW_PROFILE_ID)
  })
})
