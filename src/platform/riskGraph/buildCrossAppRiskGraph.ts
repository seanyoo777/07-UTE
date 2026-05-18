import type { SelfTestVerdict } from '../../admin/selfTest/uteSelfTestTypes'
import type { GlobalDiagnosticsBundle } from '../globalDiagnostics/globalDiagnosticsTypes'
import { buildGlobalDiagnosticsSnapshotFromBundle } from '../globalDiagnostics/buildMockGlobalDiagnostics'
import type { IncidentReviewSnapshot } from '../incidentReview/incidentReviewTypes'
import type { ProposalSnapshot } from '../proposalQueue/proposalQueueTypes'
import type { PlatformDiagnosticsScope } from '../platformScope'
import type { UnifiedEventSeverity } from '../unifiedEventTypes'
import { appLabelForId, mapSourceToAppId } from './mapSourceToAppId'
import {
  CROSS_APP_RISK_APP_IDS,
  RISK_GRAPH_SCHEMA_VERSION,
  type CrossAppRiskAppId,
  type CrossAppRiskGraphSnapshot,
  type CrossAppRiskSnapshot,
  type RiskPressureLevel,
  type RiskTrend,
} from './riskGraphTypes'

export type BuildCrossAppRiskGraphInput = {
  scope: PlatformDiagnosticsScope
  globalBundle: GlobalDiagnosticsBundle
  incidents: IncidentReviewSnapshot[]
  proposals: ProposalSnapshot[]
  asOf?: number
}

function verdictToSeverity(v: SelfTestVerdict): UnifiedEventSeverity {
  if (v === 'FAIL') return 'critical'
  if (v === 'WARN') return 'warning'
  return 'info'
}

function pressureFromCount(count: number): RiskPressureLevel {
  if (count >= 3) return 'high'
  if (count >= 1) return 'medium'
  return 'low'
}

function mockRiskScore(health: SelfTestVerdict, incidentN: number, proposalN: number): number {
  let score = health === 'FAIL' ? 72 : health === 'WARN' ? 48 : 22
  score += incidentN * 8 + proposalN * 5
  return Math.min(99, Math.max(5, score))
}

function mockTrend(appId: CrossAppRiskAppId, score: number): RiskTrend {
  const mod = appId.length + score
  if (mod % 3 === 0) return 'up'
  if (mod % 3 === 1) return 'stable'
  return 'down'
}

function deriveOverall(map: { pass: number; warn: number; fail: number }): SelfTestVerdict {
  if (map.fail > 0) return 'FAIL'
  if (map.warn > 0) return 'WARN'
  return 'PASS'
}

export function buildCrossAppRiskGraph(
  input: BuildCrossAppRiskGraphInput,
): CrossAppRiskGraphSnapshot {
  const asOf = input.asOf ?? Date.now()
  const globalSnap = buildGlobalDiagnosticsSnapshotFromBundle(input.globalBundle)

  const incidentsByApp = new Map<CrossAppRiskAppId, IncidentReviewSnapshot[]>()
  for (const inc of input.incidents) {
    const appId = mapSourceToAppId(inc.source)
    const list = incidentsByApp.get(appId) ?? []
    list.push(inc)
    incidentsByApp.set(appId, list)
  }

  const proposalsByApp = new Map<CrossAppRiskAppId, ProposalSnapshot[]>()
  for (const prop of input.proposals) {
    const appId = mapSourceToAppId(prop.source)
    const list = proposalsByApp.get(appId) ?? []
    list.push(prop)
    proposalsByApp.set(appId, list)
  }

  const healthByApp = new Map<CrossAppRiskAppId, SelfTestVerdict>()
  for (const card of input.globalBundle.sourceCards) {
    healthByApp.set(card.id, card.overall)
  }
  healthByApp.set('ute-07', input.globalBundle.core.overall)

  const apps: CrossAppRiskSnapshot[] = CROSS_APP_RISK_APP_IDS.map((appId) => {
    const diagnosticsHealth = healthByApp.get(appId) ?? 'PASS'
    const appIncidents = incidentsByApp.get(appId) ?? []
    const appProposals = proposalsByApp.get(appId) ?? []
    const openIncidents = appIncidents.filter((i) => i.resolutionStatus === 'open')
    const activeProposals = appProposals.filter(
      (p) => p.status === 'draft' || p.status === 'pending_review',
    )
    const incidentPressure = pressureFromCount(openIncidents.length)
    const proposalPressure = pressureFromCount(activeProposals.length)
    const activeIssues = openIncidents.length + activeProposals.length
    const riskScoreMock = mockRiskScore(diagnosticsHealth, openIncidents.length, activeProposals.length)
    const severity = verdictToSeverity(diagnosticsHealth)

    return {
      schemaVersion: RISK_GRAPH_SCHEMA_VERSION,
      appId,
      appLabel: appLabelForId(appId),
      severity,
      riskScoreMock,
      activeIssues,
      diagnosticsHealth,
      proposalPressure,
      incidentPressure,
      trend: mockTrend(appId, riskScoreMock),
      mockOnly: true,
    }
  })

  const passWarnFailMap = { pass: 0, warn: 0, fail: 0 }
  for (const app of apps) {
    if (app.diagnosticsHealth === 'FAIL') passWarnFailMap.fail += 1
    else if (app.diagnosticsHealth === 'WARN') passWarnFailMap.warn += 1
    else passWarnFailMap.pass += 1
  }

  const proposalPressureSummary = {
    draft: input.proposals.filter((p) => p.status === 'draft').length,
    pendingReview: input.proposals.filter((p) => p.status === 'pending_review').length,
    approved: input.proposals.filter((p) => p.status === 'approved').length,
    total: input.proposals.length,
  }

  const incidentTrendSummary = {
    open: input.incidents.filter((i) => i.resolutionStatus === 'open').length,
    critical: input.incidents.filter((i) => i.severity === 'critical').length,
    warning: input.incidents.filter((i) => i.severity === 'warning').length,
    total: input.incidents.length,
  }

  return {
    schemaVersion: RISK_GRAPH_SCHEMA_VERSION,
    scope: input.scope,
    asOf,
    mockOnly: true,
    apps,
    overallVerdict: deriveOverall(passWarnFailMap),
    passWarnFailMap,
    proposalPressureSummary,
    incidentTrendSummary,
    relatedGlobalDiagnosticsId: globalSnap.id,
    relatedIncidentIds: input.incidents.map((i) => i.id),
    relatedProposalIds: input.proposals.map((p) => p.id),
  }
}

export function validateRiskGraphSchema(graph: CrossAppRiskGraphSnapshot): {
  ok: boolean
  message: string
} {
  if (graph.schemaVersion !== RISK_GRAPH_SCHEMA_VERSION) {
    return { ok: false, message: 'schemaVersion mismatch' }
  }
  if (graph.mockOnly !== true) {
    return { ok: false, message: 'mockOnly must be true' }
  }
  if (graph.apps.length !== CROSS_APP_RISK_APP_IDS.length) {
    return { ok: false, message: 'expected 5 cross-app nodes' }
  }
  for (const app of graph.apps) {
    if (app.riskScoreMock < 0 || app.riskScoreMock > 100) {
      return { ok: false, message: 'riskScoreMock out of range' }
    }
    if (app.mockOnly !== true) {
      return { ok: false, message: 'app.mockOnly must be true' }
    }
  }
  return { ok: true, message: 'risk graph schema valid' }
}
