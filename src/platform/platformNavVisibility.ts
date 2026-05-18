import type { EffectiveLayoutFlags } from '../config/layoutFeatureFlags'
import type { PlatformNavItem } from './platformShellConfig'

export function isPlatformNavItemVisible(
  item: PlatformNavItem,
  flags: EffectiveLayoutFlags,
): boolean {
  if (flags.emergencyDisable && item.hideOnEmergency) return false

  if (item.requiresChrome && !flags.chrome[item.requiresChrome]) return false

  if (item.requiresIntegration && !flags.integrations[item.requiresIntegration]) {
    return false
  }

  if (item.requiresChrome === 'showIntegrationSlots' && !flags.chrome.showIntegrationSlots) {
    return false
  }

  return true
}
