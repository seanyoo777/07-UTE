import { create } from 'zustand'

export type AppShellView = 'trading' | 'admin'

function pathToView(path: string): AppShellView {
  const p = path.replace(/\/$/, '') || '/'
  return p === '/admin' ? 'admin' : 'trading'
}

/**
 * `/admin` ↔ 트레이딩 셸 전환. `popstate`와 동기화.
 * 실 주문·송금 없음 — 화면 전환만.
 */
export const useAppNavigation = create<{
  view: AppShellView
  syncFromWindow: () => void
  goTrading: () => void
  goAdmin: () => void
}>((set) => ({
  view: typeof window !== 'undefined' ? pathToView(window.location.pathname) : 'trading',
  syncFromWindow: () => set({ view: pathToView(window.location.pathname) }),
  goTrading: () => {
    window.history.pushState({}, '', '/')
    set({ view: 'trading' })
  },
  goAdmin: () => {
    window.history.pushState({}, '', '/admin')
    set({ view: 'admin' })
  },
}))
