import { useEffect } from 'react'
import { useAdminAccessStore } from './adminAccessStore'
import type { AdminNotificationItem, AdminNotificationSeverity } from './adminNotificationTypes'

const SEV_BADGE: Record<AdminNotificationSeverity, string> = {
  critical: 'border-so-ask/60 bg-so-ask/15 text-so-ask',
  warning: 'border-so-warn/50 bg-so-warn/12 text-so-warn',
  info: 'border-so-border/70 bg-so-surface/50 text-so-muted',
}

type Props = {
  items: AdminNotificationItem[]
}

export function AdminNotificationCenter({ items }: Props) {
  const log = useAdminAccessStore((s) => s.log)

  useEffect(() => {
    log({
      action: 'notification_view',
      resource: 'AdminNotificationCenter',
      result: 'ok',
      detail: `${items.length} items (mock)`,
    })
  }, [log, items.length])

  return (
    <div className="rounded-lg border border-so-border/80 bg-so-surface/40">
      <div className="border-b border-so-border/60 px-3 py-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-so-muted">Notification Center (mock)</h2>
        <p className="mt-0.5 text-[9px] text-so-muted">스냅샷·헬스 기반 데모 — 실 푸시·영속 저장 없음.</p>
      </div>
      <ul className="max-h-[260px] divide-y divide-so-border/40 overflow-auto">
        {items.map((n) => (
          <li key={n.id} className="px-3 py-2 text-[10px] leading-snug">
            <div className="mb-0.5 flex flex-wrap items-center gap-2">
              <span className={`rounded px-1.5 py-0.5 text-[8px] font-bold uppercase ${SEV_BADGE[n.severity]}`}>
                {n.severity}
              </span>
              <span className="rounded bg-so-bg/50 px-1 py-0.5 font-mono text-[8px] uppercase text-so-muted">
                {n.category}
              </span>
              <span className="font-semibold text-so-text">{n.title}</span>
            </div>
            <p className="text-so-muted">{n.body}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
