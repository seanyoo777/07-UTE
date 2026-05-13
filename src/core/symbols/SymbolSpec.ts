import type { MarketId } from '../../markets/types'

/**
 * 자산 클래스 — 손익 공식·증거금·UI 위젯 라우팅에 사용.
 * 시장(MarketId)과는 직교: 동일 자산 클래스가 여러 시장에서 운영될 수 있음.
 */
export type AssetClass =
  | 'equity' // 주식
  | 'futures' // 지수·금리·통화·상품 선물
  | 'crypto-spot'
  | 'crypto-perp'
  | 'fx'
  | 'binary' // 바이너리 옵션 (콜/풋, 만기 페이아웃 고정)
  | 'index'
  | 'commodity'

/** 세션 규칙 — 장중/장외 게이트, UI 배지 표기 */
export type SessionType = '24h' | 'regular' | 'futures_session' | 'binary_window'

/**
 * 미실현·청산 손익 공식 계열
 * - linear: USDT-M 선형, (mark-avg)*qty*contractSize
 * - inverse: 코인 역선형 근사 (1/가격)
 * - stock: 주식 (mark-avg)*qty
 * - futures_contract: 틱가치 기반 (지수/원자재 선물)
 * - binary: 바이너리 옵션 페이아웃 모델 (확률형 — 별도 엔진)
 */
export type PnlFormulaType =
  | 'linear'
  | 'inverse'
  | 'stock'
  | 'futures_contract'
  | 'binary'

/**
 * 종목 거래·표시 스펙 — 어댑터/엔진/UI 공통 계약.
 * 모든 숫자 필드는 mergeSymbolSpec에서 유한값 강제.
 */
export type SymbolSpec = {
  symbol: string
  displayName: string
  marketId: MarketId
  assetClass: AssetClass
  quoteCurrency: string
  marginCurrency: string
  priceDecimals: number
  qtyDecimals: number
  tickSize: number
  lotSize: number
  /** 계약 1단위가 기초자산에 대응하는 배수 (주식 1주=1, 코인 1, NQ mini=20 등) */
  contractSize: number
  /** 가격이 tickSize만큼 움직일 때 1계약·1lot의 손익 통화금액 */
  tickValue: number
  defaultLeverage: number
  minQty: number
  maxQty: number
  sessionType: SessionType
  pnlFormulaType: PnlFormulaType
  /** 티커 부재 시 시드 가격 */
  referencePrice: number
  /** 바이너리 옵션 페이아웃율 (예: 0.85 = +85%) — assetClass='binary'일 때 사용 */
  binaryPayoutPct?: number
  /** TradingView 위젯용 심볼 (예: 'BINANCE:BTCUSDT', 'KRX:005930', 'NASDAQ:AAPL') */
  tvSymbol?: string
}

export const DEFAULT_SYMBOL_SPEC: SymbolSpec = {
  symbol: 'BTCUSDT',
  displayName: 'BTC/USDT',
  marketId: 'crypto',
  assetClass: 'crypto-perp',
  quoteCurrency: 'USDT',
  marginCurrency: 'USDT',
  priceDecimals: 2,
  qtyDecimals: 4,
  tickSize: 0.1,
  lotSize: 0.001,
  contractSize: 1,
  tickValue: 0.1,
  defaultLeverage: 10,
  minQty: 0.001,
  maxQty: 1_000_000,
  sessionType: '24h',
  pnlFormulaType: 'linear',
  referencePrice: 97_250,
}

type RequiredSpecKeys = 'symbol' | 'displayName' | 'marketId'

export function mergeSymbolSpec(
  partial: Partial<SymbolSpec> & Pick<SymbolSpec, RequiredSpecKeys>,
): SymbolSpec {
  const base = { ...DEFAULT_SYMBOL_SPEC, ...partial }
  const contractSize = base.contractSize > 0 ? base.contractSize : 1
  const tickSize = base.tickSize > 0 ? base.tickSize : 0.01
  const tickValue =
    Number.isFinite(base.tickValue) && base.tickValue > 0
      ? base.tickValue
      : tickSize * contractSize
  const lotSize = base.lotSize > 0 ? base.lotSize : 0.001
  return {
    ...base,
    contractSize,
    tickSize,
    tickValue,
    lotSize,
    minQty: base.minQty > 0 ? base.minQty : lotSize,
    maxQty: base.maxQty > 0 ? base.maxQty : DEFAULT_SYMBOL_SPEC.maxQty,
    defaultLeverage: base.defaultLeverage > 0 ? base.defaultLeverage : 1,
    referencePrice:
      Number.isFinite(base.referencePrice) && base.referencePrice > 0
        ? base.referencePrice
        : DEFAULT_SYMBOL_SPEC.referencePrice,
  }
}
