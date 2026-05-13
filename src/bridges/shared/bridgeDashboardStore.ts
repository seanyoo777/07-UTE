import { create } from 'zustand'

import { runAllBridgeProbes, initialSnapshots } from './bridgeProbeRunner'

import { applyConnecting, createIdleMockSnapshot, snapshotDisabled } from './bridgeSnapshots'

import { buildMockSecurityAdminBundle } from './securityMockBundle'

import type { SecurityAdminStatusBundle } from './securityStatusTypes'

import { buildMockUteIntegrationSnapshot } from './integrationSnapshots'

import type { UteIntegrationSnapshot } from './integrationSnapshots'

import { BRIDGE_ORDER } from './bridgeTypes'

import type { BridgeAdapterSnapshot, BridgeDisabledMap, BridgeId } from './bridgeTypes'



type State = {

  panelOpen: boolean

  refreshing: boolean

  snapshots: Record<BridgeId, BridgeAdapterSnapshot>

  disabled: BridgeDisabledMap

  /** 마지막 성공적인 전체 프로브 완료 시각 */

  lastProbeRunAt: number | null

  securityAdmin: SecurityAdminStatusBundle

  /** TGX `cex` + SpeedOrder `vendor` 기반 통합 mock 스냅샷 */
  uteIntegration: UteIntegrationSnapshot | null

  togglePanel: () => void

  setPanelOpen: (open: boolean) => void

  setBridgeDisabled: (id: BridgeId, disabled: boolean) => void

  refresh: () => Promise<void>

}



const defaultDisabled: BridgeDisabledMap = {

  tetherget: false,

  tgx: false,

  oneai: false,

  mockinvest: false,

  speedorder: false,

}



export const useBridgeDashboardStore = create<State>((set, get) => ({

  panelOpen: false,

  refreshing: false,

  snapshots: initialSnapshots(),

  disabled: defaultDisabled,

  lastProbeRunAt: null,

  securityAdmin: buildMockSecurityAdminBundle(),

  uteIntegration: null,

  togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),

  setPanelOpen: (open) => set({ panelOpen: open }),



  setBridgeDisabled: (id, disabled) => {

    set((s) => ({ disabled: { ...s.disabled, [id]: disabled } }))

    void get().refresh()

  },



  refresh: async () => {

    if (get().refreshing) return

    set({ refreshing: true })

    const disabled = get().disabled

    const prev = get().snapshots

    const t = Date.now()

    set({

      snapshots: BRIDGE_ORDER.reduce(

        (acc, id) => {

          if (disabled[id]) {

            acc[id] = snapshotDisabled(id, t)

          } else {

            const base = prev[id] ?? createIdleMockSnapshot(id, t)

            acc[id] = applyConnecting(base, t)

          }

          return acc

        },

        {} as Record<BridgeId, BridgeAdapterSnapshot>,

      ),

    })

    try {

      const next = await runAllBridgeProbes(disabled)

      set({

        snapshots: next,

        refreshing: false,

        lastProbeRunAt: Date.now(),

        securityAdmin: buildMockSecurityAdminBundle(),

        uteIntegration: buildMockUteIntegrationSnapshot(),

      })

    } catch {

      set({ refreshing: false })

    }

  },

}))



export function selectBridgeSummaryText(snapshots: Record<BridgeId, BridgeAdapterSnapshot>): string {

  const snaps = BRIDGE_ORDER.map((id) => snapshots[id])

  const errors = snaps.filter((s) => s.dashboardStatus === 'error').length

  if (errors > 0) return `Bridge ${errors} 오류`

  const disabled = snaps.filter((s) => s.dashboardStatus === 'disabled').length

  if (disabled === BRIDGE_ORDER.length) return 'Bridge 전부 비활성'

  const connected = snaps.filter((s) => s.dashboardStatus === 'connected').length

  if (connected === BRIDGE_ORDER.length - disabled) return 'Bridge mock 연결됨'

  return 'Bridge 데모'

}

