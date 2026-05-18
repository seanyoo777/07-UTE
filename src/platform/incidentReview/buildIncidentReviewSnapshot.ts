import type { SelfTestVerdict } from '../../admin/selfTest/uteSelfTestTypes'
import type { GlobalDiagnosticsSnapshot } from '../globalDiagnostics/globalDiagnosticsTypes'
import type { PlatformDiagnosticsSnapshot } from '../platformDiagnosticsTypes'
import type { PlatformDiagnosticsScope } from '../platformScope'
import type { UnifiedEvent, UnifiedEventSeverity } from '../unifiedEventTypes'
import {
  INCIDENT_REVIEW_SCHEMA_VERSION,
  type IncidentReviewSnapshot,
  type IncidentReviewSource,
} from './incidentReviewTypes'

export function severityToTriageVerdict(severity: UnifiedEventSeverity): SelfTestVerdict {
  if (severity === 'critical') return 'FAIL'
  if (severity === 'warning') return 'WARN'
  return 'PASS'
}

export function overallToTriageVerdict(overall: SelfTestVerdict): SelfTestVerdict {
  return overall
}

function buildMockAiCopy(input: {
  source: IncidentReviewSource
  severity: UnifiedEventSeverity
  title: string
}): { recommendation: string; rootCause: string; operatorNote: string } {
  const base = input.title
  if (input.severity === 'critical') {
    return {
      recommendation: `[mock AI] Escalate ${input.source} — verify scope isolation before any config change. No auto-remediation.`,
      rootCause: `[mock] Elevated signal on "${base}" — likely mock bridge drift or diagnostics FAIL aggregate.`,
      operatorNote: 'Operator triage required · mock playbook step 1',
    }
  }
  if (input.severity === 'warning') {
    return {
      recommendation: `[mock AI] Monitor ${input.source} for 15m (mock window) — document in incident board only.`,
      rootCause: `[mock] Warning on "${base}" — cross-check unified feed + platform diagnostics snapshot.`,
      operatorNote: 'Review when convenient · no automated fix',
    }
  }
  return {
    recommendation: `[mock AI] Informational — log for audit trail; no action unless trend repeats.`,
    rootCause: `[mock] Benign signal "${base}" — diagnostics-ui PASS path.`,
    operatorNote: 'Acknowledge only',
  }
}

let incidentSeq = 0

export function nextIncidentId(prefix: string): string {
  incidentSeq += 1
  return `incident-${prefix}-${incidentSeq}`
}

export function buildIncidentFromUnifiedEvent(
  event: UnifiedEvent,
  scope: PlatformDiagnosticsScope,
): IncidentReviewSnapshot {
  const triageVerdict = severityToTriageVerdict(event.severity)
  const ai = buildMockAiCopy({ source: event.source, severity: event.severity, title: event.title })

  return {
    schemaVersion: INCIDENT_REVIEW_SCHEMA_VERSION,
    id: nextIncidentId(event.source),
    source: event.source,
    severity: event.severity,
    scope,
    createdAt: event.at,
    mockOnly: true,
    resolutionStatus: 'open',
    triageVerdict,
    relatedDiagnosticsSnapshotId: event.diagnosticsSnapshotId,
    relatedEventIds: [event.id],
    title: event.title,
    body: event.body,
    mockAiRecommendation: ai.recommendation,
    mockRootCauseSummary: ai.rootCause,
    mockOperatorNote: ai.operatorNote,
  }
}

export function buildIncidentFromPlatformDiagnostics(
  snap: PlatformDiagnosticsSnapshot,
  eventId?: string,
): IncidentReviewSnapshot {
  const triageVerdict = overallToTriageVerdict(snap.overall)
  const severity: UnifiedEventSeverity =
    snap.overall === 'FAIL' ? 'critical' : snap.overall === 'WARN' ? 'warning' : 'info'
  const ai = buildMockAiCopy({
    source: 'diagnostics',
    severity,
    title: `Platform self-test ${snap.overall}`,
  })

  return {
    schemaVersion: INCIDENT_REVIEW_SCHEMA_VERSION,
    id: nextIncidentId('diag'),
    source: 'diagnostics',
    severity,
    scope: snap.scope,
    createdAt: snap.asOf,
    mockOnly: true,
    resolutionStatus: 'open',
    triageVerdict,
    relatedDiagnosticsSnapshotId: snap.id,
    relatedEventIds: eventId ? [eventId] : [],
    title: `Platform diagnostics ${snap.overall}`,
    body: snap.highlights.join(' · ') || `P${snap.issueCount.pass} W${snap.issueCount.warn} F${snap.issueCount.fail}`,
    mockAiRecommendation: ai.recommendation,
    mockRootCauseSummary: ai.rootCause,
    mockOperatorNote: ai.operatorNote,
  }
}

export function buildIncidentFromGlobalDiagnostics(
  snap: GlobalDiagnosticsSnapshot,
): IncidentReviewSnapshot | null {
  if (snap.overall === 'PASS') return null

  const severity: UnifiedEventSeverity = snap.overall === 'FAIL' ? 'critical' : 'warning'
  const ai = buildMockAiCopy({
    source: 'global-diagnostics',
    severity,
    title: `Global diagnostics ${snap.overall}`,
  })

  return {
    schemaVersion: INCIDENT_REVIEW_SCHEMA_VERSION,
    id: nextIncidentId('global'),
    source: 'global-diagnostics',
    severity,
    scope: snap.scope,
    createdAt: snap.asOf,
    mockOnly: true,
    resolutionStatus: 'open',
    triageVerdict: overallToTriageVerdict(snap.overall),
    relatedGlobalDiagnosticsSnapshotId: snap.id,
    relatedEventIds: [],
    title: `Cross-app diagnostics ${snap.overall}`,
    body: snap.highlights.join(' · '),
    mockAiRecommendation: ai.recommendation,
    mockRootCauseSummary: ai.rootCause,
    mockOperatorNote: ai.operatorNote,
  }
}

export function shouldIngestUnifiedEventAsIncident(event: UnifiedEvent): boolean {
  if (event.severity === 'critical' || event.severity === 'warning') return true
  if (event.source === 'diagnostics' && event.diagnosticsSnapshotId) return true
  return false
}

export function validateIncidentReviewSchema(snapshot: IncidentReviewSnapshot): {
  ok: boolean
  message: string
} {
  if (snapshot.schemaVersion !== INCIDENT_REVIEW_SCHEMA_VERSION) {
    return { ok: false, message: 'schemaVersion mismatch' }
  }
  if (snapshot.mockOnly !== true) {
    return { ok: false, message: 'mockOnly must be true' }
  }
  if (!snapshot.scope.scopeKey) {
    return { ok: false, message: 'scope.scopeKey required' }
  }
  if (snapshot.relatedEventIds.length < 0) {
    return { ok: false, message: 'relatedEventIds invalid' }
  }
  if (!['open', 'reviewed', 'mock_resolved'].includes(snapshot.resolutionStatus)) {
    return { ok: false, message: 'invalid resolutionStatus' }
  }
  return { ok: true, message: 'incident review schema valid' }
}
