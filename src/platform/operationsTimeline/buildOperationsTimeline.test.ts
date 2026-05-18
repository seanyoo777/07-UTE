import { describe, expect, it } from 'vitest'
import { buildDefaultGlobalDiagnosticsScope, buildMockGlobalDiagnosticsBundle } from '../globalDiagnostics/buildMockGlobalDiagnostics'
import { buildIncidentFromUnifiedEvent } from '../incidentReview/buildIncidentReviewSnapshot'
import { buildProposalFromIncident } from '../proposalQueue/buildProposalSnapshot'
import { buildCrossAppRiskGraph } from '../riskGraph/buildCrossAppRiskGraph'
import { buildOperationsTimeline, validateOperationsTimelineSchema } from './buildOperationsTimeline'

describe('buildOperationsTimeline', () => {
  const scope = buildDefaultGlobalDiagnosticsScope('tenant-ops')

  it('merges markers into sorted unified events', () => {
    const globalBundle = buildMockGlobalDiagnosticsBundle({ scope, bridgeErrorCount: 1 })
    const incident = buildIncidentFromUnifiedEvent(
      {
        id: 'ue-ops',
        source: 'diagnostics',
        severity: 'warning',
        title: 'Diag warn',
        body: 'b',
        at: 1000,
        mockOnly: true,
        scopeKey: scope.scopeKey,
      },
      scope,
    )
    const proposal = buildProposalFromIncident(incident)
    const riskGraph = buildCrossAppRiskGraph({
      scope,
      globalBundle,
      incidents: [incident],
      proposals: [proposal],
    })
    const timeline = buildOperationsTimeline({
      scope,
      globalBundle,
      incidents: [incident],
      proposals: [proposal],
      riskGraph,
      generatedAtMs: 2000,
    })

    expect(timeline.mockOnly).toBe(true)
    expect(timeline.events.length).toBeGreaterThan(0)
    expect(timeline.diagnosticsMarkers.length).toBeGreaterThan(0)
    expect(timeline.incidentMarkers).toHaveLength(1)
    expect(timeline.proposalMarkers).toHaveLength(1)
    expect(timeline.riskGraphMarkers).toHaveLength(1)
    expect(validateOperationsTimelineSchema(timeline).ok).toBe(true)
    for (let i = 1; i < timeline.events.length; i++) {
      expect(timeline.events[i - 1]!.at).toBeGreaterThanOrEqual(timeline.events[i]!.at)
    }
  })
})
