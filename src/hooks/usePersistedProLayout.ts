import { useCallback, useMemo, useState } from 'react'
import {
  PRO_LAYOUT_DEFAULTS,
  PRO_LAYOUT_LIMITS,
  PRO_LAYOUT_STORAGE_KEY,
  clampLayout,
} from '../config/proLayout'

export type ProLayoutState = {
  sidebarPx: number
  bookPx: number
  orderPx: number
  dockPx: number
}

function normalize(j: Partial<ProLayoutState>): ProLayoutState {
  return {
    sidebarPx: clampLayout(
      typeof j.sidebarPx === 'number' ? j.sidebarPx : PRO_LAYOUT_DEFAULTS.sidebarPx,
      PRO_LAYOUT_LIMITS.sidebar.min,
      PRO_LAYOUT_LIMITS.sidebar.max,
    ),
    bookPx: clampLayout(
      typeof j.bookPx === 'number' ? j.bookPx : PRO_LAYOUT_DEFAULTS.bookPx,
      PRO_LAYOUT_LIMITS.book.min,
      PRO_LAYOUT_LIMITS.book.max,
    ),
    orderPx: clampLayout(
      typeof j.orderPx === 'number' ? j.orderPx : PRO_LAYOUT_DEFAULTS.orderPx,
      PRO_LAYOUT_LIMITS.order.min,
      PRO_LAYOUT_LIMITS.order.max,
    ),
    dockPx: clampLayout(
      typeof j.dockPx === 'number' ? j.dockPx : PRO_LAYOUT_DEFAULTS.dockPx,
      PRO_LAYOUT_LIMITS.dock.min,
      PRO_LAYOUT_LIMITS.dock.max,
    ),
  }
}

function readStored(): ProLayoutState {
  try {
    const raw = localStorage.getItem(PRO_LAYOUT_STORAGE_KEY)
    if (raw) return normalize(JSON.parse(raw) as Partial<ProLayoutState>)
  } catch {
    /* ignore */
  }
  return { ...PRO_LAYOUT_DEFAULTS }
}

function writeStored(s: ProLayoutState): void {
  try {
    localStorage.setItem(PRO_LAYOUT_STORAGE_KEY, JSON.stringify(s))
  } catch {
    /* private mode / quota */
  }
}

export type PersistedProLayout = ProLayoutState & {
  applySidebarDelta: (d: number) => void
  applyBookDelta: (d: number) => void
  applyOrderDelta: (d: number) => void
  applyDockDelta: (d: number, maxDockPx?: number) => void
  resetSidebar: () => void
  resetBook: () => void
  resetOrder: () => void
  resetDock: () => void
  resetAll: () => void
}

export function usePersistedProLayout(): PersistedProLayout {
  const [layout, setLayout] = useState<ProLayoutState>(() => readStored())

  const update = useCallback((updater: (prev: ProLayoutState) => ProLayoutState) => {
    setLayout((prev) => {
      const next = updater(prev)
      queueMicrotask(() => writeStored(next))
      return next
    })
  }, [])

  const applySidebarDelta = useCallback(
    (d: number) =>
      update((p) => ({
        ...p,
        sidebarPx: clampLayout(p.sidebarPx + d, PRO_LAYOUT_LIMITS.sidebar.min, PRO_LAYOUT_LIMITS.sidebar.max),
      })),
    [update],
  )
  const applyBookDelta = useCallback(
    (d: number) =>
      update((p) => ({
        ...p,
        bookPx: clampLayout(p.bookPx + d, PRO_LAYOUT_LIMITS.book.min, PRO_LAYOUT_LIMITS.book.max),
      })),
    [update],
  )
  const applyOrderDelta = useCallback(
    (d: number) =>
      update((p) => ({
        ...p,
        orderPx: clampLayout(p.orderPx + d, PRO_LAYOUT_LIMITS.order.min, PRO_LAYOUT_LIMITS.order.max),
      })),
    [update],
  )
  const applyDockDelta = useCallback(
    (d: number, maxDockPx?: number) =>
      update((p) => {
        const cap =
          maxDockPx !== undefined
            ? clampLayout(maxDockPx, PRO_LAYOUT_LIMITS.dock.min, PRO_LAYOUT_LIMITS.dock.max)
            : PRO_LAYOUT_LIMITS.dock.max
        return { ...p, dockPx: clampLayout(p.dockPx + d, PRO_LAYOUT_LIMITS.dock.min, cap) }
      }),
    [update],
  )

  const resetSidebar = useCallback(
    () => update((p) => ({ ...p, sidebarPx: PRO_LAYOUT_DEFAULTS.sidebarPx })),
    [update],
  )
  const resetBook = useCallback(
    () => update((p) => ({ ...p, bookPx: PRO_LAYOUT_DEFAULTS.bookPx })),
    [update],
  )
  const resetOrder = useCallback(
    () => update((p) => ({ ...p, orderPx: PRO_LAYOUT_DEFAULTS.orderPx })),
    [update],
  )
  const resetDock = useCallback(
    () => update((p) => ({ ...p, dockPx: PRO_LAYOUT_DEFAULTS.dockPx })),
    [update],
  )
  const resetAll = useCallback(() => update(() => ({ ...PRO_LAYOUT_DEFAULTS })), [update])

  return useMemo(
    () => ({
      ...layout,
      applySidebarDelta,
      applyBookDelta,
      applyOrderDelta,
      applyDockDelta,
      resetSidebar,
      resetBook,
      resetOrder,
      resetDock,
      resetAll,
    }),
    [
      layout,
      applySidebarDelta,
      applyBookDelta,
      applyOrderDelta,
      applyDockDelta,
      resetSidebar,
      resetBook,
      resetOrder,
      resetDock,
      resetAll,
    ],
  )
}
