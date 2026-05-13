/**
 * 03 OneAI 정렬 — 전략 / 시그널 / 백테스트 mock export surface.
 * BRG·`src/bridges/oneai`에서만 소비 권장. BrokerAdapter와 분리.
 */
export type {
  AggregateStrategyMockMetrics,
  BacktestSummary,
  StrategyRegistryEntry,
  StrategyResearchDashboard,
  StrategyResult,
  StrategySignal,
} from './types'

export {
  buildStrategyResearchDashboard,
  getAggregateMockStrategyMetrics,
  listRecentStrategySignals,
  strategyRegistry,
} from './mockStrategiesSurface'
