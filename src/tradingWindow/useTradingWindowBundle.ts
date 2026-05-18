import { shouldEnableTradingWindowPresets } from '../config/layoutUiGuards'
import { useEffectiveLayoutFlags } from '../hooks/useEffectiveLayoutFlags'
import type { MarketId } from '../markets/types'
import type { TenantWhitelabelPreset } from '../whitelabel/tenantPresetTypes'
import { useMarketContextStore } from './market/marketContextStore'
import { useTradingWindowOverrideStore } from './override/tradingWindowOverrideStore'
import { resolveTradingWindowBundle } from './resolveTradingWindowBundle'
import type { TradingWindowBundle } from './tradingWindowPresetTypes'

export function useTradingWindowBundle(
  tenantPreset: TenantWhitelabelPreset,
  marketId?: MarketId,
): TradingWindowBundle | null {
  const layoutFlags = useEffectiveLayoutFlags()
  const overrideRevision = useTradingWindowOverrideStore((s) => s.revision)
  const marketRevision = useMarketContextStore((s) => s.revision)
  if (!shouldEnableTradingWindowPresets(layoutFlags)) return null
  void overrideRevision
  void marketRevision
  return resolveTradingWindowBundle(tenantPreset, marketId ? { marketId } : undefined)
}
