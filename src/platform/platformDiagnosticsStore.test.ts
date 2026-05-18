import { describe, expect, it, beforeEach } from 'vitest'
import { buildPlatformDiagnosticsScope } from './platformScope'
import { recordPlatformDiagnosticsSnapshot } from './recordPlatformDiagnosticsSnapshot'
import { runUteSelfTestSuite } from '../admin/selfTest/runUteSelfTestSuite'
import { usePlatformDiagnosticsStore } from './platformDiagnosticsStore'

describe('platformDiagnosticsStore', () => {
  beforeEach(() => {
    usePlatformDiagnosticsStore.setState({ byScope: {} })
  })

  it('records snapshots per scope key', () => {
    const scope = buildPlatformDiagnosticsScope('tenant-a', 'ute-07')
    const report = runUteSelfTestSuite({ bridgeErrorCount: 0 })
    const snap = recordPlatformDiagnosticsSnapshot(scope, report)
    usePlatformDiagnosticsStore.getState().record(snap)

    const recent = usePlatformDiagnosticsStore.getState().getRecent(scope.scopeKey, 1)
    expect(recent).toHaveLength(1)
    expect(recent[0].scope.tenantId).toBe('tenant-a')
    expect(recent[0].mockOnly).toBe(true)
  })
})
