import type { BridgeAdapterSnapshot, BridgeId } from '../bridges/shared/bridgeTypes'
import type { SecurityAdminStatusBundle } from '../bridges/shared/securityStatusTypes'
import type { UteIntegrationSnapshot } from '../bridges/shared/integrationSnapshots'
import { BRIDGE_ORDER } from '../bridges/shared/bridgeTypes'

export const ADMIN_SYSTEM_HEALTH_SCHEMA_VERSION = '1.0.0' as const

export type AdminHealthSliceStatus = 'ok' | 'degraded' | 'critical' | 'unknown'

export type AdminHealthSlice = {
  status: AdminHealthSliceStatus
  summary: string
  detail?: string
}

export type AdminSystemHealthSnapshot = {
  schemaVersion: typeof ADMIN_SYSTEM_HEALTH_SCHEMA_VERSION
  asOf: number
  bridgeHealth: AdminHealthSlice
  securityHealth: AdminHealthSlice
  marketDataHealth: AdminHealthSlice
  strategyHealth: AdminHealthSlice
  tournamentHealth: AdminHealthSlice
  p2pHealth: AdminHealthSlice
}

export type BuildAdminSystemHealthInput = {
  snapshots: Record<BridgeId, BridgeAdapterSnapshot>
  securityAdmin: SecurityAdminStatusBundle
  integration: UteIntegrationSnapshot | null
  lastProbeRunAt: number | null
  /** 스냅샷 기준 시각(프로브 또는 통합 asOf) */
  asOf: number
}

export function buildAdminSystemHealthSnapshot(input: BuildAdminSystemHealthInput): AdminSystemHealthSnapshot {
  const { snapshots, securityAdmin, integration, lastProbeRunAt, asOf } = input

  let err = 0
  let dis = 0
  let ok = 0
  for (const id of BRIDGE_ORDER) {
    const st = snapshots[id].dashboardStatus
    if (st === 'error') err++
    else if (st === 'disabled') dis++
    else if (st === 'connected') ok++
  }
  const bridgeHealth: AdminHealthSlice =
    err > 0
      ? {
          status: 'critical',
          summary: `Bridge 오류 ${err}건`,
          detail: `mock 프로브 · lastProbe: ${
            lastProbeRunAt != null ? new Date(lastProbeRunAt).toLocaleString('ko-KR', { hour12: false }) : '—'
          }`,
        }
      : ok + dis === BRIDGE_ORDER.length && ok > 0
        ? { status: 'ok', summary: `${ok} bridge mock 연결`, detail: `비활성 ${dis}` }
        : { status: 'degraded', summary: 'Bridge 일부 mock/idle', detail: `연결 ${ok} · 비활성 ${dis}` }

  const securityHealth: AdminHealthSlice =
    securityAdmin.wafStatus === 'block_mock'
      ? { status: 'critical', summary: 'WAF block (mock)', detail: securityAdmin.wafStatus }
      : securityAdmin.rateLimitStatus === 'tripped_mock' || securityAdmin.auditLogStatus === 'error_mock'
        ? { status: 'degraded', summary: 'Security 신호 (mock)', detail: `${securityAdmin.rateLimitStatus}` }
        : { status: 'ok', summary: 'Security bundle nominal (mock)', detail: securityAdmin.environmentMode }

  const md = integration?.cex.marketData?.toLowerCase() ?? ''
  const marketDataHealth: AdminHealthSlice =
    !integration
      ? { status: 'unknown', summary: 'Market 데이터 없음', detail: 'uteIntegration 미로드' }
      : md.includes('error') || md.includes('down')
        ? { status: 'degraded', summary: 'CEX market data 경고', detail: integration.cex.marketData }
        : { status: 'ok', summary: 'CEX market data OK (mock)', detail: integration.cex.selected }

  const strategyHealth: AdminHealthSlice =
    !integration
      ? { status: 'unknown', summary: '전략 메트릭 없음', detail: 'uteIntegration 미로드' }
      : integration.oneai.riskLevel === 'high'
        ? { status: 'degraded', summary: 'OneAI risk high (mock)', detail: `WR ${integration.oneai.winratePct}%` }
        : { status: 'ok', summary: 'OneAI nominal (mock)', detail: `${integration.oneai.strategyCount} strategies` }

  const tournamentHealth: AdminHealthSlice =
    !integration
      ? { status: 'unknown', summary: '토너먼트 스냅샷 없음' }
      : integration.mockinvest.activeTournaments === 0
        ? { status: 'degraded', summary: '활성 토너먼트 0 (mock)', detail: '데모 데이터에 따라 변동' }
        : { status: 'ok', summary: 'MockInvest OK (mock)', detail: `${integration.mockinvest.activeTournaments} rooms` }

  const tgPanel = snapshots.tetherget.tethergetPanel
  const p2pHealth: AdminHealthSlice =
    tgPanel?.fallbackState === 'error'
      ? { status: 'critical', summary: 'TetherGet surface 오류', detail: tgPanel.fallbackReason }
      : tgPanel?.fallbackState === 'mock_fallback'
        ? { status: 'degraded', summary: 'ute-surface mock fallback', detail: tgPanel.fallbackReason }
        : tgPanel
          ? { status: 'ok', summary: 'P2P surface OK (mock)', detail: `schema ${tgPanel.schemaVersion}` }
          : { status: 'unknown', summary: 'TetherGet 패널 없음', detail: '프로브 전·오류 상태' }

  return {
    schemaVersion: ADMIN_SYSTEM_HEALTH_SCHEMA_VERSION,
    asOf,
    bridgeHealth,
    securityHealth,
    marketDataHealth,
    strategyHealth,
    tournamentHealth,
    p2pHealth,
  }
}
