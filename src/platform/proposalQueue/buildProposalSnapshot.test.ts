import { describe, expect, it } from 'vitest'
import { buildDefaultGlobalDiagnosticsScope } from '../globalDiagnostics/buildMockGlobalDiagnostics'
import { buildIncidentFromUnifiedEvent } from '../incidentReview/buildIncidentReviewSnapshot'
import {
  buildProposalFromGlobalDiagnostics,
  buildProposalFromIncident,
  validateProposalQueueSchema,
} from './buildProposalSnapshot'
import { PROPOSAL_QUEUE_SCHEMA_VERSION } from './proposalQueueTypes'

describe('buildProposalSnapshot', () => {
  const scope = buildDefaultGlobalDiagnosticsScope('tenant-prop')

  it('builds draft from incident with related ids', () => {
    const incident = buildIncidentFromUnifiedEvent(
      {
        id: 'ue-prop',
        source: 'diagnostics',
        severity: 'warning',
        title: 'Warn',
        body: 'b',
        at: Date.now(),
        mockOnly: true,
        scopeKey: scope.scopeKey,
        diagnosticsSnapshotId: 'diag-1',
      },
      scope,
    )
    const proposal = buildProposalFromIncident(incident)

    expect(proposal.schemaVersion).toBe(PROPOSAL_QUEUE_SCHEMA_VERSION)
    expect(proposal.status).toBe('draft')
    expect(proposal.mockOnly).toBe(true)
    expect(proposal.relatedIncidentIds).toContain(incident.id)
    expect(proposal.relatedDiagnosticsSnapshotId).toBe('diag-1')
    expect(validateProposalQueueSchema(proposal).ok).toBe(true)
  })

  it('builds from global diagnostics snapshot', () => {
    const snap = {
      id: 'global-snap-1',
      scope,
      asOf: Date.now(),
      mockOnly: true as const,
      overall: 'WARN' as const,
      issueCount: { pass: 2, warn: 2, fail: 0 },
      sourceCount: 4,
      highlights: ['01 P2P:WARN'],
    }
    const proposal = buildProposalFromGlobalDiagnostics(snap)
    expect(proposal?.relatedGlobalDiagnosticsSnapshotId).toBe('global-snap-1')
    expect(proposal?.status).toBe('draft')
  })
})
