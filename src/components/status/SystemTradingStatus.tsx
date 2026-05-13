import { useEffect, useState } from 'react'
import type { MarketId } from '../../markets/types'

type SysState = 'off' | 'monitoring' | 'running' | 'paused'

const LABEL: Record<SysState, string> = {
  off: 'OFF',
  monitoring: 'MONITOR',
  running: 'RUNNING',
  paused: 'PAUSED',
}
const TONE: Record<SysState, string> = {
  off: 'bg-so-border/40 text-so-muted',
  monitoring: 'bg-so-warn/15 text-so-warn',
  running: 'bg-so-bid/15 text-so-bid',
  paused: 'bg-so-ask/15 text-so-ask',
}

/**
 * 시스템트레이딩 상태 (mock).
 * 시장이 바뀔 때 시드된 상태를 보여주고, 10초마다 monitoring↔running flicker.
 */
export function SystemTradingStatus({ marketId }: { marketId: MarketId }) {
  const [state, setState] = useState<SysState>(() => initialFor(marketId))
  useEffect(() => {
    const id = setInterval(() => {
      setState((s) => (s === 'running' ? 'monitoring' : s === 'monitoring' ? 'running' : s))
    }, 10_000)
    return () => clearInterval(id)
  }, [marketId])

  return (
    <button
      type="button"
      onClick={() =>
        setState((s) => (s === 'off' ? 'monitoring' : s === 'paused' ? 'monitoring' : s === 'running' ? 'paused' : 'off'))
      }
      className={`flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wide transition-colors ${TONE[state]}`}
      title="클릭: OFF → MONITOR → RUNNING → PAUSED → OFF (mock)"
    >
      <span className="text-[9px] opacity-70">SYS</span>
      <span className={state === 'running' ? 'motion-safe:animate-pulse' : ''}>{LABEL[state]}</span>
    </button>
  )
}

function initialFor(marketId: MarketId): SysState {
  switch (marketId) {
    case 'crypto':
    case 'global-futures':
      return 'running'
    case 'kr-stock':
    case 'us-stock':
    case 'kr-futures':
      return 'monitoring'
    default:
      return 'off'
  }
}
