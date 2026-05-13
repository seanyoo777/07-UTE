import type { AdminRiskAlert, AdminRiskSeverity } from './buildAdminRiskAlerts'

const SEV: Record<AdminRiskSeverity, string> = {
  critical: 'border-so-ask/60 bg-so-ask/15 text-so-text',
  warn: 'border-so-warn/50 bg-so-warn/10 text-so-text',
  info: 'border-so-border/70 bg-so-surface/50 text-so-text',
}

const SEV_LABEL: Record<AdminRiskSeverity, string> = {
  critical: 'CRITICAL',
  warn: 'WARN',
  info: 'INFO',
}

type Props = {
  alerts: AdminRiskAlert[]
}

export function AdminRiskAlertList({ alerts }: Props) {
  if (alerts.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-so-border/80 px-3 py-4 text-center text-[11px] text-so-muted">
        표시할 리스크 알림이 없습니다.
      </p>
    )
  }
  return (
    <ul className="space-y-2">
      {alerts.map((a) => (
        <li
          key={a.id}
          className={`flex flex-col gap-1 rounded-lg border px-3 py-2 text-[11px] leading-snug ${SEV[a.severity]}`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-so-bg/50 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-so-muted">
              {SEV_LABEL[a.severity]}
            </span>
            <span className="font-semibold">{a.title}</span>
            <span className="text-[9px] uppercase text-so-muted">{a.source}</span>
          </div>
          <p className="text-[10px] text-so-muted">{a.detail}</p>
        </li>
      ))}
    </ul>
  )
}
