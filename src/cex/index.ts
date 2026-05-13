/**
 * 02 TGX-CEX `src/cex` export surface (mock).
 *
 * 연결 후보 (UTE bridge / BRG가 읽는 계약):
 * - `selectedSymbol`
 * - `symbolUniverse`
 * - `getMarketDataFeedStatus` — marketData 상태
 * - `getPositionOrderSnapshot` — 포지션/주문 스냅샷
 * - `getTickerSnapshot` — 티커 스냅샷
 */
export type {
  CexMarketDataFeedStatus,
  CexOrderRow,
  CexPositionOrderSnapshot,
  CexPositionRow,
  CexSelectedSymbol,
  CexSymbolUniverseEntry,
  CexTickerSnapshot,
} from './types'

export {
  getMarketDataFeedStatus,
  getPositionOrderSnapshot,
  getTickerSnapshot,
  selectedSymbol,
  setMockMarketDataFeedStatus,
  symbolUniverse,
} from './mockCexSurface'
