import { buildPlatformDiagnosticsScope } from '../platformScope'

/** Parse `platformId:tenantId` scope key from unified events. */
export function scopeFromScopeKey(scopeKey: string) {
  const sep = scopeKey.indexOf(':')
  if (sep <= 0) {
    return buildPlatformDiagnosticsScope(scopeKey)
  }
  const platformId = scopeKey.slice(0, sep)
  const tenantId = scopeKey.slice(sep + 1)
  return buildPlatformDiagnosticsScope(tenantId, platformId)
}
