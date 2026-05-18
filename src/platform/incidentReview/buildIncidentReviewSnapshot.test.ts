import { describe, expect, it } from 'vitest'
import { buildDefaultGlobalDiagnosticsScope } from '../globalDiagnostics/buildMockGlobalDiagnostics'
import {
  buildIncidentFromGlobalDiagnostics,
  buildIncidentFromUnifiedEvent,
  shouldIngestUnifiedEventAsIncident,
  validateIncidentReviewSchema,
} from './buildIncidentReviewSnapshot'
import { INCIDENT_REVIEW_SCHEMA_VERSION } from './incidentReviewTypes'

describe('buildIncidentReviewSnapshot', () => {
  const scope = buildDefaultGlobalDiagnosticsScope('tenant-inc')

  it('builds incident from unified warning event', () => {
    const incident = buildIncidentFromUnifiedEvent(
      {
        id: 'ue-1',
        source: 'oneai',
        severity: 'warning',
        title: 'OneAI warn',
        body: 'detail',
        at: Date.now(),
        mockOnly: true,
        scopeKey: scope.scopeKey,
      },
      scope,
    )

    expect(incident.schemaVersion).toBe(INCIDENT_REVIEW_SCHEMA_VERSION)
    expect(incident.mockOnly).toBe(true)
    expect(incident.triageVerdict).toBe('WARN')
    expect(incident.relatedEventIds).toContain('ue-1')
    expect(validateIncidentReviewSchema(incident).ok).toBe(true)
  })

  it('links diagnostics snapshot id from unified event', () => {
    const incident = buildIncidentFromUnifiedEvent(
      {
        id: 'ue-diag',
        source: 'diagnostics',
        severity: 'critical',
        title: 'FAIL',
        body: 'F1',
        at: Date.now(),
        mockOnly: true,
        scopeKey: scope.scopeKey,
        diagnosticsSnapshotId: 'snap-abc',
      },
      scope,
    )
    expect(incident.relatedDiagnosticsSnapshotId).toBe('snap-abc')
    expect(incident.triageVerdict).toBe('FAIL')
  })

  it('skips global PASS snapshots', () => {
    const snap = {
      id: 'g-1',
      scope,
      asOf: Date.now(),
      mockOnly: true as const,
      overall: 'PASS' as const,
      issueCount: { pass: 4, warn: 0, fail: 0 },
      sourceCount: 4,
      highlights: [],
    }
    expect(buildIncidentFromGlobalDiagnostics(snap)).toBeNull()
  })

  it('shouldIngest flags warning and diagnostics', () => {
    expect(
      shouldIngestUnifiedEventAsIncident({
        id: 'e',
        source: 'streamhub',
        severity: 'info',
        title: 't',
        body: 'b',
        at: 0,
        mockOnly: true,
        scopeKey: scope.scopeKey,
      }),
    ).toBe(false)
    expect(
      shouldIngestUnifiedEventAsIncident({
        id: 'e2',
        source: 'diagnostics',
        severity: 'info',
        title: 't',
        body: 'b',
        at: 0,
        mockOnly: true,
        scopeKey: scope.scopeKey,
        diagnosticsSnapshotId: 'x',
      }),
    ).toBe(true)
  })
})
