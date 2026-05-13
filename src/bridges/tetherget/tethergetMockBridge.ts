/**
 * 01 TetherGet-P2P Bridge — mock only.
 * `ute-surface` schema(`UteSurfacePayload`)를 소비합니다. 실 송금·release·외부 API 없음.
 */

import type { BridgeProbeResult, TethergetBrgPanelSnapshot } from '../shared/bridgeTypes'
import {
  buildDefaultUteSurfacePayload,
  fetchTethergetUteSurfaceTryApiThenMockFallback,
  type TethergetSurfaceFetchMeta,
} from './tethergetSurfaceClient'
import type { UteSurfacePayload } from './uteSurfaceTypes'

export type TethergetP2pOrderRow = {
  id: string
  side: 'buy' | 'sell'
  asset: string
  amount: number
  status: 'open' | 'matched' | 'settling' | 'done' | 'cancelled'
}

export type TethergetEscrowStatus = {
  orderId: string
  state: 'none' | 'locked' | 'released' | 'disputed'
  updatedAt: number
}

export type TethergetReferralRow = {
  code: string
  tier: 'bronze' | 'silver' | 'gold'
  rewardsMock: number
}

export type TethergetWalletStatus = {
  hot: 'demo_locked_mock'
  cold: 'demo_stub_mock'
  lastSyncMock: number
}

export type TethergetDisputeStatus = {
  open: number
  mediation: number
  resolved24h: number
}

export type TethergetAdminRiskStatus = {
  score: number
  label: 'low' | 'med' | 'high'
  note: string
}

function asLegacyP2pStatus(s: string): TethergetP2pOrderRow['status'] {
  const allowed: TethergetP2pOrderRow['status'][] = ['open', 'matched', 'settling', 'done', 'cancelled']
  return (allowed.includes(s as TethergetP2pOrderRow['status']) ? s : 'open') as TethergetP2pOrderRow['status']
}

export function tethergetMockP2pOrders(): TethergetP2pOrderRow[] {
  return buildDefaultUteSurfacePayload().p2pOrders.map((o) => ({
    id: o.id,
    side: o.side,
    asset: o.pair,
    amount: o.amount,
    status: asLegacyP2pStatus(o.status),
  }))
}

export function tethergetMockEscrowStatus(): TethergetEscrowStatus {
  const locked = buildDefaultUteSurfacePayload().escrowStatuses.find((e) => e.state === 'locked')
  return locked ?? { orderId: '—', state: 'none', updatedAt: Date.now() }
}

export function tethergetMockReferrals(): TethergetReferralRow[] {
  return buildDefaultUteSurfacePayload().referralSettlements.map((r, i) => ({
    code: r.code,
    tier: i % 3 === 0 ? 'gold' : i % 2 === 0 ? 'silver' : 'bronze',
    rewardsMock: r.amountMock,
  }))
}

export function tethergetMockWalletStatus(): TethergetWalletStatus {
  return { hot: 'demo_locked_mock', cold: 'demo_stub_mock', lastSyncMock: Date.now() }
}

export function tethergetMockDisputeStatus(): TethergetDisputeStatus {
  const d = buildDefaultUteSurfacePayload().disputeCases
  return {
    open: d.filter((x) => x.state === 'open').length,
    mediation: d.filter((x) => x.state === 'mediation').length,
    resolved24h: d.filter((x) => x.state === 'resolved').length,
  }
}

export function tethergetMockAdminRiskStatus(): TethergetAdminRiskStatus {
  const a = buildDefaultUteSurfacePayload().adminRiskStatus
  return { score: a.score, label: a.band, note: a.note }
}

function walletRiskLabel(payload: UteSurfacePayload): string {
  const w = { low: 0, med: 1, high: 2 }
  const max = payload.walletStatuses.reduce((acc, x) => Math.max(acc, w[x.riskLevel]), 0)
  return max >= 2 ? 'high' : max >= 1 ? 'med' : 'low'
}

function mapToTethergetBrgPanel(payload: UteSurfacePayload, meta: TethergetSurfaceFetchMeta): TethergetBrgPanelSnapshot {
  const m = payload.metrics
  const p2pCount = payload.p2pOrders.length
  const escrowLockedCount = m.escrowLocked
  const disputeCount = m.disputesOpen
  const referralPending = m.referralsPending
  const walletRisk = walletRiskLabel(payload)
  const adminRisk = payload.adminRiskStatus.band
  const fallbackState = meta.source === 'mock_fallback' ? 'mock_fallback' : 'mock'
  const summaryLine = `v${payload.schemaVersion} · P2P ${p2pCount} · escrow↑${escrowLockedCount} · disputes ${disputeCount} · ref~${referralPending} · wallet ${walletRisk} · admin ${adminRisk}`
  return {
    schemaVersion: payload.schemaVersion,
    p2pCount,
    escrowLockedCount,
    disputeCount,
    referralPending,
    walletRisk,
    adminRisk,
    fallbackState,
    fallbackReason: meta.reason,
    summaryLine,
  }
}

export async function probeTethergetMockBridge(): Promise<BridgeProbeResult> {
  const { payload, meta } = await fetchTethergetUteSurfaceTryApiThenMockFallback()
  void tethergetMockP2pOrders()
  void tethergetMockEscrowStatus()
  void tethergetMockReferrals()
  void tethergetMockWalletStatus()
  void tethergetMockDisputeStatus()
  void tethergetMockAdminRiskStatus()

  return {
    capabilitiesSummary: `ute-surface v${payload.schemaVersion} · P2P ${payload.metrics.ordersOpen} open · escrow ${payload.metrics.escrowLocked} locked (mock)`,
    tethergetPanel: mapToTethergetBrgPanel(payload, meta),
  }
}
