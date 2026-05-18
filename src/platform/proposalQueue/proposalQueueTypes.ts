import type { PlatformDiagnosticsScope } from '../platformScope'
import type { IncidentReviewSource } from '../incidentReview/incidentReviewTypes'
import type { UnifiedEventSeverity } from '../unifiedEventTypes'

export const PROPOSAL_QUEUE_SCHEMA_VERSION = '1.0.0' as const

export const PROPOSAL_STATUSES = [
  'draft',
  'pending_review',
  'approved',
  'rejected',
  'deferred',
] as const

export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number]

export const PROPOSAL_CATEGORIES = [
  'operations',
  'security',
  'integration',
  'diagnostics',
] as const

export type ProposalCategory = (typeof PROPOSAL_CATEGORIES)[number]

export const PROPOSAL_TYPES = [
  'config_review',
  'monitoring',
  'escalation',
  'runbook',
] as const

export type ProposalType = (typeof PROPOSAL_TYPES)[number]

export type ProposalSource = IncidentReviewSource | 'global-diagnostics' | 'operator'

export type ProposalSnapshot = {
  schemaVersion: typeof PROPOSAL_QUEUE_SCHEMA_VERSION
  id: string
  category: ProposalCategory
  severity: UnifiedEventSeverity
  proposalType: ProposalType
  source: ProposalSource
  scope: PlatformDiagnosticsScope
  createdAt: number
  status: ProposalStatus
  mockAiSummary: string
  mockImpactSummary: string
  operatorNote: string
  relatedIncidentIds: string[]
  relatedGlobalDiagnosticsSnapshotId?: string
  relatedDiagnosticsSnapshotId?: string
  mockOnly: true
}
