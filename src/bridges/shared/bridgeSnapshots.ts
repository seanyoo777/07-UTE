import { BRIDGE_DISPLAY } from './bridgeMeta'
import type {
  BridgeAdapterSnapshot,
  BridgeConnectionStatus,
  BridgeDashboardStatus,
  BridgeErrorState,
  BridgeId,
  BridgeProbeResult,
  MockFallbackKind,
} from './bridgeTypes'

export function createIdleMockSnapshot(id: BridgeId, nowMs: number): BridgeAdapterSnapshot {
  const m = BRIDGE_DISPLAY[id]
  return {
    id,
    displayName: m.displayName,
    productCode: m.productCode,
    connectionStatus: 'disconnected',
    dashboardStatus: 'mock',
    dataSource: 'mock',
    mockFallback: 'explicit_demo',
    capabilitiesSummary: '—',
    updatedAt: nowMs,
  }
}

export function snapshotFromError(
  id: BridgeId,
  err: unknown,
  nowMs: number,
): BridgeAdapterSnapshot {
  const m = BRIDGE_DISPLAY[id]
  const message = err instanceof Error ? err.message : String(err)
  const lastError: BridgeErrorState = {
    code: 'BRIDGE_PROBE_FAILED',
    message,
    at: nowMs,
    retryable: true,
  }
  return {
    id,
    displayName: m.displayName,
    productCode: m.productCode,
    connectionStatus: 'disconnected',
    dashboardStatus: 'error',
    dataSource: 'mock',
    mockFallback: 'explicit_demo',
    lastError,
    capabilitiesSummary: '프로브 실패',
    updatedAt: nowMs,
  }
}

export function snapshotDisabled(id: BridgeId, nowMs: number): BridgeAdapterSnapshot {
  const m = BRIDGE_DISPLAY[id]
  return {
    id,
    displayName: m.displayName,
    productCode: m.productCode,
    connectionStatus: 'disconnected',
    dashboardStatus: 'disabled',
    dataSource: 'mock',
    mockFallback: 'none',
    capabilitiesSummary: '비활성',
    updatedAt: nowMs,
  }
}

export function healthyConnectedMock(
  id: BridgeId,
  probe: BridgeProbeResult,
  mockFallback: MockFallbackKind,
  nowMs: number,
): BridgeAdapterSnapshot {
  const m = BRIDGE_DISPLAY[id]
  return {
    id,
    displayName: m.displayName,
    productCode: m.productCode,
    connectionStatus: 'connected',
    dashboardStatus: 'connected',
    dataSource: 'mock',
    mockFallback,
    capabilitiesSummary: probe.capabilitiesSummary,
    tethergetPanel: probe.tethergetPanel,
    tgxPanel: probe.tgxPanel,
    oneaiPanel: probe.oneaiPanel,
    mockinvestPanel: probe.mockinvestPanel,
    speedorderPanel: probe.speedorderPanel,
    updatedAt: nowMs,
  }
}

export function applyConnecting(
  snap: BridgeAdapterSnapshot,
  nowMs: number,
): BridgeAdapterSnapshot {
  return {
    ...snap,
    connectionStatus: 'connecting' satisfies BridgeConnectionStatus,
    dashboardStatus: 'mock' satisfies BridgeDashboardStatus,
    updatedAt: nowMs,
  }
}
