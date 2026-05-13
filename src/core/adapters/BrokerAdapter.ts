import type { MarketId } from '../../markets/types'
import type { OrderAck, OrderRequest } from '../domain/order'
import type {
  OrderBookSnapshot,
  OrderRecordRow,
  PositionRow,
  TickerRow,
  TradeFillRow,
} from '../domain/trading'
import type { SymbolSpec } from '../symbols/SymbolSpec'

export type Unsubscribe = () => void

export type TickerUpdate = Pick<TickerRow, 'symbol' | 'price' | 'changePct'> & {
  marketId: MarketId
  timestamp: number
}

export type MarketDataHandlers = {
  onTicker?: (update: TickerUpdate) => void
  onOrderBook?: (book: OrderBookSnapshot) => void
  onTrade?: (fill: TradeFillRow) => void
}

export type AdapterKind = 'mock' | 'live'

/**
 * 모든 시장(코인/주식/선물/바이너리/...)에 공통으로 적용되는 브로커 어댑터 계약.
 *
 * 원칙
 * - UI/Store는 이 인터페이스에만 의존. 어댑터 교체 = 시장/거래소 교체.
 * - mock 어댑터는 동일 인터페이스로 결정론적 데이터 공급.
 * - live 어댑터 (KIS/Binance/IB/...) 도입 시 이 파일을 변경하지 않음.
 */
export interface BrokerAdapter {
  readonly id: string
  readonly marketId: MarketId
  readonly displayName: string
  readonly kind: AdapterKind

  // ── 라이프사이클 ─────────────────────────────
  connect(): Promise<void>
  disconnect(): Promise<void>
  isConnected(): boolean

  // ── 메타 (심볼 목록/스펙) ────────────────────
  listSymbols(): Promise<SymbolSpec[]>
  getSymbolSpec(symbol: string): Promise<SymbolSpec | undefined>

  // ── 시장 데이터 구독 ─────────────────────────
  subscribe(symbol: string, handlers: MarketDataHandlers): Unsubscribe

  // ── 주문/계좌 ────────────────────────────────
  placeOrder(req: OrderRequest): Promise<OrderAck>
  cancelOrder(orderId: string): Promise<void>
  getOpenOrders(): Promise<OrderRecordRow[]>
  getPositions(): Promise<PositionRow[]>
}
