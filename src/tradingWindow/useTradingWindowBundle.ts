import { useMemo } from 'react'
import { shouldEnableTradingWindowPresets } from '../config/layoutUiGuards'
import { useEffectiveLayoutFlags } from '../hooks/useEffectiveLayoutFlags'
import type { TenantWhitelabelPreset } from '../whitelabel/tenantPresetTypes'
import { resolveTradingWindowBundle } from './resolveTradingWindowBundle'
import type { TradingWindowBundle } from './tradingWindowPresetTypes'

export function useTradingWindowBundle(
  tenantPreset: TenantWhitelabelPreset,
): TradingWindowBundle | null {
  const layoutFlags = useEffectiveLayoutFlags()
  return useMemo(() => {
    if (!shouldEnableTradingWindowPresets(layoutFlags)) return null
    return resolveTradingWindowBundle(tenantPreset)
  }, [tenantPreset, layoutFlags])
}
