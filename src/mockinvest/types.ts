/**
 * 04 MockInvest tournament / ranking / reward mock contract.
 * 실 보상·정산·주문 실행 없음.
 */

/** 대회방(토너먼트 룸) */
export type TournamentRoom = {
  id: string
  name: string
  status: 'registration' | 'live' | 'closed'
  capacity: number
  participantCount: number
  startsAt: number
  endsAt: number
}

/** 룸 내 참가자 순위 한 줄 */
export type ParticipantStanding = {
  id: string
  displayName: string
  roomId: string
  rank: number
  score: number
}

/** 랭킹 스냅샷 (상위 참가자 묶음) */
export type RankingSnapshot = {
  roomId: string
  asOf: number
  top: readonly ParticipantStanding[]
}

/** 보상 분배 계획 (mock 금액·비율만) */
export type RewardDistribution = {
  id: string
  label: string
  sharePct: number
  amountMock: number
  /** 실 정산 아님 — 표시용 플래그 */
  settledMock: boolean
}

/** 보상 풀 상태 */
export type RewardPoolState = {
  poolId: string
  name: string
  totalMock: number
  distributedMock: number
}

/** 이벤트 라이프사이클 */
export type EventLifecycleState = {
  eventId: string
  phase: 'draft_mock' | 'open_mock' | 'running_mock' | 'rewarding_mock' | 'closed_mock'
  label: string
}

export type MockInvestEventRow = {
  id: string
  title: string
  endsAt: number
  lifecycle: EventLifecycleState['phase']
}

/** BRG·프로브가 읽는 통합 대시보드 mock */
export type MockTournamentDashboard = {
  rooms: readonly TournamentRoom[]
  rankings: readonly RankingSnapshot[]
  rewardDistributions: readonly RewardDistribution[]
  rewardPools: readonly RewardPoolState[]
  events: readonly MockInvestEventRow[]
  eventLifecycles: readonly EventLifecycleState[]
}
