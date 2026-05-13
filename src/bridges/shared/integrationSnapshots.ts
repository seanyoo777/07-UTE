import {
  getMarketDataFeedStatus,
  getPositionOrderSnapshot,
  getTickerSnapshot,
  selectedSymbol,
  symbolUniverse,
} from '../../cex'
import {
  buildDefaultMockTournamentDashboardFixture,
  getActiveTournaments,
  getRewardPools,
  getTopRankings,
  getUpcomingEvents,
} from '../../mockinvest'
import { buildStrategyResearchDashboard } from '../../strategies'
import {
  readSpeedOrderVendorSerializableSnapshot,
  SPEED_ORDER_ENGINE_STATUS,
} from '../../vendor'
import type { SpeedOrderVendorSerializableSnapshot } from '../../vendor'
import { buildDefaultUteSurfacePayload } from '../tetherget/tethergetSurfaceClient'

/**
 * UTE 전체 통합 상태 mock (cex + strategies + mockinvest + vendor + TetherGet ute-surface).
 * 네트워크 없음.
 */
export type UteIntegrationSnapshot = {
  asOf: number
  headline: string
  cex: {
    selected: string
    universeCount: number
    marketData: string
    positions: number
    orders: number
    tickerLast: number
  }
  oneai: {
    strategyCount: number
    recentSignalCount: number
    winratePct: number
    pnlMock: number
    riskLevel: string
    backtestCount: number
    registryCount: number
  }
  mockinvest: {
    activeTournaments: number
    participants: number
    topRankings: number
    rewardPoolCount: number
    rewardRemainingMock: number
    upcomingEvents: number
    lifecycleSummary: string
  }
  speedOrder: SpeedOrderVendorSerializableSnapshot
  tetherget: {
    schemaVersion: string
    p2pOrderCount: number
    ordersOpen: number
    escrowLocked: number
    disputesOpen: number
    referralsPending: number
    summaryLine: string
  }
}

export function buildMockUteIntegrationSnapshot(): UteIntegrationSnapshot {
  const pos = getPositionOrderSnapshot()
  const ticker = getTickerSnapshot(selectedSymbol.symbol, selectedSymbol.marketId)
  const vo = readSpeedOrderVendorSerializableSnapshot()
  const strat = buildStrategyResearchDashboard()
  const a = strat.aggregate

  void buildDefaultMockTournamentDashboardFixture()
  const miActive = getActiveTournaments()
  const miPools = getRewardPools()
  const miTops = getTopRankings()
  const miUp = getUpcomingEvents()
  const remaining = miPools.reduce((acc, p) => acc + (p.totalMock - p.distributedMock), 0)
  const participants = miActive.reduce((acc, r) => acc + r.participantCount, 0)
  const lifecycleSummary = miUp.map((e) => e.lifecycle).join(' · ') || '—'
  const tg = buildDefaultUteSurfacePayload()

  return {
    asOf: Date.now(),
    headline: `TGX cex · ${symbolUniverse.length} sym · OneAI ${a.strategyCount} strat · MockInvest ${miActive.length} tournaments · SO ${SPEED_ORDER_ENGINE_STATUS} · TG P2P ${tg.metrics.ordersOpen} open · escrow ${tg.metrics.escrowLocked} locked (ute-surface ${tg.schemaVersion})`,
    cex: {
      selected: `${selectedSymbol.marketId}/${selectedSymbol.symbol}`,
      universeCount: symbolUniverse.length,
      marketData: getMarketDataFeedStatus(),
      positions: pos.positions.length,
      orders: pos.orders.length,
      tickerLast: ticker.last,
    },
    oneai: {
      strategyCount: a.strategyCount,
      recentSignalCount: a.recentSignalCount,
      winratePct: a.winratePct,
      pnlMock: a.totalPnlMock,
      riskLevel: a.riskLevel,
      backtestCount: strat.backtests.length,
      registryCount: strat.registry.length,
    },
    mockinvest: {
      activeTournaments: miActive.length,
      participants,
      topRankings: miTops.length,
      rewardPoolCount: miPools.length,
      rewardRemainingMock: remaining,
      upcomingEvents: miUp.length,
      lifecycleSummary,
    },
    speedOrder: vo,
    tetherget: {
      schemaVersion: tg.schemaVersion,
      p2pOrderCount: tg.p2pOrders.length,
      ordersOpen: tg.metrics.ordersOpen,
      escrowLocked: tg.metrics.escrowLocked,
      disputesOpen: tg.metrics.disputesOpen,
      referralsPending: tg.metrics.referralsPending,
      summaryLine: `v${tg.schemaVersion} · P2P ${tg.p2pOrders.length} rows · open ${tg.metrics.ordersOpen} · escrow↑${tg.metrics.escrowLocked} · disputes~${tg.metrics.disputesOpen}`,
    },
  }
}
