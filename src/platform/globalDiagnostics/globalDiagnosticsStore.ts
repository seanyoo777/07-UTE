import { create } from 'zustand'
import type { GlobalDiagnosticsSnapshot } from './globalDiagnosticsTypes'

const MAX_PER_SCOPE = 6

type State = {
  byScope: Record<string, GlobalDiagnosticsSnapshot[]>
  record: (snapshot: GlobalDiagnosticsSnapshot) => void
  getRecent: (scopeKey: string, limit?: number) => GlobalDiagnosticsSnapshot[]
}

export const useGlobalDiagnosticsStore = create<State>((set, get) => ({
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
