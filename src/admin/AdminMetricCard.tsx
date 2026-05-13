import type { ReactNode } from 'react'

type Tone = 'default' | 'bid' | 'warn' | 'ask' | 'muted'

const TONE_WRAP: Record<Tone, string> = {
  default: 'border-so-border/80 bg-so-surface/60',
  bid: 'border-so-bid/40 bg-so-bid/10',
  warn: 'border-so-warn/40 bg-so-warn/10',
  ask: 'border-so-ask/40 bg-so-ask/10',
  muted: 'border-so-border/50 bg-so-bg/40',
}

type Props = {
  label: string
  value: ReactNode
  hint?: string
  tone?: Tone
}

export function AdminMetricCard({ label, value, hint, tone = 'default' }: Props) {
  return (
    <div
      className={`flex min-w-0 flex-col gap-1 rounded-lg border px-3 py-2.5 ${TONE_WRAP[tone]}`}
      title={hint}
    >
      <div className="text-[10px] font-semibold uppercase tracking-wider text-so-muted">{label}</div>
      <div className="truncate text-lg font-semibold tabular-nums text-so-text">{value}</div>
      {hint ? <div className="line-clamp-2 text-[9px] leading-snug text-so-muted">{hint}</div> : null}
    </div>
  )
}
