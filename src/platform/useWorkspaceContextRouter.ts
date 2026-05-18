import { useCallback, useEffect } from 'react'
import { useEffectiveLayoutFlags } from '../hooks/useEffectiveLayoutFlags'
import { shouldEnableWorkspaceContextRouter } from '../config/layoutUiGuards'
import { logPlatformWorkspaceContextNavigate } from './platformAudit'
import type { UnifiedEvent } from './unifiedEventTypes'
import type { WorkspaceContextId } from './workspaceContextTypes'
import { usePlatformDiagnosticsScope } from './usePlatformDiagnosticsScope'
import { useWorkspaceContextStore } from './workspaceContextStore'

export function useWorkspaceContextRouter() {
  const scope = usePlatformDiagnosticsScope()
  const layoutFlags = useEffectiveLayoutFlags()
  const enabled = shouldEnableWorkspaceContextRouter(layoutFlags)
  const syncScope = useWorkspaceContextStore((s) => s.syncScope)
  const navigateTo = useWorkspaceContextStore((s) => s.navigateTo)
  const activeContext = useWorkspaceContextStore((s) => s.activeContext)
  const activeEventId = useWorkspaceContextStore((s) => s.activeEventId)

  useEffect(() => {
    syncScope(scope.scopeKey)
  }, [scope.scopeKey, syncScope])

  const navigate = useCallback(
    (contextId: WorkspaceContextId, eventId?: string | null) => {
      if (!enabled) return false
      const ok = navigateTo({
        contextId,
        scopeKey: scope.scopeKey,
        eventId: eventId ?? null,
      })
      if (ok) {
        logPlatformWorkspaceContextNavigate(scope, contextId, eventId ?? null)
      }
      return ok
    },
    [enabled, navigateTo, scope],
  )

  const navigateFromEvent = useCallback(
    (event: UnifiedEvent) => {
      if (event.scopeKey !== scope.scopeKey) return false
      return navigate(event.source, event.id)
    },
    [navigate, scope.scopeKey],
  )

  return {
    enabled,
    scope,
    activeContext,
    activeEventId,
    navigate,
    navigateFromEvent,
  }
}
