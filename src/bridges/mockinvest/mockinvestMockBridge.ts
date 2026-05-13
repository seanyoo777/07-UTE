/**
 * MockInvest Bridge — mock only.
 * `src/mockinvest` tournament surface를 읽어 BRG에 반영합니다.
 * 실 API·실 주문·실 보상/정산 없음.
 */

import {
  buildDefaultMockTournamentDashboardFixture,
  getActiveTournaments,
  getMockTournamentDashboard,
  getRewardPools,
  getTopRankings,
  getUpcomingEvents,
} from '../../mockinvest'
import type { BridgeProbeResult } from '../shared/bridgeTypes'

/** 레거시 BRG/문서 호환용 간단 DTO */
export type MockinvestRoom = { id: string; name: string; members: number }
export type MockinvestRankRow = { rank: number; handle: string; score: number }
export type MockinvestEvent = { id: string; title: string; endsAt: number }

export function mockinvestMockListRooms(): MockinvestRoom[] {
  return getActiveTournaments().map((r) => ({
    id: r.id,
    name: r.name,
    members: r.participantCount,
  }))
}

export function mockinvestMockGetRanking(): MockinvestRankRow[] {
  return getTopRankings().map((p) => ({
    rank: p.rank,
    handle: p.displayName,
    score: p.score,
  }))
}

export function mockinvestMockListEvents(): MockinvestEvent[] {
  return getUpcomingEvents().map((e) => ({
    id: e.id,
    title: e.title,
    endsAt: e.endsAt,
  }))
}

export async function probeMockinvestMockBridge(): Promise<BridgeProbeResult> {
  void buildDefaultMockTournamentDashboardFixture()
  const active = getActiveTournaments()
  const tops = getTopRankings()
  const pools = getRewardPools()
  const upcoming = getUpcomingEvents()
  const dash = getMockTournamentDashboard()

  const activeParticipantsTotal = active.reduce((a, r) => a + r.participantCount, 0)
  const remaining = pools.reduce((a, p) => a + (p.totalMock - p.distributedMock), 0)
  const phases = [...new Set(dash.eventLifecycles.map((e) => e.phase))].slice(0, 4).join(' · ')

  return {
    capabilitiesSummary: `mockinvest · ${active.length} active rooms · ${tops.length} top rows · ${pools.length} reward pools (mock)`,
    mockinvestPanel: {
      activeTournamentsCount: active.length,
      activeParticipantsTotal,
      topRankingCount: tops.length,
      rewardPoolsLine: `${pools.length} pools · ~${Math.round(remaining).toLocaleString('en-US')} mock remaining`,
      lifecycleLine: `${upcoming.length} upcoming events · ${phases || 'n/a (mock)'}`,
    },
  }
}
