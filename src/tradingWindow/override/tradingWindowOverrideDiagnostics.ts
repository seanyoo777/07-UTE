import type { TenantWhitelabelPreset } from '../../whitelabel/tenantPresetTypes'
import { resolveTradingWindowBundle } from '../resolveTradingWindowBundle'
import { useTradingWindowOverrideStore } from './tradingWindowOverrideStore'

export type TradingWindowOverrideDiagnostics = {
  activeOverrideCount: number
  hasActiveTenantOverride: boolean
  presetDrift: boolean
  fallbackActive: boolean
  previewing: boolean
  storageKey: string
}

export function buildTradingWindowOverrideDiagnostics(
  tenantPreset: TenantWhitelabelPreset,
): TradingWindowOverrideDiagnostics {
  const store = useTradingWindowOverrideStore.getState()
  const bundle = resolveTradingWindowBundle(tenantPreset)
  return {
    activeOverrideCount: store.countOverrides(),
    hasActiveTenantOverride: bundle.dataAttributes['data-ute-twp-override'] === 'active',
    presetDrift: bundle.dataAttributes['data-ute-twp-override-drift'] === 'yes',
    fallbackActive: false,
    previewing: store.preview?.tenantPresetId === tenantPreset.id,
    storageKey: 'ute.trading_window_overrides_v1',
  }
}
