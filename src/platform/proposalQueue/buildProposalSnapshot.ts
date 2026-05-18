import type { GlobalDiagnosticsSnapshot } from '../globalDiagnostics/globalDiagnosticsTypes'
import type { IncidentReviewSnapshot } from '../incidentReview/incidentReviewTypes'
import type { UnifiedEventSeverity } from '../unifiedEventTypes'
import {
  PROPOSAL_QUEUE_SCHEMA_VERSION,
  PROPOSAL_STATUSES,
  type ProposalCategory,
  type ProposalSnapshot,
  type ProposalSource,
  type ProposalStatus,
  type ProposalType,
} from './proposalQueueTypes'

let proposalSeq = 0

export function nextProposalId(prefix: string): string {
  proposalSeq += 1
  return `proposal-${prefix}-${proposalSeq}`
}

function categoryForSource(source: ProposalSource): ProposalCategory {
  if (source === 'global-diagnostics' || source === 'diagnostics') return 'diagnostics'
  if (source === 'escrow' || source === 'tenant') return 'security'
  if (source === 'oneai' || source === 'streamhub') return 'integration'
  return 'operations'
}

function proposalTypeForSeverity(severity: UnifiedEventSeverity): ProposalType {
  if (severity === 'critical') return 'escalation'
  if (severity === 'warning') return 'monitoring'
  return 'runbook'
}

function buildMockSummaries(input: {
  title: string
  source: ProposalSource
  severity: UnifiedEventSeverity
}): { mockAiSummary: string; mockImpactSummary: string } {
  return {
    mockAiSummary: `[mock AI] Review "${input.title}" (${input.source}) — suggest operator approval only; no autonomous execution.`,
    mockImpactSummary: `[mock] ${input.severity} scope impact — UI/mock state only; no production config changes.`,
  }
}

export function buildProposalFromIncident(
  incident: IncidentReviewSnapshot,
  status: ProposalStatus = 'draft',
): ProposalSnapshot {
  const summaries = buildMockSummaries({
    title: incident.title,
    source: incident.source,
    severity: incident.severity,
  })

  return {
    schemaVersion: PROPOSAL_QUEUE_SCHEMA_VERSION,
    id: nextProposalId('incident'),
    category: categoryForSource(incident.source),
    severity: incident.severity,
    proposalType: proposalTypeForSeverity(incident.severity),
    source: incident.source,
    scope: incident.scope,
    createdAt: Date.now(),
    status,
    mockAiSummary: summaries.mockAiSummary,
    mockImpactSummary: summaries.mockImpactSummary,
    operatorNote: `Draft from incident ${incident.id}`,
    relatedIncidentIds: [incident.id],
    relatedDiagnosticsSnapshotId: incident.relatedDiagnosticsSnapshotId,
    relatedGlobalDiagnosticsSnapshotId: incident.relatedGlobalDiagnosticsSnapshotId,
    mockOnly: true,
  }
}

export function buildProposalFromGlobalDiagnostics(
  snap: GlobalDiagnosticsSnapshot,
  status: ProposalStatus = 'draft',
): ProposalSnapshot {
  const severity: UnifiedEventSeverity = snap.overall === 'FAIL' ? 'critical' : 'warning'
  const summaries = buildMockSummaries({
    title: `Global ${snap.overall}`,
    source: 'global-diagnostics',
    severity,
  })

  return {
    schemaVersion: PROPOSAL_QUEUE_SCHEMA_VERSION,
    id: nextProposalId('global'),
    category: 'diagnostics',
    severity,
    proposalType: proposalTypeForSeverity(severity),
    source: 'global-diagnostics',
    scope: snap.scope,
    createdAt: Date.now(),
    status,
    mockAiSummary: summaries.mockAiSummary,
    mockImpactSummary: `${summaries.mockImpactSummary} Ref: ${snap.highlights.join(' · ')}`,
    operatorNote: `Draft from global snapshot ${snap.id}`,
    relatedIncidentIds: [],
    relatedGlobalDiagnosticsSnapshotId: snap.id,
    mockOnly: true,
  }
}

export function validateProposalQueueSchema(proposal: ProposalSnapshot): {
  ok: boolean
  message: string
} {
  if (proposal.schemaVersion !== PROPOSAL_QUEUE_SCHEMA_VERSION) {
    return { ok: false, message: 'schemaVersion mismatch' }
  }
  if (proposal.mockOnly !== true) {
    return { ok: false, message: 'mockOnly must be true' }
  }
  if (!proposal.id || !proposal.scope.scopeKey) {
    return { ok: false, message: 'id and scope required' }
  }
  if (!PROPOSAL_STATUSES.includes(proposal.status)) {
    return { ok: false, message: 'invalid status' }
  }
  if (!Array.isArray(proposal.relatedIncidentIds)) {
    return { ok: false, message: 'relatedIncidentIds must be array' }
  }
  return { ok: true, message: 'proposal queue schema valid' }
}
