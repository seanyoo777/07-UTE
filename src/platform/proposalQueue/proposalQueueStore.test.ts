import { beforeEach, describe, expect, it } from 'vitest'
import { buildDefaultGlobalDiagnosticsScope } from '../globalDiagnostics/buildMockGlobalDiagnostics'
import { buildIncidentFromUnifiedEvent } from '../incidentReview/buildIncidentReviewSnapshot'
import { useProposalQueueStore } from './proposalQueueStore'

describe('proposalQueueStore', () => {
  beforeEach(() => {
    useProposalQueueStore.setState({ byScope: {} })
  })

  it('createDraftFromIncident stores proposal', () => {
    const scope = buildDefaultGlobalDiagnosticsScope('tenant-pq')
    const incident = buildIncidentFromUnifiedEvent(
      {
        id: 'ue-pq',
        source: 'admin',
        severity: 'critical',
        title: 'Critical',
        body: 'x',
        at: Date.now(),
        mockOnly: true,
        scopeKey: scope.scopeKey,
      },
      scope,
    )
    const proposal = useProposalQueueStore.getState().createDraftFromIncident(incident)
    expect(proposal).not.toBeNull()
    expect(useProposalQueueStore.getState().getRecent(scope.scopeKey)).toHaveLength(1)
  })

  it('setStatus updates proposal', () => {
    const scope = buildDefaultGlobalDiagnosticsScope('tenant-st')
    const incident = buildIncidentFromUnifiedEvent(
      {
        id: 'ue-st',
        source: 'oneai',
        severity: 'warning',
        title: 'W',
        body: 'b',
        at: Date.now(),
        mockOnly: true,
        scopeKey: scope.scopeKey,
      },
      scope,
    )
    const created = useProposalQueueStore.getState().createDraftFromIncident(incident)
    expect(created).not.toBeNull()
    useProposalQueueStore.getState().setStatus(scope.scopeKey, created!.id, 'approved')
    const row = useProposalQueueStore.getState().getRecent(scope.scopeKey)[0]
    expect(row?.status).toBe('approved')
  })
})
