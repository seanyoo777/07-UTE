/** Stable platform id for 07-UTE shell scope (not routing). */
export const DEFAULT_PLATFORM_ID = 'ute-07'

export type PlatformDiagnosticsScope = {
  platformId: string
  tenantId: string
  scopeKey: string
}

export function buildPlatformDiagnosticsScope(
  tenantId: string,
  platformId: string = DEFAULT_PLATFORM_ID,
): PlatformDiagnosticsScope {
  return {
    platformId,
    tenantId,
    scopeKey: `${platformId}:${tenantId}`,
  }
}
