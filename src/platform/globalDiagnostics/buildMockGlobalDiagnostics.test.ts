import { describe, expect, it } from 'vitest'
import { GLOBAL_DIAGNOSTICS_SOURCE_IDS } from './globalDiagnosticsTypes'
import {
  buildGlobalDiagnosticsSnapshotFromBundle,
  buildMockGlobalDiagnosticsBundle,
  buildDefaultGlobalDiagnosticsScope,
} from './buildMockGlobalDiagnostics'

describe('buildMockGlobalDiagnostics', () => {
  it('builds four cross-app source cards with mockOnly', () => {
    const scope = buildDefaultGlobalDiagnosticsScope('tenant-a')
    const bundle = buildMockGlobalDiagnosticsBundle({ scope, bridgeErrorCount: 0 })

    expect(bundle.mockOnly).toBe(true)
    expect(bundle.sourceCards).toHaveLength(GLOBAL_DIAGNOSTICS_SOURCE_IDS.length)
    expect(bundle.sourceCards.every((c) => c.mockOnly)).toBe(true)
    expect(bundle.core.suites).toHaveLength(4)
  })

  it('escalates verdicts when bridge errors increase', () => {
    const scope = buildDefaultGlobalDiagnosticsScope('tenant-b')
    const calm = buildMockGlobalDiagnosticsBundle({ scope, bridgeErrorCount: 0 })
    const stressed = buildMockGlobalDiagnosticsBundle({ scope, bridgeErrorCount: 4 })

    const calmFails = calm.sourceCards.filter((c) => c.overall === 'FAIL').length
    const stressedFails = stressed.sourceCards.filter((c) => c.overall === 'FAIL').length
    expect(stressedFails).toBeGreaterThanOrEqual(calmFails)
  })

  it('snapshot uses core overall and per-app issue counts', () => {
    const bundle = buildMockGlobalDiagnosticsBundle({
      scope: buildDefaultGlobalDiagnosticsScope('tenant-c'),
    })
    const snap = buildGlobalDiagnosticsSnapshotFromBundle(bundle)

    expect(snap.mockOnly).toBe(true)
    expect(snap.overall).toBe(bundle.core.overall)
    expect(snap.issueCount.pass + snap.issueCount.warn + snap.issueCount.fail).toBe(4)
    expect(snap.highlights.length).toBe(4)
  })
})
