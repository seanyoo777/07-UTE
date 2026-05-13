import { MARKETS } from '../markets/registry'
import type {
  AggregateStrategyMockMetrics,
  BacktestSummary,
  StrategyRegistryEntry,
  StrategyResearchDashboard,
  StrategyResult,
  StrategySignal,
} from './types'

export const strategyRegistry: readonly StrategyRegistryEntry[] = [
  { id: 'strat-momo-v1', name: 'Momentum Lite', version: '1.0.0-mock' },
  { id: 'strat-mr-v2', name: 'Mean Revert Sandbox', version: '2.0.0-mock' },
  { id: 'strat-carry-v0', name: 'Carry Probe', version: '0.9.0-mock' },
]

const mockSignals: StrategySignal[] = (() => {
  const out: StrategySignal[] = []
  let i = 0
  for (const m of MARKETS) {
    const biases: StrategySignal['bias'][] = ['long', 'short', 'neutral']
    out.push({
      id: `sig-${i}`,
      strategyId: strategyRegistry[i % strategyRegistry.length]!.id,
      marketId: m.id,
      symbol: m.defaultSymbol,
      bias: biases[i % 3]!,
      strength: 40 + (i * 11) % 55,
      ts: Date.now() - i * 45_000,
    })
    i += 1
  }
  return out
})()

const mockBacktests: BacktestSummary[] = strategyRegistry.map((r, idx) => ({
  strategyId: r.id,
  period: '90d_mock',
  trades: 120 + idx * 30,
  winratePct: 48 + idx * 2.5,
  totalPnlMock: -500 + idx * 1800,
  maxDdPct: 6 + idx * 1.2,
}))

const mockResults: StrategyResult[] = strategyRegistry.map((r, idx) => ({
  strategyId: r.id,
  label: r.name,
  sharpeMock: 0.4 + idx * 0.15,
  hitRateMock: 0.48 + idx * 0.02,
}))

export function getAggregateMockStrategyMetrics(): AggregateStrategyMockMetrics {
  const recentCut = Date.now() - 24 * 60 * 60 * 1000
  const recent = mockSignals.filter((s) => s.ts >= recentCut)
  const avgWr =
    mockBacktests.reduce((a, b) => a + b.winratePct, 0) / Math.max(mockBacktests.length, 1)
  const sumPnl = mockBacktests.reduce((a, b) => a + b.totalPnlMock, 0)
  const maxDd = Math.max(...mockBacktests.map((b) => b.maxDdPct))
  const riskLevel: AggregateStrategyMockMetrics['riskLevel'] =
    maxDd > 12 ? 'high' : maxDd > 8 ? 'med' : 'low'
  return {
    strategyCount: strategyRegistry.length,
    recentSignalCount: recent.length,
    winratePct: avgWr,
    totalPnlMock: sumPnl,
    riskLevel,
  }
}

/**
 * OneAI / 전략 연구 대시보드 mock — 03번 `src/strategies` export surface 정렬.
 */
export function buildStrategyResearchDashboard(): StrategyResearchDashboard {
  return {
    registry: strategyRegistry,
    recentSignals: mockSignals,
    backtests: mockBacktests,
    results: mockResults,
    aggregate: getAggregateMockStrategyMetrics(),
  }
}

export function listRecentStrategySignals(limit = 50): readonly StrategySignal[] {
  return [...mockSignals].sort((a, b) => b.ts - a.ts).slice(0, limit)
}
