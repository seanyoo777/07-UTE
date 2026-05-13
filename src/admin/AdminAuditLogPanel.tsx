import type { AdminAuditLogEntry } from './adminAuditLog'

const RESULT_TONE: Record<AdminAuditLogEntry['result'], string> = {
  ok: 'text-so-bid',
  denied: 'text-so-ask',
  skipped: 'text-so-warn',
}

type Props = {
  entries: AdminAuditLogEntry[]
}

export function AdminAuditLogPanel({ entries }: Props) {
  return (
    <div className="rounded-lg border border-so-border/80 bg-so-surface/40">
      <div className="border-b border-so-border/60 px-3 py-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-so-muted">Audit log (mock)</h2>
        <p className="mt-0.5 text-[9px] text-so-muted">
          브라우저 메모리만 사용 — 서버 저장·실 감사 파이프라인 없음. refresh / view_admin / export 등 읽기 이벤트.
        </p>
      </div>
      <div className="max-h-[280px] overflow-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-[10px]">
          <thead className="sticky top-0 z-[1] bg-so-bg/95 text-[9px] font-semibold uppercase tracking-wider text-so-muted">
            <tr>
              <th className="px-2 py-1.5">시각</th>
              <th className="px-2 py-1.5">역할</th>
              <th className="px-2 py-1.5">액션</th>
              <th className="px-2 py-1.5">리소스</th>
              <th className="px-2 py-1.5">결과</th>
              <th className="px-2 py-1.5">상세</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-t border-so-border/40">
                <td className="whitespace-nowrap px-2 py-1 font-mono text-so-muted">
                  {new Date(e.at).toLocaleString('ko-KR', { hour12: false })}
                </td>
                <td className="px-2 py-1 font-mono text-so-text/90">{e.role}</td>
                <td className="px-2 py-1 text-so-text">{e.action}</td>
                <td className="max-w-[180px] truncate px-2 py-1 font-mono text-so-muted" title={e.resource}>
                  {e.resource}
                </td>
                <td className={`px-2 py-1 font-semibold ${RESULT_TONE[e.result]}`}>{e.result}</td>
                <td className="max-w-[240px] truncate px-2 py-1 text-so-muted" title={e.detail}>
                  {e.detail ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
