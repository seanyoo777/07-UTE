/**
 * 플랫폼에 노출되는 "시장(market)" 식별자.
 * - 자산군(asset class)과는 별개. 동일 자산군이라도 시장(브로커/거래소) 단위로 분리.
 * - 신규 시장 추가 = 이 union + markets/registry + adapters/* 만 추가.
 */
export type MarketId =
  | 'kr-stock' // 국내주식
  | 'us-stock' // 미국주식
  | 'kr-futures' // 국내선물
  | 'global-futures' // 해외선물
  | 'crypto' // 코인 (현물/선물 통합 mock)

/** 시장 정적 메타 — 탭/라우팅/표시에 사용 */
export type MarketDef = {
  id: MarketId
  label: string
  shortLabel: string
  /** 표시 통화 (UI 헤더용) */
  quoteCurrency: string
  /** 기본 진입 심볼 (어댑터의 listSymbols 결과에 반드시 포함되어야 함) */
  defaultSymbol: string
  /** 24시간 / 정규장 / 선물 세션 등 — UI 배지 표기에 사용 */
  sessionHint: '24h' | 'regular' | 'futures'
  /** 화이트라벨 색상 토큰 (CSS 변수 키) — 필요 시 시장별 강조색 분리 */
  accentVar?: string
}
