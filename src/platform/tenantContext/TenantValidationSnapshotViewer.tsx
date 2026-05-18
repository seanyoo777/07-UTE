import type { TenantConfigValidationSnapshot } from './tenantConfigValidationTypes'

const VERDICT_TONE: Record<string, string> = {
  PASS: 'text-so-bid',
  WARN: 'text-so-warn',
  FAIL: 'text-so-ask',
}

type Props = {
  snapshot: TenantConfigValidationSnapshot
}

export function TenantValidationSnapshotViewer({ snapshot }: Props) {
  return (
    <div className="rounded-md border border-so-border/50 bg-so-bg/50 p-2 text-[10px]">
      <div className="mb-1.5 flex flex-wrap items-center gap-2">
        <span className="font-semibold text-so-fg">{snapshot.source}</span>
        <span className={`font-bold uppercase ${VERDICT_TONE[snapshot.overall]}`}>
          {snapshot.overall}
        </span>
        <span className="text-so-muted">
          {new Date(snapshot.validatedAt).toLocaleString(undefined, {
            dateStyle: 'short',
            timeStyle: 'medium',
          })}
        </span>
      </div>
      <p className="mb-1 font-mono text-[9px] text-so-muted">
        tenant={snapshot.tenantId} · company={snapshot.companyId} · platform={snapshot.platformId}
      </p>
      <p className="mb-2 font-mono text-[9px] text-so-muted">scopeKey={snapshot.scopeKey}</p>
      <ul className="max-h-[140px] space-y-1 overflow-y-auto">
        {snapshot.checks.map((c) => (
          <li
            key={c.id}
            className="rounded border border-so-border/40 bg-so-panel/30 px-2 py-1"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-so-fg">{c.label}</span>
              <span className={`shrink-0 font-semibold uppercase ${VERDICT_TONE[c.verdict]}`}>
                {c.verdict}
              </span>
            </div>
            {c.detail ? (
              <p className="mt-0.5 truncate text-[9px] text-so-muted" title={c.detail}>
                {c.detail}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
