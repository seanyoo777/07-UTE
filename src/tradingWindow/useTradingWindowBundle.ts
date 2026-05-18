import { shouldEnableTradingWindowPresets } from '../config/layoutUiGuards'
import { useEffectiveLayoutFlags } from '../hooks/useEffectiveLayoutFlags'
import type { TenantWhitelabelPreset } from '../whitelabel/tenantPresetTypes'
import { useTradingWindowOverrideStore } from './override/tradingWindowOverrideStore'
import { resolveTradingWindowBundle } from './resolveTradingWindowBundle'
import type { TradingWindowBundle } from './tradingWindowPresetTypes'

export function useTradingWindowBundle(
  tenantPreset: TenantWhitelabelPreset,
): TradingWindowBundle | null {
  const layoutFlags = useEffectiveLayoutFlags()
  const revision = useTradingWindowOverrideStore((s) => s.revision)
  if (!shouldEnableTradingWindowPresets(layoutFlags)) return null
  void revision
  return resolveTradingWindowBundle(tenantPreset)
}
