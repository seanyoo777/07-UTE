import { useEffect } from 'react'
import { useTradingWindowOverrideStore } from '../tradingWindow/override/tradingWindowOverrideStore'
import { useCustomTenantStore } from './customTenantStore'
import { useTenantWhitelabelStore } from './tenantWhitelabelStore'

/** Hydrates white-label preset from localStorage once on app mount (mock only). */
export function TenantWhitelabelBootstrap() {
  const hydrate = useTenantWhitelabelStore((s) => s.hydrateFromStorage)
  const hydrated = useTenantWhitelabelStore((s) => s.hydrated)
  const hydrateCustom = useCustomTenantStore((s) => s.hydrateFromStorage)
  const customHydrated = useCustomTenantStore((s) => s.hydrated)
  const hydrateTradingWindow = useTradingWindowOverrideStore((s) => s.hydrateFromStorage)
  const twHydrated = useTradingWindowOverrideStore((s) => s.hydrated)

  useEffect(() => {
    if (!customHydrated) hydrateCustom()
    if (!twHydrated) hydrateTradingWindow()
    if (!hydrated) hydrate()
  }, [hydrate, hydrateCustom, hydrateTradingWindow, hydrated, customHydrated, twHydrated])

  return null
}
