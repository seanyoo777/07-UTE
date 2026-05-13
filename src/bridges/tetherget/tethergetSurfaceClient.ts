/**
 * 01 TetherGet `GET /api/admin/p2p/ute-surface` 소비 클라이언트 (07-UTE).
 * 실 HTTP·실거래·실 송금·코인 release 없음. API 경로는 stub.
 */

import type { UteSurfaceMetrics, UteSurfacePayload } from './uteSurfaceTypes'
import { UTE_SURFACE_SCHEMA_VERSION } from './uteSurfaceTypes'

export class TethergetSurfaceApiDisabledError extends Error {
  override readonly name = 'TethergetSurfaceApiDisabledError'
  constructor(
    message = '01 TetherGet ute-surface live fetch는 07-UTE에서 비활성(stub). 외부 HTTP 호출 없음.',
  ) {
    super(message)
  }
}

export type TethergetSurfaceFetchMeta = {
  source: 'mock' | 'mock_fallback'
  reason?: string
}

function computeMetrics(
  p: Pick<UteSurfacePayload, 'p2pOrders' | 'escrowStatuses' | 'disputeCases' | 'referralSettlements'>,
): UteSurfaceMetrics {
  const ordersOpen = p.p2pOrders.filter(
    (o) => o.status === 'open' || o.status === 'matched' || o.status === 'settling',
  ).length
  const escrowLocked = p.escrowStatuses.filter((e) => e.state === 'locked').length
  const disputesOpen = p.disputeCases.filter((d) => d.state === 'open' || d.state === 'mediation').length
  const referralsPending = p.referralSettlements.filter((r) => r.status === 'pending').length
  return { ordersOpen, escrowLocked, disputesOpen, referralsPending }
}

export function buildDefaultUteSurfacePayload(): UteSurfacePayload {
  const now = Date.now()
  const base = {
    schemaVersion: UTE_SURFACE_SCHEMA_VERSION,
    p2pOrders: [
      { id: 'tg-p2p-1', side: 'buy' as const, pair: 'USDT/KRW', amount: 1_000_000, status: 'open' },
      { id: 'tg-p2p-2', side: 'sell' as const, pair: 'USDT/KRW', amount: 500_000, status: 'settling' },
    ],
    escrowStatuses: [
      { orderId: 'tg-p2p-1', state: 'none' as const, updatedAt: now - 3_600_000 },
      { orderId: 'tg-p2p-2', state: 'locked' as const, updatedAt: now },
    ],
    walletStatuses: [
      { role: 'hot' as const, riskLevel: 'med' as const, label: '[mock] hot', lastSyncAt: now },
      { role: 'cold' as const, riskLevel: 'low' as const, label: '[mock] cold', lastSyncAt: now },
    ],
    referralSettlements: [
      { id: 'ref-1', code: 'MOCK-ALPHA', status: 'pending' as const, amountMock: 42 },
      { id: 'ref-2', code: 'MOCK-BETA', status: 'cleared_mock' as const, amountMock: 7 },
    ],
    disputeCases: [
      { id: 'dsp-1', severity: 'low' as const, state: 'open' as const },
      { id: 'dsp-2', severity: 'med' as const, state: 'mediation' as const },
      { id: 'dsp-3', severity: 'low' as const, state: 'resolved' as const },
    ],
    adminRiskStatus: { score: 12, band: 'low' as const, note: '[mock] 샘플 리스크 스코어' },
  }
  return { ...base, metrics: computeMetrics(base) }
}

export async function fetchTethergetUteSurfaceMock(): Promise<{
  payload: UteSurfacePayload
  meta: TethergetSurfaceFetchMeta
}> {
  return { payload: buildDefaultUteSurfacePayload(), meta: { source: 'mock' } }
}

/** Stub: 실 URL 호출 없음. 향후 live 연동 시에만 구현. */
export async function fetchTethergetUteSurfaceFromApi(): Promise<{
  payload: UteSurfacePayload
  meta: TethergetSurfaceFetchMeta
}> {
  throw new TethergetSurfaceApiDisabledError()
}

/** mock만 반환(API 미시도). */
export async function fetchTethergetUteSurfaceWithMockFallback(): Promise<{
  payload: UteSurfacePayload
  meta: TethergetSurfaceFetchMeta
}> {
  return fetchTethergetUteSurfaceMock()
}

/** API 시도 후 실패 시 mock — 현재 API는 항상 비활성으로 곧바로 mock_fallback. */
export async function fetchTethergetUteSurfaceTryApiThenMockFallback(): Promise<{
  payload: UteSurfacePayload
  meta: TethergetSurfaceFetchMeta
}> {
  try {
    return await fetchTethergetUteSurfaceFromApi()
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err)
    return {
      payload: buildDefaultUteSurfacePayload(),
      meta: { source: 'mock_fallback', reason },
    }
  }
}
