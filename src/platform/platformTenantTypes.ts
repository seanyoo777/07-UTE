/** Mock tenant context — no server persistence. */
export type PlatformTenantTier = 'demo' | 'sandbox' | 'pilot'

export type PlatformTenant = {
  id: string
  companyId: string
  displayName: string
  tier: PlatformTenantTier
  environmentLabel: string
}
