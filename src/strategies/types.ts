import type { MarketId } from '../markets/types'

/**
 * 03 OneAI / 전략 연구용 mock 타입 — 실 API·자동 실주문 없음.
 */

export type StrategyRegistryEntry = {
  id: string
  name: string
  version: string
}

/** 단일 시그널 (전략 출력) */
export type StrategySignal = {
  id: string
  strategyId: string
  marketId: MarketId
  symbol: string
  bias: 'long' | 'short' | 'neutral'
  strength: number
  ts: number
}

/** 전략 성과 요약 (연구용 mock 수치) */
export type StrategyResult = {
  strategyId: string
  label: string
  sharpeMock: number
  hitRateMock: number
}

/** 백테스트 요약 */
export type BacktestSummary = {
  strategyId: string
  period: string
  trades: number
  winratePct: number
  totalPnlMock: number
  maxDdPct: number
}

export type AggregateStrategyMockMetrics = {
  strategyCount: number
  recentSignalCount: number
  winratePct: number
  totalPnlMock: number
  riskLevel: 'low' | 'med' | 'high'
}

export type StrategyResearchDashboard = {
  registry: readonly StrategyRegistryEntry[]
  recentSignals: readonly StrategySignal[]
  backtests: readonly BacktestSummary[]
  results: readonly StrategyResult[]
  aggregate: AggregateStrategyMockMetrics
}
