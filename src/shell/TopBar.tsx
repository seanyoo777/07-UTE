import { getMarketDef } from '../markets/registry'
import type { MarketId } from '../markets/types'
import type { AdapterStatus } from '../store/types'

type Props = {
  marketId: MarketId
  status: AdapterStatus
}

const STATUS_LABEL: Record<AdapterStatus, string> = {
  idle: '대기',
  connecting: '연결중…',
  ready: '연결됨',
  error: '오류',
}

const STATUS_COLOR: Record<AdapterStatus, string> = {
  idle: 'bg-so-border text-so-muted',
  connecting: 'bg-so-warn/20 text-so-warn',
  ready: 'bg-so-bid/15 text-so-bid',
  error: 'bg-so-ask/15 text-so-ask',
}

export function TopBar({ marketId, status }: Props) {
  const def = getMarketDef(marketId)
  return (
    <header className="flex shrink-0 items-center justify-between gap-3 border-b border-so-border bg-so-surface px-3 py-2">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-so-accent text-[11px] font-bold text-white">
          UTX
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[13px] font-semibold text-so-text">Universal Trading Exchange</span>
          <span className="text-[10px] uppercase tracking-wider text-so-muted">
            mock build · multi-asset
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-[11px]">
        <span className="hidden text-so-muted sm:inline">활성 시장</span>
        <span className="rounded-md border border-so-border bg-so-surface-2 px-2 py-0.5 font-semibold text-so-text">
          {def.label}
        </span>
        <span
          className={`rounded-md px-2 py-0.5 font-semibold ${STATUS_COLOR[status]}`}
          aria-live="polite"
        >
          {STATUS_LABEL[status]}
        </span>
      </div>
    </header>
  )
}
