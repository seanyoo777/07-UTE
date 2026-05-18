import { UNIFIED_EVENT_SOURCES, type UnifiedEventSource } from './unifiedEventTypes'

/** Workspace panel ids align with unified event sources. */
export const WORKSPACE_CONTEXT_IDS = UNIFIED_EVENT_SOURCES

export type WorkspaceContextId = UnifiedEventSource

export type WorkspaceContextRoute = {
  contextId: WorkspaceContextId
  scopeKey: string
  eventId: string | null
  mockOnly: true
  at: number
}
