import { create } from 'zustand'
import { resolveEffectiveLayoutFlags } from '../../config/layoutFeatureFlags'
import type { GlobalDiagnosticsSnapshot } from '../globalDiagnostics/globalDiagnosticsTypes'
import type { PlatformDiagnosticsSnapshot } from '../platformDiagnosticsTypes'
import type { PlatformDiagnosticsScope } from '../platformScope'
import type { UnifiedEvent } from '../unifiedEventTypes'
import {
  buildIncidentFromGlobalDiagnostics,
  buildIncidentFromPlatformDiagnostics,
  buildIncidentFromUnifiedEvent,
  shouldIngestUnifiedEventAsIncident,
} from './buildIncidentReviewSnapshot'
import type { IncidentResolutionStatus, IncidentReviewSnapshot } from './incidentReviewTypes'

const MAX_PER_SCOPE = 12

function isIncidentReviewEnabled(): boolean {
  return resolveEffectiveLayoutFlags().chrome.enableIncidentReview
}

type State = {
  byScope: Record<string, IncidentReviewSnapshot[]>
  upsert: (incident: IncidentReviewSnapshot) => void
  setResolution: (scopeKey: string, incidentId: string, status: IncidentResolutionStatus) => void
  setOperatorNote: (scopeKey: string, incidentId: string, note: string) => void
  getRecent: (scopeKey: string, limit?: number) => IncidentReviewSnapshot[]
  ingestFromUnifiedEvent: (event: UnifiedEvent, scope: PlatformDiagnosticsScope) => void
  ingestFromPlatformDiagnostics: (
    snap: PlatformDiagnosticsSnapshot,
    eventId?: string,
  ) => void
  ingestFromGlobalDiagnostics: (snap: GlobalDiagnosticsSnapshot) => void
}

export const useIncidentReviewStore = create<State>((set, get) => ({
  byScope: {},

  upsert: (incident) =>
    set((s) => {
      const key = incident.scope.scopeKey
      const prev = s.byScope[key] ?? []
      const without = prev.filter((p) => p.id !== incident.id)
      const next = [incident, ...without].slice(0, MAX_PER_SCOPE)
      return { byScope: { ...s.byScope, [key]: next } }
    }),

  setResolution: (scopeKey, incidentId, status) =>
    set((s) => {
      const list = s.byScope[scopeKey]
      if (!list) return s
      const next = list.map((inc) =>
        inc.id === incidentId ? { ...inc, resolutionStatus: status } : inc,
      )
      return { byScope: { ...s.byScope, [scopeKey]: next } }
    }),

  setOperatorNote: (scopeKey, incidentId, note) =>
    set((s) => {
      const list = s.byScope[scopeKey]
      if (!list) return s
      const next = list.map((inc) =>
        inc.id === incidentId ? { ...inc, mockOperatorNote: note } : inc,
      )
      return { byScope: { ...s.byScope, [scopeKey]: next } }
    }),

  getRecent: (scopeKey, limit = 8) => {
    const list = get().byScope[scopeKey] ?? []
    return list.slice(0, limit)
  },

  ingestFromUnifiedEvent: (event, scope) => {
    if (!isIncidentReviewEnabled()) return
    if (!shouldIngestUnifiedEventAsIncident(event)) return
    const incident = buildIncidentFromUnifiedEvent(event, scope)
    get().upsert(incident)
  },

  ingestFromPlatformDiagnostics: (snap, eventId) => {
    if (!isIncidentReviewEnabled()) return
    if (snap.overall === 'PASS') return
    const incident = buildIncidentFromPlatformDiagnostics(snap, eventId)
    get().upsert(incident)
  },

  ingestFromGlobalDiagnostics: (snap) => {
    if (!isIncidentReviewEnabled()) return
    const incident = buildIncidentFromGlobalDiagnostics(snap)
    if (incident) get().upsert(incident)
  },
}))
