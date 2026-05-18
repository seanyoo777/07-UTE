import { describe, expect, it, beforeEach } from 'vitest'
import { useWorkspaceContextStore } from './workspaceContextStore'

describe('workspaceContextStore', () => {
  beforeEach(() => {
    useWorkspaceContextStore.setState({
      scopeKey: 'ute-07:tenant-a',
      activeContext: null,
      activeEventId: null,
      lastRoute: null,
    })
  })

  it('navigates within tenant scope', () => {
    const ok = useWorkspaceContextStore.getState().navigateTo({
      contextId: 'oneai',
      scopeKey: 'ute-07:tenant-a',
      eventId: 'ue-oneai-1',
    })
    expect(ok).toBe(true)
    expect(useWorkspaceContextStore.getState().activeContext).toBe('oneai')
    expect(useWorkspaceContextStore.getState().activeEventId).toBe('ue-oneai-1')
  })

  it('rejects navigation for mismatched scope', () => {
    const ok = useWorkspaceContextStore.getState().navigateTo({
      contextId: 'admin',
      scopeKey: 'ute-07:other-tenant',
    })
    expect(ok).toBe(false)
    expect(useWorkspaceContextStore.getState().activeContext).toBe(null)
  })

  it('clears scope on tenant sync change', () => {
    useWorkspaceContextStore.getState().navigateTo({
      contextId: 'escrow',
      scopeKey: 'ute-07:tenant-a',
    })
    useWorkspaceContextStore.getState().syncScope('ute-07:tenant-b')
    expect(useWorkspaceContextStore.getState().activeContext).toBe(null)
    expect(useWorkspaceContextStore.getState().scopeKey).toBe('ute-07:tenant-b')
  })
})
