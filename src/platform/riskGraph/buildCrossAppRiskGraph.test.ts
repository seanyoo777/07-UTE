import { describe, expect, it } from 'vitest'
import { buildDefaultGlobalDiagnosticsScope, buildMockGlobalDiagnosticsBundle } from '../globalDiagnostics/buildMockGlobalDiagnostics'
import { buildIncidentFromUnifiedEvent } from '../incidentReview/buildIncidentReviewSnapshot'
import { buildProposalFromIncident } from '../proposalQueue/buildProposalSnapshot'
import { buildCrossAppRiskGraph, validateRiskGraphSchema } from './buildCrossAppRiskGraph'

describe('buildCrossAppRiskGraph', () => {
  const scope = buildDefaultGlobalDiagnosticsScope('tenant-risk')

  it('builds five app nodes with mockOnly', () => {
    const globalBundle = buildMockGlobalDiagnosticsBundle({ scope, bridgeErrorCount: 1 })
    const incident = buildIncidentFromUnifiedEvent(
      {
        id: 'ue-risk',
        source: 'oneai',
        severity: 'warning',
        title: 'OneAI',
        body: 'x',
        at: Date.now(),
        mockOnly: true,
        scopeKey: scope.scopeKey,
      },
      scope,
    )
    const proposal = buildProposalFromIncident(incident)
    const graph = buildCrossAppRiskGraph({
      scope,
      globalBundle,
      incidents: [incident],
      proposals: [proposal],
    })

    expect(graph.mockOnly).toBe(true)
    expect(graph.apps).toHaveLength(5)
    expect(graph.relatedIncidentIds).toContain(incident.id)
    expect(graph.relatedProposalIds).toContain(proposal.id)
    expect(graph.relatedGlobalDiagnosticsId).toBeDefined()
    expect(validateRiskGraphSchema(graph).ok).toBe(true)
  })

  it('maps incident pressure to oneai app', () => {
    const globalBundle = buildMockGlobalDiagnosticsBundle({ scope })
    const incident = buildIncidentFromUnifiedEvent(
      {
        id: 'ue-oneai',
        source: 'oneai',
        severity: 'critical',
        title: 'Critical',
        body: 'b',
        at: Date.now(),
        mockOnly: true,
        scopeKey: scope.scopeKey,
      },
      scope,
    )
    const graph = buildCrossAppRiskGraph({
      scope,
      globalBundle,
      incidents: [incident],
      proposals: [],
    })
    const oneai = graph.apps.find((a) => a.appId === '03-oneai')
    expect(oneai?.incidentPressure).not.toBe('low')
    expect(oneai?.activeIssues).toBeGreaterThanOrEqual(1)
  })
})
