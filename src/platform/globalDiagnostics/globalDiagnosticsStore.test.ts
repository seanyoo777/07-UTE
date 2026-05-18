import { beforeEach, describe, expect, it } from 'vitest'
import {
  buildDefaultGlobalDiagnosticsScope,
  buildGlobalDiagnosticsSnapshotFromBundle,
  buildMockGlobalDiagnosticsBundle,
} from './buildMockGlobalDiagnostics'
import { useGlobalDiagnosticsStore } from './globalDiagnosticsStore'

describe('globalDiagnosticsStore', () => {
  beforeEach(() => {
    useGlobalDiagnosticsStore.setState({ byScope: {} })
  })

  it('records snapshots per scopeKey', () => {
    const scope = buildDefaultGlobalDiagnosticsScope('tenant-store')
    const bundle = buildMockGlobalDiagnosticsBundle({ scope })
    const snap = buildGlobalDiagnosticsSnapshotFromBundle(bundle)

    useGlobalDiagnosticsStore.getState().record(snap)
    const recent = useGlobalDiagnosticsStore.getState().getRecent(scope.scopeKey, 2)

    expect(recent).toHaveLength(1)
    expect(recent[0]?.id).toBe(snap.id)
  })
})
