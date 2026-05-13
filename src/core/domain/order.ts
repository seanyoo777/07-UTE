import type { OrderSide, OrderRecordRow } from './trading'

/** UI/엔진 라우팅용 주문 모드 (확장 슬롯) */
export type OrderMode = 'standard' | 'speed' | 'hts' | 'conditional' | 'binary'

/** 조건/복합 주문 타입 (mock 단계에서 타입만 확보) */
export type ConditionalOrderType =
  | 'LIMIT'
  | 'MARKET'
  | 'STOP'
  | 'STOP_LIMIT'
  | 'MIT'
  | 'OCO'
  | 'TP_SL'

/** 어댑터/엔진 입력용 공통 주문 요청 (mock 파이프라인 전용) */
export type OrderRequest = {
  symbol: string
  side: OrderSide
  mode: OrderMode
  orderType: 'market' | 'limit'
  quantity: number
  limitPrice?: number
  conditionalType?: ConditionalOrderType
  /** 바이너리 옵션 전용 — 만기 초 단위 (예: 60 = 60초) */
  binaryExpirySec?: number
  /** 바이너리 옵션 전용 — Up/Down 선택 (side=buy=Up, sell=Down 매핑) */
  binaryDirection?: 'up' | 'down'
  /** 어댑터별 자유 메타 (예: 계좌번호, 호가단위 강제 등) */
  meta?: Record<string, unknown>
}

/** 어댑터 placeOrder 응답 (단일 주문 단위) */
export type OrderAck =
  | {
      ok: true
      order: OrderRecordRow
    }
  | {
      ok: false
      reason: string
      code?: string
    }
