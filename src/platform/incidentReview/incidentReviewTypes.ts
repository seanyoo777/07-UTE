import type { SelfTestVerdict } from '../../admin/selfTest/uteSelfTestTypes'
import type { PlatformDiagnosticsScope } from '../platformScope'
import type { UnifiedEventSeverity, UnifiedEventSource } from '../unifiedEventTypes'

export const INCIDENT_REVIEW_SCHEMA_VERSION = '1.0.0' as const

export type IncidentReviewSource = UnifiedEventSource | 'global-diagnostics'

export type IncidentResolutionStatus = 'open' | 'reviewed' | 'mock_resolved'

export type IncidentReviewSnapshot = {
  schemaVersion: typeof INCIDENT_REVIEW_SCHEMA_VERSION
  id: string
  source: IncidentReviewSource
  severity: UnifiedEventSeverity
  scope: PlatformDiagnosticsScope
  createdAt: number
  mockOnly: true
  resolutionStatus: IncidentResolutionStatus
  triageVerdict: SelfTestVerdict
  relatedDiagnosticsSnapshotId?: string
  relatedGlobalDiagnosticsSnapshotId?: string
  relatedEventIds: string[]
  title: string
  body: string
  mockAiRecommendation: string
  mockRootCauseSummary: string
  mockOperatorNote: string
}
