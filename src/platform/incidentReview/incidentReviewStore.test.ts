import { beforeEach, describe, expect, it } from 'vitest'
import { buildDefaultGlobalDiagnosticsScope } from '../globalDiagnostics/buildMockGlobalDiagnostics'
import { buildIncidentFromUnifiedEvent } from './buildIncidentReviewSnapshot'
import { useIncidentReviewStore } from './incidentReviewStore'

describe('incidentReviewStore', () => {
  beforeEach(() => {
    useIncidentReviewStore.setState({ byScope: {} })
  })

  it('upserts incidents per scope', () => {
    const scope = buildDefaultGlobalDiagnosticsScope('tenant-store')
    const incident = buildIncidentFromUnifiedEvent(
      {
        id: 'ue-store',
        source: 'escrow',
        severity: 'critical',
        title: 'Escrow',
        body: 'locked',
        at: Date.now(),
        mockOnly: true,
        scopeKey: scope.scopeKey,
      },
      scope,
    )
    useIncidentReviewStore.getState().upsert(incident)
    expect(useIncidentReviewStore.getState().getRecent(scope.scopeKey)).toHaveLength(1)
  })

  it('updates resolution status', () => {
    const scope = buildDefaultGlobalDiagnosticsScope('tenant-res')
    const incident = buildIncidentFromUnifiedEvent(
      {
        id: 'ue-res',
        source: 'admin',
        severity: 'warning',
        title: 'Admin',
        body: 'x',
        at: Date.now(),
        mockOnly: true,
        scopeKey: scope.scopeKey,
      },
      scope,
    )
    useIncidentReviewStore.getState().upsert(incident)
    useIncidentReviewStore.getState().setResolution(scope.scopeKey, incident.id, 'reviewed')
    const row = useIncidentReviewStore.getState().getRecent(scope.scopeKey)[0]
    expect(row?.resolutionStatus).toBe('reviewed')
  })
})
