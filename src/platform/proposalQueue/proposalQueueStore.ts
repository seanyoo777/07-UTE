import { create } from 'zustand'
import { resolveEffectiveLayoutFlags } from '../../config/layoutFeatureFlags'
import type { GlobalDiagnosticsSnapshot } from '../globalDiagnostics/globalDiagnosticsTypes'
import type { IncidentReviewSnapshot } from '../incidentReview/incidentReviewTypes'
import {
  buildProposalFromGlobalDiagnostics,
  buildProposalFromIncident,
} from './buildProposalSnapshot'
import {
  logProposalCreated,
  logProposalReviewed,
  logProposalStatusChanged,
} from './proposalQueueAudit'
import type { ProposalSnapshot, ProposalStatus } from './proposalQueueTypes'

const MAX_PER_SCOPE = 12

function isProposalQueueEnabled(): boolean {
  return resolveEffectiveLayoutFlags().chrome.enableProposalQueue
}

type State = {
  byScope: Record<string, ProposalSnapshot[]>
  upsert: (proposal: ProposalSnapshot) => void
  getRecent: (scopeKey: string, limit?: number) => ProposalSnapshot[]
  setStatus: (scopeKey: string, proposalId: string, status: ProposalStatus) => void
  setOperatorNote: (scopeKey: string, proposalId: string, note: string) => void
  createDraftFromIncident: (incident: IncidentReviewSnapshot) => ProposalSnapshot | null
  createDraftFromGlobalDiagnostics: (snap: GlobalDiagnosticsSnapshot) => ProposalSnapshot | null
}

export const useProposalQueueStore = create<State>((set, get) => ({
  byScope: {},

  upsert: (proposal) =>
    set((s) => {
      const key = proposal.scope.scopeKey
      const prev = s.byScope[key] ?? []
      const next = [proposal, ...prev.filter((p) => p.id !== proposal.id)].slice(0, MAX_PER_SCOPE)
      return { byScope: { ...s.byScope, [key]: next } }
    }),

  getRecent: (scopeKey, limit = 8) => {
    const list = get().byScope[scopeKey] ?? []
    return list.slice(0, limit)
  },

  setStatus: (scopeKey, proposalId, status) => {
    const list = get().byScope[scopeKey]
    if (!list) return
    const current = list.find((p) => p.id === proposalId)
    if (!current || current.status === status) return
    const from = current.status
    const updated = { ...current, status }
    get().upsert(updated)
    logProposalStatusChanged(updated, from, status)
    if (status === 'pending_review' && from === 'draft') {
      logProposalReviewed(updated)
    }
  },

  setOperatorNote: (scopeKey, proposalId, note) =>
    set((s) => {
      const list = s.byScope[scopeKey]
      if (!list) return s
      const next = list.map((p) => (p.id === proposalId ? { ...p, operatorNote: note } : p))
      return { byScope: { ...s.byScope, [scopeKey]: next } }
    }),

  createDraftFromIncident: (incident) => {
    if (!isProposalQueueEnabled()) return null
    const proposal = buildProposalFromIncident(incident, 'draft')
    get().upsert(proposal)
    logProposalCreated(proposal)
    return proposal
  },

  createDraftFromGlobalDiagnostics: (snap) => {
    if (!isProposalQueueEnabled()) return null
    if (snap.overall === 'PASS') return null
    const proposal = buildProposalFromGlobalDiagnostics(snap, 'draft')
    get().upsert(proposal)
    logProposalCreated(proposal)
    return proposal
  },
}))
