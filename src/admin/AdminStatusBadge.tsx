import type { BridgeDashboardStatus } from '../bridges/shared/bridgeTypes'

const TONE: Record<BridgeDashboardStatus, string> = {
  disabled: 'border-so-border bg-so-border/30 text-so-muted',
  error: 'border-so-ask/50 bg-so-ask/15 text-so-ask',
  mock: 'border-so-warn/50 bg-so-warn/15 text-so-warn',
  connected: 'border-so-bid/50 bg-so-bid/15 text-so-bid',
}

const LABEL: Record<BridgeDashboardStatus, string> = {
  disabled: 'DISABLED',
  error: 'ERROR',
  mock: 'MOCK',
  connected: 'OK',
}

type Props = {
  status: BridgeDashboardStatus
  className?: string
}

export function AdminStatusBadge({ status, className = '' }: Props) {
  return (
    <span
      className={`inline-flex shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wide ${TONE[status]} ${className}`}
    >
      {LABEL[status]}
    </span>
  )
}
