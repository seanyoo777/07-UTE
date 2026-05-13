import { useEffect, useState } from 'react'
import type { MarketId } from '../../markets/types'

type OneAiSignal = {
  bias: 'long' | 'short' | 'neutral'
  confidence: number
  asOf: number
}

/**
 * OneAI 신호 (mock).
 * - 시장 변경 시에는 부모에서 key prop 으로 remount → useState 초기화 트리거.
 * - 실제 OneAI 서비스 연결 시: useEffect 내부의 mock 생성만 fetch로 교체.
 */
function useMockOneAiSignal(marketId: MarketId): OneAiSignal {
  const [signal, setSignal] = useState<OneAiSignal>(() => generate(marketId))
  useEffect(() => {
    const id = setInterval(() => setSignal(generate(marketId)), 5_000)
    return () => clearInterval(id)
  }, [marketId])
  return signal
}

function generate(marketId: MarketId): OneAiSignal {
  const seed = (marketId.charCodeAt(0) * 7 + Date.now() / 5_000) | 0
  const r = (Math.sin(seed) + 1) / 2
  const bias: OneAiSignal['bias'] = r > 0.6 ? 'long' : r < 0.4 ? 'short' : 'neutral'
  const confidence = Math.round(50 + r * 45)
  return { bias, confidence, asOf: Date.now() }
}

const BIAS_LABEL = { long: 'LONG', short: 'SHORT', neutral: 'NEUTRAL' } as const
const BIAS_CLASS = {
  long: 'bg-so-bid/15 text-so-bid border-so-bid/30',
  short: 'bg-so-ask/15 text-so-ask border-so-ask/30',
  neutral: 'bg-so-border/40 text-so-muted border-so-border-2',
} as const

export function OneAiBadge({ marketId }: { marketId: MarketId }) {
  const sig = useMockOneAiSignal(marketId)
  return (
    <div
      className={`flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${BIAS_CLASS[sig.bias]}`}
      title={`OneAI mock 신호 — ${sig.confidence}% 확률 (${new Date(sig.asOf).toLocaleTimeString('ko-KR', { hour12: false })})`}
    >
      <span className="text-[9px] opacity-70">OneAI</span>
      <span>{BIAS_LABEL[sig.bias]}</span>
      <span className="rounded bg-so-bg/40 px-1 text-[9px]">{sig.confidence}%</span>
    </div>
  )
}
