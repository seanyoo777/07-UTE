import type { SelfTestVerdict } from '../../admin/selfTest/uteSelfTestTypes'
import { buildGlobalDiagnosticsSnapshotFromBundle } from '../globalDiagnostics/buildMockGlobalDiagnostics'
import type { GlobalDiagnosticsBundle } from '../globalDiagnostics/globalDiagnosticsTypes'
import type { IncidentReviewSnapshot } from '../incidentReview/incidentReviewTypes'
import type { ProposalSnapshot } from '../proposalQueue/proposalQueueTypes'
import type { PlatformDiagnosticsScope } from '../platformScope'
import type { CrossAppRiskGraphSnapshot } from '../riskGraph/riskGraphTypes'
import {
  OPERATIONS_TIMELINE_SCHEMA_VERSION,
  type DiagnosticsTimelineMarker,
  type IncidentTimelineMarker,
  type OperationsTimelineEvent,
  type OperationsTimelineSnapshot,
  type ProposalTimelineMarker,
  type RiskGraphTimelineMarker,
} from './operationsTimelineTypes'

export type BuildOperationsTimelineInput = {
  scope: PlatformDiagnosticsScope
  globalBundle: GlobalDiagnosticsBundle
  incidents: IncidentReviewSnapshot[]
  proposals: ProposalSnapshot[]
  riskGraph: CrossAppRiskGraphSnapshot
  generatedAtMs?: number
}

function severityToVerdict(severity: IncidentReviewSnapshot['severity']): SelfTestVerdict {
  if (severity === 'critical') return 'FAIL'
  if (severity === 'warning') return 'WARN'
  return 'PASS'
}

function sortEventsDesc(events: OperationsTimelineEvent[]): OperationsTimelineEvent[] {
  return [...events].sort((a, b) => b.at - a.at)
}

export function buildOperationsTimeline(
  input: BuildOperationsTimelineInput,
): OperationsTimelineSnapshot {
  const generatedAtMs = input.generatedAtMs ?? Date.now()
  const globalSnap = buildGlobalDiagnosticsSnapshotFromBundle(input.globalBundle)
  const { riskGraph } = input

  const diagnosticsMarkers: DiagnosticsTimelineMarker[] = [
    {
      id: `diag-marker-global-${globalSnap.id}`,
      at: globalSnap.asOf,
      overall: globalSnap.overall,
      snapshotId: globalSnap.id,
      label: `Global diagnostics ${globalSnap.overall}`,
    },
    ...input.globalBundle.sourceCards.map((card) => ({
      id: `diag-marker-${card.id}`,
      at: card.lastCheckedAtMs,
      overall: card.overall,
      appLabel: card.appLabel,
      label: `${card.appLabel} ${card.overall}`,
    })),
  ]

  const incidentMarkers: IncidentTimelineMarker[] = input.incidents.map((inc) => ({
    id: `inc-marker-${inc.id}`,
    at: inc.createdAt,
    incidentId: inc.id,
    triageVerdict: inc.triageVerdict,
    severity: inc.severity,
    resolutionStatus: inc.resolutionStatus,
    label: inc.title,
  }))

  const proposalMarkers: ProposalTimelineMarker[] = input.proposals.map((prop) => ({
    id: `prop-marker-${prop.id}`,
    at: prop.createdAt,
    proposalId: prop.id,
    status: prop.status,
    severity: prop.severity,
    label: `${prop.category} · ${prop.proposalType}`,
  }))

  const proposalPressureHigh = input.proposals.filter(
    (p) => p.status === 'draft' || p.status === 'pending_review',
  ).length
  const incidentOpen = input.incidents.filter((i) => i.resolutionStatus === 'open').length

  const riskGraphMarkers: RiskGraphTimelineMarker[] = [
    {
      id: `risk-marker-${riskGraph.asOf}`,
      at: riskGraph.asOf,
      overallVerdict: riskGraph.overallVerdict,
      riskGraphRef: riskGraph.relatedGlobalDiagnosticsId ?? `risk-${riskGraph.asOf}`,
      label: `Risk graph ${riskGraph.overallVerdict}`,
      proposalPressureHigh,
      incidentOpen,
    },
  ]

  const events: OperationsTimelineEvent[] = []

  for (const m of diagnosticsMarkers) {
    events.push({
      id: `evt-${m.id}`,
      at: m.at,
      kind: 'diagnostics',
      label: m.label,
      detail: m.snapshotId ? `snapshot=${m.snapshotId}` : 'cross-app card',
      verdict: m.overall,
      refId: m.id,
    })
  }
  for (const m of incidentMarkers) {
    events.push({
      id: `evt-${m.id}`,
      at: m.at,
      kind: 'incident',
      label: m.label,
      detail: `${m.resolutionStatus} · ${m.severity}`,
      verdict: m.triageVerdict,
      severity: m.severity,
      refId: m.incidentId,
    })
  }
  for (const m of proposalMarkers) {
    events.push({
      id: `evt-${m.id}`,
      at: m.at,
      kind: 'proposal',
      label: m.label,
      detail: `status=${m.status}`,
      verdict: severityToVerdict(m.severity),
      severity: m.severity,
      refId: m.proposalId,
    })
  }
  for (const m of riskGraphMarkers) {
    events.push({
      id: `evt-${m.id}`,
      at: m.at,
      kind: 'risk_graph',
      label: m.label,
      detail: `open incidents=${m.incidentOpen} active proposals=${m.proposalPressureHigh}`,
      verdict: m.overallVerdict,
      refId: m.riskGraphRef,
    })
  }

  const passWarnFailCount = { ...riskGraph.passWarnFailMap }
  const proposalPressureSummary = `draft ${riskGraph.proposalPressureSummary.draft} · pending ${riskGraph.proposalPressureSummary.pendingReview} · total ${riskGraph.proposalPressureSummary.total}`
  const incidentTrendSummary = `open ${riskGraph.incidentTrendSummary.open} · critical ${riskGraph.incidentTrendSummary.critical} · warn ${riskGraph.incidentTrendSummary.warning}`

  return {
    schemaVersion: OPERATIONS_TIMELINE_SCHEMA_VERSION,
    scope: input.scope,
    generatedAtMs,
    mockOnly: true,
    events: sortEventsDesc(events),
    diagnosticsMarkers,
    incidentMarkers,
    proposalMarkers,
    riskGraphMarkers,
    passWarnFailCount,
    proposalPressureSummary,
    incidentTrendSummary,
  }
}

export function validateOperationsTimelineSchema(
  timeline: OperationsTimelineSnapshot,
): { ok: boolean; message: string } {
  if (timeline.schemaVersion !== OPERATIONS_TIMELINE_SCHEMA_VERSION) {
    return { ok: false, message: 'schemaVersion mismatch' }
  }
  if (timeline.mockOnly !== true) {
    return { ok: false, message: 'mockOnly must be true' }
  }
  if (!timeline.scope.scopeKey) {
    return { ok: false, message: 'scope required' }
  }
  if (timeline.generatedAtMs < 1) {
    return { ok: false, message: 'generatedAtMs required' }
  }
  if (!Array.isArray(timeline.events)) {
    return { ok: false, message: 'events must be array' }
  }
  return { ok: true, message: 'operations timeline schema valid' }
}
