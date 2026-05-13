import type { OrderMode } from '../core/domain/order'
import type { MarketId } from '../markets/types'

/**
 * 카테고리(시장)별 UI/주문 동작 config.
 *
 * 핵심 원칙:
 * - **UI 컴포넌트는 동일**, 카테고리별 다른 점은 모두 이 config에서만 표현.
 * - 새 시장 추가 시: MarketId union + 어댑터 + 이 CONFIGS 맵만 추가.
 * - 라이브 어댑터로 전환해도 이 config는 그대로 재사용.
 */
export type OrderTypeOption = 'market' | 'limit' | 'stop' | 'stop_limit'

export type SidesLabels = { buy: string; sell: string; buyAccent: 'bid' | 'ask'; sellAccent: 'bid' | 'ask' }

export type CategoryConfig = {
  marketId: MarketId
  /** UI 헤더 표시명 */
  label: string
  /** 카테고리 아이콘 배지 텍스트 (2~3자) */
  badge: string
  /** 강조 색상 (CSS 변수 토큰 이름) */
  accentColor: string

  /** 사용 가능 주문 타입 */
  orderTypes: OrderTypeOption[]
  /** 기본 주문 타입 */
  defaultOrderType: OrderTypeOption
  /** 기본 주문 모드 (엔진 라우팅) */
  defaultOrderMode: OrderMode

  /** 매수/매도 라벨 (바이너리 = UP/DOWN, 주식 = 매수/매도) */
  sides: SidesLabels

  // ── 카테고리별 토글 가능 기능 ───────────────────
  showLeverageSelector: boolean
  showHedgeToggle: boolean
  showStopLossTakeProfit: boolean
  showBinaryExpiry: boolean
  showShortSellWarning: boolean
  showFuturesMargin: boolean

  /** 바이너리: 만기 옵션 (초) */
  binaryExpiryOptions?: number[]

  // ── 상단 상태바 노출 항목 ──────────────────────
  hasOneAiSignal: boolean
  hasNewsFeed: boolean
  hasSystemTrading: boolean
  hasMarketSession: boolean

  /** 세션 표시 라벨 (KR 정규장, 24h, 선물 야간장 등) */
  sessionLabel: string

  /** 사용자에게 보여줄 주문 로직 1줄 요약 */
  orderLogicHint: string
}

const CONFIGS: Record<MarketId, CategoryConfig> = {
  'kr-stock': {
    marketId: 'kr-stock',
    label: '국내주식',
    badge: 'KR',
    accentColor: '#3b82f6',
    orderTypes: ['limit', 'market'],
    defaultOrderType: 'limit',
    defaultOrderMode: 'standard',
    sides: { buy: '매수', sell: '매도', buyAccent: 'bid', sellAccent: 'ask' },
    showLeverageSelector: false,
    showHedgeToggle: false,
    showStopLossTakeProfit: false,
    showBinaryExpiry: false,
    showShortSellWarning: true,
    showFuturesMargin: false,
    hasOneAiSignal: true,
    hasNewsFeed: true,
    hasSystemTrading: true,
    hasMarketSession: true,
    sessionLabel: 'KRX 정규장 09:00–15:30',
    orderLogicHint: '보유 수량 기준 매수/매도, 공매도 불가 (mock)',
  },
  'us-stock': {
    marketId: 'us-stock',
    label: '미국주식',
    badge: 'US',
    accentColor: '#22c55e',
    orderTypes: ['limit', 'market'],
    defaultOrderType: 'limit',
    defaultOrderMode: 'standard',
    sides: { buy: '매수', sell: '매도', buyAccent: 'bid', sellAccent: 'ask' },
    showLeverageSelector: false,
    showHedgeToggle: false,
    showStopLossTakeProfit: true,
    showBinaryExpiry: false,
    showShortSellWarning: true,
    showFuturesMargin: false,
    hasOneAiSignal: true,
    hasNewsFeed: true,
    hasSystemTrading: true,
    hasMarketSession: true,
    sessionLabel: 'NYSE 23:30–06:00 (KST)',
    orderLogicHint: '주식 모델 — 평균단가·평가손익 기준',
  },
  'kr-futures': {
    marketId: 'kr-futures',
    label: '국내선물',
    badge: 'KRF',
    accentColor: '#a855f7',
    orderTypes: ['limit', 'market', 'stop', 'stop_limit'],
    defaultOrderType: 'limit',
    defaultOrderMode: 'standard',
    sides: { buy: '매수', sell: '매도', buyAccent: 'bid', sellAccent: 'ask' },
    showLeverageSelector: true,
    showHedgeToggle: false,
    showStopLossTakeProfit: true,
    showBinaryExpiry: false,
    showShortSellWarning: false,
    showFuturesMargin: true,
    hasOneAiSignal: true,
    hasNewsFeed: true,
    hasSystemTrading: true,
    hasMarketSession: true,
    sessionLabel: 'KOSPI200 09:00–15:45 / 야간 18:00–05:00',
    orderLogicHint: '반대 주문 시 보유분 청산 후 초과분은 반대 포지션',
  },
  'global-futures': {
    marketId: 'global-futures',
    label: '해외선물',
    badge: 'GF',
    accentColor: '#f59e0b',
    orderTypes: ['limit', 'market', 'stop', 'stop_limit'],
    defaultOrderType: 'limit',
    defaultOrderMode: 'standard',
    sides: { buy: '매수', sell: '매도', buyAccent: 'bid', sellAccent: 'ask' },
    showLeverageSelector: true,
    showHedgeToggle: false,
    showStopLossTakeProfit: true,
    showBinaryExpiry: false,
    showShortSellWarning: false,
    showFuturesMargin: true,
    hasOneAiSignal: true,
    hasNewsFeed: true,
    hasSystemTrading: true,
    hasMarketSession: true,
    sessionLabel: 'CME 23:00–22:00 (거의 24h)',
    orderLogicHint: 'futures_contract 손익공식 — tickValue 기반 계산',
  },
  crypto: {
    marketId: 'crypto',
    label: '코인',
    badge: 'CRY',
    accentColor: '#f97316',
    orderTypes: ['limit', 'market', 'stop', 'stop_limit'],
    defaultOrderType: 'limit',
    defaultOrderMode: 'standard',
    sides: { buy: '매수 / Long', sell: '매도 / Short', buyAccent: 'bid', sellAccent: 'ask' },
    showLeverageSelector: true,
    showHedgeToggle: true,
    showStopLossTakeProfit: true,
    showBinaryExpiry: false,
    showShortSellWarning: false,
    showFuturesMargin: true,
    hasOneAiSignal: true,
    hasNewsFeed: true,
    hasSystemTrading: true,
    hasMarketSession: false,
    sessionLabel: '24/7',
    orderLogicHint: 'USDT-M 영구선물 mock — Hedge 시 롱/숏 동시 보유 가능',
  },
}

export function getCategoryConfig(marketId: MarketId): CategoryConfig {
  return CONFIGS[marketId]
}

export const ALL_CATEGORY_CONFIGS: ReadonlyArray<CategoryConfig> = Object.values(CONFIGS)
