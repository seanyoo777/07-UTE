/**
 * 04 MockInvest — tournament / ranking / reward mock export surface.
 */
export type {
  EventLifecycleState,
  MockInvestEventRow,
  MockTournamentDashboard,
  ParticipantStanding,
  RankingSnapshot,
  RewardDistribution,
  RewardPoolState,
  TournamentRoom,
} from './types'

export {
  buildDefaultMockTournamentDashboardFixture,
  getActiveTournaments,
  getMockTournamentDashboard,
  getRewardPools,
  getTopRankings,
  getUpcomingEvents,
} from './mockTournamentSurface'
