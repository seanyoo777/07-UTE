import type { EffectiveLayoutFlags } from '../config/layoutFeatureFlags'
import { resolvePlatformNavForTenant, type ResolvedPlatformNavItem } from '../whitelabel/tenantMenuNavMapping'
import type { TenantMenuPresetId } from '../whitelabel/tenantPresetTypes'
import type { PlatformNavItem } from './platformShellConfig'

export type { ResolvedPlatformNavItem, TenantMenuPresetId }
export { isPlatformNavItemVisible } from './platformNavVisibility'
export { resolvePlatformNavForTenant }

export function filterPlatformNavItems(flags: EffectiveLayoutFlags): PlatformNavItem[] {
  return resolvePlatformNavForTenant(flags, 'trading-first').map(({ emphasized, ...item }) => {
    void emphasized
    return item
  })
}
