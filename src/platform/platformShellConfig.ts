import type { UteLayoutChromeFlags, UteLayoutIntegrationFlags } from '../config/layoutFeatureFlags'

export type PlatformNavId = 'trading' | 'admin' | 'diagnostics'

export type PlatformNavItem = {
  id: PlatformNavId
  label: string
  hint: string
  /** When set, chrome flag must be true to show in sidebar. */
  requiresChrome?: keyof UteLayoutChromeFlags
  /** When set, integration flag must be true (and chrome master if applicable). */
  requiresIntegration?: keyof UteLayoutIntegrationFlags
  /** Hidden entirely when emergency profile active. */
  hideOnEmergency?: boolean
}

export const PLATFORM_NAV_ITEMS: readonly PlatformNavItem[] = [
  {
    id: 'trading',
    label: 'Trading',
    hint: 'Markets · HTS workspace',
    hideOnEmergency: false,
  },
  {
    id: 'admin',
    label: 'Admin',
    hint: 'RBAC · audit · bridges',
    hideOnEmergency: false,
  },
  {
    id: 'diagnostics',
    label: 'Diagnostics',
    hint: 'Health · self-test entry',
    requiresChrome: 'showIntegrationSlots',
    hideOnEmergency: true,
  },
] as const
