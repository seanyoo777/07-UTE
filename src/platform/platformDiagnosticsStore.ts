import { create } from 'zustand'
import type { PlatformDiagnosticsSnapshot } from './platformDiagnosticsTypes'

const MAX_PER_SCOPE = 8

type State = {
  byScope: Record<string, PlatformDiagnosticsSnapshot[]>
  record: (snapshot: PlatformDiagnosticsSnapshot) => void
  getRecent: (scopeKey: string, limit?: number) => PlatformDiagnosticsSnapshot[]
}

export const usePlatformDiagnosticsStore = create<State>((set, get) => ({
  byScope: {},
  record: (snapshot) =>
    set((s) => {
      const key = snapshot.scope.scopeKey
      const prev = s.byScope[key] ?? []
      const next = [snapshot, ...prev.filter((p) => p.id !== snapshot.id)].slice(0, MAX_PER_SCOPE)
      return { byScope: { ...s.byScope, [key]: next } }
    }),
  getRecent: (scopeKey, limit = 3) => {
    const list = get().byScope[scopeKey] ?? []
    return list.slice(0, limit)
  },
}))
