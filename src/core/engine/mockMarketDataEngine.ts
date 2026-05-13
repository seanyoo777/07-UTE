import type { OrderBookSnapshot } from '../domain/trading'
import type { SymbolSpec } from '../symbols/SymbolSpec'
import { roundToTick } from '../utils/rounding'

/**
 * 결정론적 mock 시장 데이터 엔진.
 * - 가격: random walk (sigma는 referencePrice * 0.0008 ~ 0.002 사이)
 * - 호가: 마지막 가격 기준 ±N틱, 호가 수량은 lot 단위 난수
 *
 * 어댑터별 sigma/depth는 createMockState(spec, opts) 의 opts로 조정.
 */
export type MockTickState = {
  spec: SymbolSpec
  lastPrice: number
  prevPrice: number
  /** 24h % 변동 누적 (-N% ~ +N%) */
  cumulativeChangePct: number
}

export function createMockTickState(spec: SymbolSpec): MockTickState {
  return {
    spec,
    lastPrice: spec.referencePrice,
    prevPrice: spec.referencePrice,
    cumulativeChangePct: 0,
  }
}

export type MockTickOptions = {
  /** 분산 계수 (referencePrice 대비 비율) */
  sigmaRatio?: number
  /** 호가 depth (편도 호가 단수) */
  depth?: number
  /** 호가별 수량 시드 */
  bookQtyScale?: number
}

export function advanceMockTick(
  state: MockTickState,
  opts: MockTickOptions = {},
): MockTickState {
  const { spec } = state
  const sigmaRatio = opts.sigmaRatio ?? 0.001
  const noise = (Math.random() - 0.5) * 2
  const drift = noise * spec.referencePrice * sigmaRatio
  const raw = state.lastPrice + drift
  const guarded = raw > 0 ? raw : spec.referencePrice
  const next = roundToTick(guarded, spec.tickSize)
  const cum =
    state.cumulativeChangePct + ((next - state.lastPrice) / state.lastPrice) * 100
  return {
    spec,
    prevPrice: state.lastPrice,
    lastPrice: next,
    cumulativeChangePct: clampPct(cum),
  }
}

function clampPct(v: number): number {
  if (!Number.isFinite(v)) return 0
  if (v > 30) return 30
  if (v < -30) return -30
  return v
}

export function buildMockOrderBook(
  state: MockTickState,
  opts: MockTickOptions = {},
): OrderBookSnapshot {
  const { spec, lastPrice } = state
  const depth = opts.depth ?? 12
  const qtyScale = opts.bookQtyScale ?? Math.max(spec.lotSize * 10, spec.lotSize)
  const bids = Array.from({ length: depth }, (_, i) => {
    const price = roundToTick(lastPrice - spec.tickSize * (i + 1), spec.tickSize)
    return { price, quantity: rand(qtyScale, qtyScale * 4) }
  })
  const asks = Array.from({ length: depth }, (_, i) => {
    const price = roundToTick(lastPrice + spec.tickSize * (i + 1), spec.tickSize)
    return { price, quantity: rand(qtyScale, qtyScale * 4) }
  })
  return {
    symbol: spec.symbol,
    bids,
    asks,
    timestamp: Date.now(),
  }
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min)
}
