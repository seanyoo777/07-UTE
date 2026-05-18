import { useEffect, useMemo, useRef } from 'react'
import { parseEnvBoolean } from '../../config/layoutFeatureFlags'
import { shouldEnableTenantContextBridge } from '../../config/layoutUiGuards'
import { useEffectiveLayoutFlags } from '../../hooks/useEffectiveLayoutFlags'
import { DEFAULT_PLATFORM_ID } from '../platformScope'
import { usePlatformDiagnosticsScope } from '../usePlatformDiagnosticsScope'
import { usePlatformTenantStore } from '../platformTenantStore'
import { useWorkspaceContextStore } from '../workspaceContextStore'
import {
  logPlatformScopeMismatchDetected,
  logPlatformTenantBridgeView,
  logPlatformTenantValidationRead,
} from './tenantContextAudit'
import { useTenantContextBridgeStore } from './tenantContextBridgeStore'

function readForcedValidationVerdict():
  | 'PASS'
  | 'WARN'
  | 'FAIL'
  | undefined {
  if (typeof import.meta === 'undefined') return undefined
  const raw = import.meta.env.VITE_UTE_TENANT_VALIDATION_MOCK_VERDICT as string | undefined
  const v = raw?.trim().toUpperCase()
  if (v === 'PASS' || v === 'WARN' || v === 'FAIL') return v
  const failFlag = parseEnvBoolean(import.meta.env.VITE_UTE_TENANT_VALIDATION_MOCK_FAIL)
  if (failFlag === true) return 'FAIL'
  return undefined
}

export function useTenantContextBridge() {
  const layoutFlags = useEffectiveLayoutFlags()
  const enabled = shouldEnableTenantContextBridge(layoutFlags)
  const tenant = usePlatformTenantStore((s) => s.tenant)
  const scope = usePlatformDiagnosticsScope()
  const workspaceScopeKey = useWorkspaceContextStore((s) => s.scopeKey) ?? scope.scopeKey
  const snapshot = useTenantContextBridgeStore((s) => s.snapshot)
  const scopeMismatch = useTenantContextBridgeStore((s) => s.scopeMismatch)
  const hydrate = useTenantContextBridgeStore((s) => s.hydrate)
  const loggedRef = useRef(false)
  const mismatchLoggedRef = useRef(false)

  const ids = useMemo(
    () => ({
      tenantId: tenant.id,
      companyId: tenant.companyId,
      platformId: DEFAULT_PLATFORM_ID,
      scopeKey: scope.scopeKey,
    }),
    [tenant.id, tenant.companyId, scope.scopeKey],
  )

  useEffect(() => {
    if (!enabled) return
    const snap = hydrate({
      tenantId: tenant.id,
      companyId: tenant.companyId,
      platformId: DEFAULT_PLATFORM_ID,
      workspaceScopeKey: workspaceScopeKey ?? scope.scopeKey,
      forcedOverall: readForcedValidationVerdict(),
    })
    if (!loggedRef.current) {
      loggedRef.current = true
      logPlatformTenantBridgeView(scope.scopeKey)
      logPlatformTenantValidationRead(snap)
    }
  }, [enabled, hydrate, scope.scopeKey, tenant.id, tenant.companyId, workspaceScopeKey])

  useEffect(() => {
    if (!enabled || !scopeMismatch || mismatchLoggedRef.current) return
    mismatchLoggedRef.current = true
    logPlatformScopeMismatchDetected(scopeMismatch)
  }, [enabled, scopeMismatch])

  return {
    enabled,
    ids,
    snapshot,
    scopeMismatch,
    showRailWarning: enabled && snapshot?.overall === 'FAIL',
    showRailWarn: enabled && snapshot?.overall === 'WARN',
  }
}
