import { create } from 'zustand'
import { buildDiagnosticsUnifiedEvent } from './buildMockUnifiedEvents'
import type { PlatformDiagnosticsSnapshot } from './platformDiagnosticsTypes'
import type { PlatformDiagnosticsScope } from './platformScope'
import { mergeUnifiedEventCandidates, appendUnifiedEvent } from './unifiedEventList'
import { loadUnifiedEventsFromStorage, saveUnifiedEventsToStorage } from './unifiedEventStorage'
import type { UnifiedEvent } from './unifiedEventTypes'
import { useIncidentReviewStore } from './incidentReview/incidentReviewStore'
import { scopeFromScopeKey } from './incidentReview/parseScopeKey'
import { logPlatformUnifiedEventAppend } from './platformAudit'
import { summarizeUnifiedEvents } from './summarizeUnifiedEvents'

type State = {
  scopeKey: string | null
  events: UnifiedEvent[]
  hydrate: (scopeKey: string) => void
  append: (event: UnifiedEvent, auditDetail?: string) => void
  ingestCandidates: (candidates: UnifiedEvent[]) => void
  appendFromDiagnostics: (
    scope: PlatformDiagnosticsScope,
    snap: PlatformDiagnosticsSnapshot,
  ) => void
}

export const useUnifiedEventStore = create<State>((set, get) => ({
  scopeKey: null,
  events: [],

  hydrate: (scopeKey) => {
    const loaded = loadUnifiedEventsFromStorage(scopeKey)
    set({ scopeKey, events: loaded })
  },

  append: (event) => {
    const { scopeKey, events } = get()
    if (scopeKey && event.scopeKey !== scopeKey) return
    const isNew = !events.some((e) => e.id === event.id)
    const next = appendUnifiedEvent(events, event)
    if (scopeKey) saveUnifiedEventsToStorage(scopeKey, next)
    set({ events: next })
    if (isNew) {
      logPlatformUnifiedEventAppend(event)
      useIncidentReviewStore
        .getState()
        .ingestFromUnifiedEvent(event, scopeFromScopeKey(event.scopeKey))
    }
  },

  ingestCandidates: (candidates) => {
    const { scopeKey, events } = get()
    if (!scopeKey) return
    const scoped = candidates.filter((c) => c.scopeKey === scopeKey)
    const next = mergeUnifiedEventCandidates(events, scoped)
    if (next.length !== events.length) {
      saveUnifiedEventsToStorage(scopeKey, next)
      set({ events: next })
    }
  },

  appendFromDiagnostics: (scope, snap) => {
    const event = buildDiagnosticsUnifiedEvent(scope, snap)
    get().append(event)
  },
}))

export function selectUnifiedEventSummary(state: State) {
  return summarizeUnifiedEvents(state.events)
}
