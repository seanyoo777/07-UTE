import type { MarketId } from '../../markets/types'
import type { OrderRequest } from '../domain/order'
import type {
  OrderRecordRow,
  PositionRow,
  TradeFillRow,
} from '../domain/trading'
import type { SymbolSpec } from '../symbols/SymbolSpec'
import { formatTimeOfDay } from '../utils/format'
import { safeArray, safeNumber } from '../utils/safe'

export const MOCK_FEE_BPS = 4

export function estimateMockFee(notionalAbs: number): number {
  const n = safeNumber(notionalAbs, 0)
  if (n <= 0) return 0
  return (n * MOCK_FEE_BPS) / 10_000
}

function tickGain(spec: SymbolSpec, priceDelta: number): number {
  if (spec.pnlFormulaType === 'futures_contract' && spec.tickSize > 0) {
    return (priceDelta / spec.tickSize) * spec.tickValue
  }
  return priceDelta * spec.contractSize
}

function notionalForFee(spec: SymbolSpec, price: number, qty: number): number {
  if (spec.pnlFormulaType === 'futures_contract' && spec.tickSize > 0) {
    return Math.abs(qty) * spec.tickValue * (price / spec.tickSize)
  }
  return Math.abs(price * qty * spec.contractSize)
}

export type MockMatchInput = {
  marketId: MarketId
  spec: SymbolSpec
  request: OrderRequest
  /** 시장가일 때 사용할 체결가 (mock 라스트프라이스) */
  marketReferencePrice: number
  /** 기존 동일 심볼 단일 넷 포지션 (없으면 undefined) */
  existingPosition?: PositionRow
  now: number
  /** id 생성 시드 (테스트 결정성). 미지정 시 timestamp 기반 */
  idSeed?: string
}

export type MockMatchResult = {
  order: OrderRecordRow
  fill: TradeFillRow | null
  /** 실행 후 단일 넷 포지션 (size <= 0이면 null = 청산 완료) */
  nextPosition: PositionRow | null
  rejectedReason?: string
}

/**
 * 단일 넷 포지션 모델의 mock 즉시체결 엔진.
 * - market: 즉시 체결
 * - limit: mock 단계에서는 즉시 accepted, 가격이 라스트와 같으면 즉시 fill (간단화)
 *
 * 실거래 어댑터(KIS, IBKR, Binance...)는 이 엔진을 호출하지 않음.
 * Mock 어댑터(createMockAdapter)에서만 호출.
 */
export function executeMockMatch(input: MockMatchInput): MockMatchResult {
  const { marketId, spec, request, marketReferencePrice, existingPosition, now } = input
  const time = formatTimeOfDay(now)
  const orderId = makeOrderId(input)

  const qty = safeNumber(request.quantity, 0)
  if (qty <= 0) {
    return {
      order: makeOrderRow({
        id: orderId,
        marketId,
        request,
        now,
        time,
        status: 'rejected',
        filledQuantity: 0,
      }),
      fill: null,
      nextPosition: existingPosition ?? null,
      rejectedReason: 'quantity must be > 0',
    }
  }

  const ref =
    request.orderType === 'limit'
      ? safeNumber(request.limitPrice, marketReferencePrice)
      : marketReferencePrice
  if (ref <= 0) {
    return {
      order: makeOrderRow({
        id: orderId,
        marketId,
        request,
        now,
        time,
        status: 'rejected',
        filledQuantity: 0,
      }),
      fill: null,
      nextPosition: existingPosition ?? null,
      rejectedReason: 'invalid price',
    }
  }

  // 단순화: limit이라도 mock은 즉시 체결 시도 (참조가에서). 추후 호가매칭으로 확장.
  const fillPrice = ref
  const fillFee = estimateMockFee(notionalForFee(spec, fillPrice, qty))
  const fill: TradeFillRow = {
    id: `${orderId}-f`,
    marketId,
    symbol: spec.symbol,
    side: request.side,
    price: fillPrice,
    quantity: qty,
    fee: fillFee,
    realizedPnl: 0,
    time,
    timestamp: now,
  }

  const { nextPosition, realizedDelta } = applyFillToNetPosition({
    marketId,
    spec,
    existingPosition,
    fill,
  })
  fill.realizedPnl = realizedDelta - fillFee

  const order: OrderRecordRow = makeOrderRow({
    id: orderId,
    marketId,
    request,
    now,
    time,
    status: 'filled',
    filledQuantity: qty,
    price: request.orderType === 'limit' ? safeNumber(request.limitPrice, fillPrice) : fillPrice,
  })

  return { order, fill, nextPosition }
}

function makeOrderId(input: MockMatchInput): string {
  if (input.idSeed) return `o-${input.idSeed}`
  return `o-${input.now}-${Math.floor(Math.random() * 1e6).toString(36)}`
}

function makeOrderRow(args: {
  id: string
  marketId: MarketId
  request: OrderRequest
  now: number
  time: string
  status: OrderRecordRow['status']
  filledQuantity: number
  price?: number
}): OrderRecordRow {
  const { request } = args
  return {
    id: args.id,
    marketId: args.marketId,
    symbol: request.symbol,
    side: request.side,
    type: request.orderType,
    price:
      args.price !== undefined
        ? args.price
        : request.orderType === 'limit'
          ? safeNumber(request.limitPrice, 0)
          : null,
    quantity: safeNumber(request.quantity, 0),
    filledQuantity: args.filledQuantity,
    status: args.status,
    time: args.time,
    timestamp: args.now,
  }
}

function applyFillToNetPosition(args: {
  marketId: MarketId
  spec: SymbolSpec
  existingPosition?: PositionRow
  fill: TradeFillRow
}): { nextPosition: PositionRow | null; realizedDelta: number } {
  const { marketId, spec, existingPosition, fill } = args
  const list = safeArray(existingPosition ? [existingPosition] : [])
  const px = fill.price
  const qty = fill.quantity
  const side = fill.side

  if (list.length === 0) {
    const pos: PositionRow = {
      id: `pos-${marketId}-${spec.symbol}`,
      marketId,
      symbol: spec.symbol,
      side: side === 'buy' ? 'long' : 'short',
      size: qty,
      avgPrice: px,
      unrealizedPnl: 0,
      realizedPnl: 0,
      returnPct: 0,
    }
    return { nextPosition: pos, realizedDelta: 0 }
  }

  const pos = { ...list[0] }
  const sameDirection =
    (pos.side === 'long' && side === 'buy') || (pos.side === 'short' && side === 'sell')

  if (sameDirection) {
    const denom = pos.size + qty
    pos.avgPrice = denom > 0 ? (pos.avgPrice * pos.size + px * qty) / denom : px
    pos.size = denom
    return { nextPosition: pos, realizedDelta: 0 }
  }

  let orderLeft = qty
  let grossClose = 0
  while (orderLeft > 0 && pos.size > 0) {
    const dq = Math.min(orderLeft, pos.size)
    const priceDelta = pos.side === 'long' ? px - pos.avgPrice : pos.avgPrice - px
    grossClose += tickGain(spec, priceDelta) * dq
    pos.size -= dq
    orderLeft -= dq
  }

  if (pos.size <= 0 && orderLeft > 0) {
    const flipped: PositionRow = {
      ...pos,
      side: pos.side === 'long' ? 'short' : 'long',
      size: orderLeft,
      avgPrice: px,
      realizedPnl: pos.realizedPnl + grossClose,
    }
    return { nextPosition: flipped, realizedDelta: grossClose }
  }
  if (pos.size <= 0) {
    return { nextPosition: null, realizedDelta: grossClose }
  }
  pos.realizedPnl = pos.realizedPnl + grossClose
  return { nextPosition: pos, realizedDelta: grossClose }
}
