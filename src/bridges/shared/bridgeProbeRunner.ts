import { probeMockinvestMockBridge } from '../mockinvest/mockinvestMockBridge'
import { probeOneaiMockBridge } from '../oneai/oneaiMockBridge'
import { probeSpeedorderMockBridge } from '../speedorder/speedorderMockBridge'
import { probeTethergetMockBridge } from '../tetherget/tethergetMockBridge'
import { probeTgxMockBridge } from '../tgx/tgxMockBridge'
import { BRIDGE_ORDER } from './bridgeTypes'
import type { BridgeAdapterSnapshot, BridgeDisabledMap, BridgeId, BridgeProbeResult } from './bridgeTypes'
import { createIdleMockSnapshot, healthyConnectedMock, snapshotDisabled, snapshotFromError } from './bridgeSnapshots'

const PROBES: Record<BridgeId, () => Promise<BridgeProbeResult>> = {
  tetherget: probeTethergetMockBridge,
  tgx: probeTgxMockBridge,
  oneai: probeOneaiMockBridge,
  mockinvest: probeMockinvestMockBridge,
  speedorder: probeSpeedorderMockBridge,
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/**
 * 각 외부 Bridge mock 어댑터를 순차 프로브합니다. 네트워크 호출 없음.
 */
export async function runAllBridgeProbes(disabled: BridgeDisabledMap): Promise<Record<BridgeId, BridgeAdapterSnapshot>> {
  const nowMs = Date.now()
  const out = {} as Record<BridgeId, BridgeAdapterSnapshot>
  for (const id of BRIDGE_ORDER) {
    if (disabled[id]) {
      out[id] = snapshotDisabled(id, nowMs)
      continue
    }
    try {
      await delay(15)
      const probe = await PROBES[id]()
      out[id] = healthyConnectedMock(id, probe, 'explicit_demo', Date.now())
    } catch (e) {
      out[id] = snapshotFromError(id, e, Date.now())
    }
  }
  return out
}

export function initialSnapshots(): Record<BridgeId, BridgeAdapterSnapshot> {
  const t = Date.now()
  return BRIDGE_ORDER.reduce(
    (acc, id) => {
      acc[id] = createIdleMockSnapshot(id, t)
      return acc
    },
    {} as Record<BridgeId, BridgeAdapterSnapshot>,
  )
}
