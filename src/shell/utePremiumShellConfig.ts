import type { MarketId } from '../markets/types'

/**
 * Premium shell 시장 탭 — 표시 라벨만 제품 톤에 맞춤.
 * 기존 `MarketId`·어댑터·레지스트리와 1:1 매핑 (데이터 경로 변경 없음).
 * "FX" / "Index" 는 셸 라벨일 뿐, 실제 mock 보드는 kr-futures / kr-stock.
 */
export const UTE_PREMIUM_SHELL_MARKETS: readonly {
  marketId: MarketId
  shellLabel: string
  shellHint: string
}[] = [
  { marketId: 'crypto', shellLabel: 'Crypto', shellHint: '24h' },
  { marketId: 'us-stock', shellLabel: 'US Stocks', shellHint: 'US equity' },
  { marketId: 'global-futures', shellLabel: 'Futures', shellHint: 'Glob' },
  { marketId: 'kr-futures', shellLabel: 'FX', shellHint: 'KR derivatives' },
  { marketId: 'kr-stock', shellLabel: 'Index', shellHint: 'KR equity' },
] as const
