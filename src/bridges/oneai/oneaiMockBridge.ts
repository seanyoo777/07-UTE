/**
 * OneAI Bridge — mock only.
 * `src/strategies` export surface(전략·시그널·백테스트)를 읽어 BRG에 반영합니다.
 * 실 API·자동 실주문 없음.
 */

import { buildStrategyResearchDashboard } from '../../strategies'
import type { BridgeProbeResult } from '../shared/bridgeTypes'

export type OneaiMockNewsItem = { id: string; headline: string; ts: number }
export type OneaiMockSignal = { bias: 'long' | 'short' | 'neutral'; confidence: number; asOf: number }
export type OneaiMockAlert = { id: string; level: 'info' | 'warn' | 'critical'; text: string; ts: number }

export function oneaiMockListNews(): OneaiMockNewsItem[] {
  return [
    { id: 'n1', headline: '[mock] 시장 변동성 주의', ts: Date.now() - 60_000 },
    { id: 'n2', headline: '[mock] 유동성 리포트', ts: Date.now() - 120_000 },
  ]
}

export function oneaiMockGetSignal(): OneaiMockSignal {
  return { bias: 'neutral', confidence: 62, asOf: Date.now() }
}

export function oneaiMockListAlerts(): OneaiMockAlert[] {
  return [{ id: 'a1', level: 'info', text: '[mock] OneAI 세션 활성', ts: Date.now() }]
}

export async function probeOneaiMockBridge(): Promise<BridgeProbeResult> {
  void oneaiMockListNews()
  void oneaiMockGetSignal()
  void oneaiMockListAlerts()

  const dash = buildStrategyResearchDashboard()
  const a = dash.aggregate

  return {
    capabilitiesSummary: `strategies·signals·backtest mock · ${a.strategyCount} strategies · ${a.recentSignalCount} signals/24h · WR ${a.winratePct.toFixed(1)}% · risk ${a.riskLevel}`,
    oneaiPanel: {
      strategyCount: a.strategyCount,
      recentSignalCount: a.recentSignalCount,
      aggregateWinrate: `${a.winratePct.toFixed(1)}% (mock)`,
      aggregatePnl: `${a.totalPnlMock >= 0 ? '+' : ''}${a.totalPnlMock.toFixed(0)} USD (mock)`,
      riskLevel: a.riskLevel,
    },
  }
}
