import { create } from 'zustand'
import type { WorkspaceContextId, WorkspaceContextRoute } from './workspaceContextTypes'

type NavigateInput = {
  contextId: WorkspaceContextId
  scopeKey: string
  eventId?: string | null
}

type State = {
  scopeKey: string | null
  activeContext: WorkspaceContextId | null
  activeEventId: string | null
  lastRoute: WorkspaceContextRoute | null
  syncScope: (scopeKey: string) => void
  navigateTo: (input: NavigateInput) => boolean
  clearHighlight: () => void
}

export const useWorkspaceContextStore = create<State>((set, get) => ({
  scopeKey: null,
  activeContext: null,
  activeEventId: null,
  lastRoute: null,

  syncScope: (scopeKey) => {
    const prev = get().scopeKey
    if (prev === scopeKey) return
    set({
      scopeKey,
      activeContext: null,
      activeEventId: null,
      lastRoute: null,
    })
  },

  navigateTo: (input) => {
    const { scopeKey } = get()
    if (scopeKey != null && input.scopeKey !== scopeKey) return false

    const route: WorkspaceContextRoute = {
      contextId: input.contextId,
      scopeKey: input.scopeKey,
      eventId: input.eventId ?? null,
      mockOnly: true,
      at: Date.now(),
    }

    set({
      scopeKey: input.scopeKey,
      activeContext: input.contextId,
      activeEventId: input.eventId ?? null,
      lastRoute: route,
    })
    return true
  },

  clearHighlight: () => set({ activeContext: null, activeEventId: null }),
}))

export function isWorkspaceContextActive(
  contextId: WorkspaceContextId,
  active: WorkspaceContextId | null,
  activeEventId: string | null,
  eventId?: string,
): boolean {
  if (active !== contextId) return false
  if (eventId != null && activeEventId != null) return activeEventId === eventId
  return true
}
