import type {
  EventLifecycleState,
  MockInvestEventRow,
  MockTournamentDashboard,
  ParticipantStanding,
  RankingSnapshot,
  RewardDistribution,
  RewardPoolState,
  TournamentRoom,
} from './types'

let fixture: MockTournamentDashboard | null = null

function seedRooms(): TournamentRoom[] {
  const now = Date.now()
  return [
    {
      id: 'room-alpha',
      name: 'Spring Cup (mock)',
      status: 'live',
      capacity: 500,
      participantCount: 128,
      startsAt: now - 86400_000,
      endsAt: now + 2 * 86400_000,
    },
    {
      id: 'room-beta',
      name: 'Weekly Blitz (mock)',
      status: 'registration',
      capacity: 200,
      participantCount: 44,
      startsAt: now + 12 * 3600_000,
      endsAt: now + 5 * 86400_000,
    },
    {
      id: 'room-gamma',
      name: 'Hall of Fame Season 1',
      status: 'closed',
      capacity: 1000,
      participantCount: 999,
      startsAt: now - 90 * 86400_000,
      endsAt: now - 7 * 86400_000,
    },
  ]
}

function seedRankings(rooms: TournamentRoom[]): RankingSnapshot[] {
  return rooms
    .filter((r) => r.status !== 'closed')
    .map((r, idx) => {
      const top: ParticipantStanding[] = [1, 2, 3].map((rank) => ({
        id: `p-${r.id}-${rank}`,
        displayName: `player_${rank}_${idx}`,
        roomId: r.id,
        rank,
        score: 1000 - rank * 17 - idx * 3,
      }))
      return { roomId: r.id, asOf: Date.now(), top }
    })
}

function seedPools(): RewardPoolState[] {
  return [
    { poolId: 'pool-main', name: 'Main prize (mock)', totalMock: 50_000, distributedMock: 12_000 },
    { poolId: 'pool-side', name: 'Community pool (mock)', totalMock: 8_000, distributedMock: 1_500 },
  ]
}

function seedDistributions(): RewardDistribution[] {
  return [
    { id: 'd1', label: 'Top 3', sharePct: 60, amountMock: 30_000, settledMock: false },
    { id: 'd2', label: 'Participation', sharePct: 40, amountMock: 20_000, settledMock: false },
  ]
}

function seedEvents(): MockInvestEventRow[] {
  const now = Date.now()
  return [
    { id: 'ev-spring', title: 'Spring Cup finals stream', endsAt: now + 86400_000, lifecycle: 'running_mock' },
    { id: 'ev-signup', title: 'Blitz signup bonus window', endsAt: now + 48 * 3600_000, lifecycle: 'open_mock' },
  ]
}

function seedLifecycles(events: MockInvestEventRow[]): EventLifecycleState[] {
  return events.map((e) => ({
    eventId: e.id,
    phase: e.lifecycle,
    label: e.title,
  }))
}

export function buildDefaultMockTournamentDashboardFixture(): MockTournamentDashboard {
  const rooms = seedRooms()
  const events = seedEvents()
  const dash: MockTournamentDashboard = {
    rooms,
    rankings: seedRankings(rooms),
    rewardDistributions: seedDistributions(),
    rewardPools: seedPools(),
    events,
    eventLifecycles: seedLifecycles(events),
  }
  fixture = dash
  return dash
}

function getFixture(): MockTournamentDashboard {
  if (!fixture) return buildDefaultMockTournamentDashboardFixture()
  return fixture
}

export function getActiveTournaments(): readonly TournamentRoom[] {
  return getFixture().rooms.filter((r) => r.status === 'live' || r.status === 'registration')
}

export function getTopRankings(): readonly ParticipantStanding[] {
  const out: ParticipantStanding[] = []
  for (const snap of getFixture().rankings) {
    out.push(...snap.top)
  }
  return out
}

export function getRewardPools(): readonly RewardPoolState[] {
  return getFixture().rewardPools
}

export function getUpcomingEvents(): readonly MockInvestEventRow[] {
  const now = Date.now()
  return getFixture().events.filter((e) => e.endsAt > now)
}

export function getMockTournamentDashboard(): MockTournamentDashboard {
  return getFixture()
}
