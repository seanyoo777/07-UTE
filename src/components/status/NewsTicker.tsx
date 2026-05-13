import { useEffect, useMemo, useState } from 'react'
import type { MarketId } from '../../markets/types'

type NewsItem = { id: string; tag: string; headline: string; time: string }

const STREAMS: Record<MarketId, string[]> = {
  'kr-stock': [
    '코스피 외국인 3거래일 연속 순매수 — 반도체 강세',
    '삼성전자 4분기 실적 컨센서스 상회 (mock)',
    '한은 기준금리 동결 가능성 우세',
  ],
  'us-stock': [
    'S&P500 사상 최고치 경신 (mock)',
    'NVDA AI 가속기 신규 수주 — 시간외 +3%',
    'FOMC 점도표 dovish 해석 우세',
  ],
  'kr-futures': [
    'KOSPI200 야간선물 -0.4% — 미증시 약세 영향',
    '미결제약정 3거래일 연속 증가',
    '국고채 10년 금리 3.42% 마감',
  ],
  'global-futures': [
    'WTI 71.4 — OPEC+ 감산 연장 기대',
    'NQ 마이크로 거래량 평년 대비 +18%',
    '금 2,345 회복 — 달러 약세 영향',
  ],
  crypto: [
    'BTC 97k 저항 테스트 — 펀딩비 +0.012%',
    'ETH 현물 ETF 순유입 3일 연속',
    'SOL 메인넷 안정성 회복',
  ],
}

export function NewsTicker({ marketId }: { marketId: MarketId }) {
  const items: NewsItem[] = useMemo(
    () =>
      (STREAMS[marketId] ?? []).map((h, i) => ({
        id: `${marketId}-${i}`,
        tag: ['HOT', 'AI', 'FLOW'][i % 3] ?? '뉴스',
        headline: h,
        time: ['방금', '2분 전', '7분 전'][i] ?? '',
      })),
    [marketId],
  )
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const id = setInterval(
      () => setIdx((i) => (items.length === 0 ? 0 : (i + 1) % items.length)),
      4_000,
    )
    return () => clearInterval(id)
  }, [items.length])

  if (items.length === 0) return null
  const it = items[idx]
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-md border border-so-border bg-so-surface-2 px-2 py-1 text-[11px]">
      <span className="shrink-0 rounded bg-so-accent/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-so-accent">
        {it.tag}
      </span>
      <span className="min-w-0 flex-1 truncate text-so-text">{it.headline}</span>
      <span className="shrink-0 text-[10px] text-so-muted">{it.time}</span>
    </div>
  )
}
