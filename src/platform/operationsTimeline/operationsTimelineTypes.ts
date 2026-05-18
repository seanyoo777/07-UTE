import type { SelfTestVerdict } from '../../admin/selfTest/uteSelfTestTypes'
import type { PlatformDiagnosticsScope } from '../platformScope'
import type { UnifiedEventSeverity } from '../unifiedEventTypes'
import type { ProposalStatus } from '../proposalQueue/proposalQueueTypes'
import type { IncidentResolutionStatus } from '../incidentReview/incidentReviewTypes'

export const OPERATIONS_TIMELINE_SCHEMA_VERSION = '1.0.0' as const

export type TimelineEventKind = 'diagnostics' | 'incident' | 'proposal' | 'risk_graph'

export type OperationsTimelineEvent = {
  id: string
  at: number
  kind: TimelineEventKind
  label: string
  detail: string
  verdict?: SelfTestVerdict
  severity?: UnifiedEventSeverity
  refId: string
}

export type DiagnosticsTimelineMarker = {
  id: string
  at: number
  overall: SelfTestVerdict
  snapshotId?: string
  appLabel?: string
  label: string
}

export type IncidentTimelineMarker = {
  id: string
  at: number
  incidentId: string
  triageVerdict: SelfTestVerdict
  severity: UnifiedEventSeverity
  resolutionStatus: IncidentResolutionStatus
  label: string
}

export type ProposalTimelineMarker = {
  id: string
  at: number
  proposalId: string
  status: ProposalStatus
  severity: UnifiedEventSeverity
  label: string
}

export type RiskGraphTimelineMarker = {
  id: string
  at: number
  overallVerdict: SelfTestVerdict
  riskGraphRef: string
  label: string
  proposalPressureHigh: number
  incidentOpen: number
}

export type OperationsTimelineSnapshot = {
  schemaVersion: typeof OPERATIONS_TIMELINE_SCHEMA_VERSION
  scope: PlatformDiagnosticsScope
  generatedAtMs: number
  mockOnly: true
  events: OperationsTimelineEvent[]
  diagnosticsMarkers: DiagnosticsTimelineMarker[]
  incidentMarkers: IncidentTimelineMarker[]
  proposalMarkers: ProposalTimelineMarker[]
  riskGraphMarkers: RiskGraphTimelineMarker[]
  passWarnFailCount: { pass: number; warn: number; fail: number }
  proposalPressureSummary: string
  incidentTrendSummary: string
}
