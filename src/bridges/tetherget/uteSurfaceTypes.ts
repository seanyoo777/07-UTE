/**
 * GET /api/admin/p2p/ute-surface — 01 TetherGet과 필드명·schemaVersion 정렬 (mock 소비 전용).
 * 실 송금·코인 release·외부 HTTP 호출 없음.
 */

/** 01번 API와 동일하게 유지 — 변경 시 양쪽 동기화 */
export const UTE_SURFACE_SCHEMA_VERSION = '1.0.0' as const

export type UteSurfaceP2pOrder = {
  id: string
  side: 'buy' | 'sell'
  pair: string
  amount: number
  status: string
}

export type UteSurfaceEscrowStatus = {
  orderId: string
  state: 'none' | 'locked' | 'released' | 'disputed'
  updatedAt: number
}

export type UteSurfaceWalletStatus = {
  role: 'hot' | 'cold'
  riskLevel: 'low' | 'med' | 'high'
  label: string
  lastSyncAt: number
}

export type UteSurfaceReferralSettlement = {
  id: string
  code: string
  status: 'pending' | 'cleared_mock' | 'failed_mock'
  amountMock: number
}

export type UteSurfaceDisputeCase = {
  id: string
  severity: 'low' | 'med' | 'high'
  state: 'open' | 'mediation' | 'resolved'
}

export type UteSurfaceAdminRiskStatus = {
  score: number
  band: 'low' | 'med' | 'high'
  note: string
}

/** 집계 — 배열과 중복 가능(서버가 내려주는 값 기준 소비) */
export type UteSurfaceMetrics = {
  ordersOpen: number
  escrowLocked: number
  disputesOpen: number
  referralsPending: number
}

export type UteSurfacePayload = {
  schemaVersion: string
  p2pOrders: UteSurfaceP2pOrder[]
  escrowStatuses: UteSurfaceEscrowStatus[]
  walletStatuses: UteSurfaceWalletStatus[]
  referralSettlements: UteSurfaceReferralSettlement[]
  disputeCases: UteSurfaceDisputeCase[]
  adminRiskStatus: UteSurfaceAdminRiskStatus
  metrics: UteSurfaceMetrics
}
