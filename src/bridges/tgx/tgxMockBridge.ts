/**
 * TGX-CEX Bridge — mock only.
 * `src/cex` export surface를 읽어 BRG·프로브에 반영합니다.
 */

import {
  getMarketDataFeedStatus,
  getPositionOrderSnapshot,
  getTickerSnapshot,
  selectedSymbol,
  symbolUniverse,
} from '../../cex'
import type { BridgeProbeResult } from '../shared/bridgeTypes'

/** 레거시 DTO — 필요 시 cex 티커와 정렬 */
export type TgxMockQuote = { symbol: string; bid: number; ask: number; ts: number }
export type TgxMockPosition = { symbol: string; side: 'long' | 'short'; qty: number; avg: number }
export type TgxMockOrderRow = { id: string; symbol: string; side: 'buy' | 'sell'; qty: number; status: string }

export function tgxMockListSymbols(): readonly string[] {
  return symbolUniverse.map((u) => u.symbol)
}

export function tgxMockGetQuote(symbol: string): TgxMockQuote {
  const t = getTickerSnapshot(symbol, selectedSymbol.marketId)
  const half = Math.max(t.last * 0.0001, 0.5)
  return { symbol, bid: t.last - half, ask: t.last + half, ts: t.ts }
}

export function tgxMockListPositions(): TgxMockPosition[] {
  return getPositionOrderSnapshot().positions.map((p) => ({
    symbol: p.symbol,
    side: p.side,
    qty: p.qty,
    avg: p.avgPrice,
  }))
}

export function tgxMockListOrders(): TgxMockOrderRow[] {
  return getPositionOrderSnapshot().orders.map((o) => ({
    id: o.id,
    symbol: o.symbol,
    side: o.side,
    qty: o.qty,
    status: o.status,
  }))
}

export async function probeTgxMockBridge(): Promise<BridgeProbeResult> {
  void tgxMockListSymbols()
  void tgxMockGetQuote(selectedSymbol.symbol)
  const pos = getPositionOrderSnapshot()
  const ticker = getTickerSnapshot(selectedSymbol.symbol, selectedSymbol.marketId)
  const md = getMarketDataFeedStatus()
  return {
    capabilitiesSummary: `cex surface · universe ${symbolUniverse.length} · MD ${md} · pos ${pos.positions.length} ord ${pos.orders.length}`,
    tgxPanel: {
      selectedSymbolLine: `${selectedSymbol.marketId} · ${selectedSymbol.symbol}`,
      symbolUniverseCount: symbolUniverse.length,
      marketDataStatus: md,
      positionsCount: pos.positions.length,
      ordersCount: pos.orders.length,
      tickerLine: `last ${ticker.last.toFixed(4)} (${ticker.changePct.toFixed(2)}%)`,
    },
  }
}
