import { useEffect } from 'react'
import { useCustomTenantStore } from './customTenantStore'
import { useTenantWhitelabelStore } from './tenantWhitelabelStore'

/** Hydrates white-label preset from localStorage once on app mount (mock only). */
export function TenantWhitelabelBootstrap() {
  const hydrate = useTenantWhitelabelStore((s) => s.hydrateFromStorage)
  const hydrated = useTenantWhitelabelStore((s) => s.hydrated)
  const hydrateCustom = useCustomTenantStore((s) => s.hydrateFromStorage)
  const customHydrated = useCustomTenantStore((s) => s.hydrated)

  useEffect(() => {
    if (!customHydrated) hydrateCustom()
    if (!hydrated) hydrate()
  }, [hydrate, hydrateCustom, hydrated, customHydrated])

  return null
}
