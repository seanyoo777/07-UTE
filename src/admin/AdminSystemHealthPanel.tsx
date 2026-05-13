import { useEffect } from 'react'
import { useAdminAccessStore } from './adminAccessStore'
import type { AdminHealthSlice, AdminSystemHealthSnapshot } from './adminSystemHealth'

const STATUS_BADGE: Record<AdminHealthSlice['status'], string> = {
  ok: 'border-so-bid/50 bg-so-bid/12 text-so-bid',
  degraded: 'border-so-warn/50 bg-so-warn/12 text-so-warn',
  critical: 'border-so-ask/60 bg-so-ask/15 text-so-ask',
  unknown: 'border-so-border/60 bg-so-bg/40 text-so-muted',
}

type Props = {
  health: AdminSystemHealthSnapshot
}

const ROWS: { key: keyof Omit<AdminSystemHealthSnapshot, 'schemaVersion' | 'asOf'>; label: string }[] = [
  { key: 'bridgeHealth', label: 'Bridges' },
  { key: 'securityHealth', label: 'Security / Admin' },
  { key: 'marketDataHealth', label: 'Market data (CEX)' },
  { key: 'strategyHealth', label: 'Strategies (OneAI)' },
  { key: 'tournamentHealth', label: 'Tournaments (MockInvest)' },
  { key: 'p2pHealth', label: 'P2P / ute-surface' },
]

export function AdminSystemHealthPanel({ health }: Props) {
  const log = useAdminAccessStore((s) => s.log)

  useEffect(() => {
    log({
      action: 'health_view',
      resource: 'AdminSystemHealthPanel',
      result: 'ok',
      detail: `schema ${health.schemaVersion}`,
    })
  }, [log, health.schemaVersion])

  return (
    <div className="rounded-lg border border-so-border/80 bg-so-surface/40">
      <div className="border-b border-so-border/60 px-3 py-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-so-muted">System Health (mock)</h2>
        <p className="mt-0.5 font-mono text-[9px] text-so-muted">
          schema {health.schemaVersion} · asOf{' '}
          {new Date(health.asOf).toLocaleString('ko-KR', { hour12: false })}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-2 p-2 sm:grid-cols-2 lg:grid-cols-3">
        {ROWS.map((r) => {
          const slice = health[r.key]
          return (
            <div key={r.key} className="rounded-md border border-so-border/50 bg-so-bg/30 px-2.5 py-2">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold text-so-text">{r.label}</span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[8px] font-bold uppercase ${STATUS_BADGE[slice.status]}`}
                >
                  {slice.status}
                </span>
              </div>
              <p className="text-[10px] text-so-text/90">{slice.summary}</p>
              {slice.detail ? <p className="mt-0.5 text-[9px] text-so-muted">{slice.detail}</p> : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
