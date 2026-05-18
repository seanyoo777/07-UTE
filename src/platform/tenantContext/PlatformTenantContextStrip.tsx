import { useTenantContextBridge } from './useTenantContextBridge'

const VERDICT_TONE: Record<string, string> = {
  PASS: 'text-so-bid border-so-bid/40 bg-so-bid/10',
  WARN: 'text-so-warn border-so-warn/40 bg-so-warn/10',
  FAIL: 'text-so-ask border-so-ask/40 bg-so-ask/10',
}

export function PlatformTenantContextStrip() {
  const { enabled, ids, snapshot } = useTenantContextBridge()

  if (!enabled) return null

  return (
    <div
      className="hidden flex-wrap items-center gap-2 rounded-md border border-so-border/50 bg-so-bg/40 px-2 py-1 lg:flex"
      title="Tenant context bridge (mock)"
    >
      <span className="text-[8px] font-semibold uppercase text-so-muted">Tenant</span>
      <span className="font-mono text-[9px] text-so-fg" title="tenantId">
        {ids.tenantId}
      </span>
      <span className="text-so-muted">·</span>
      <span className="font-mono text-[9px] text-so-muted" title="companyId">
        co:{ids.companyId}
      </span>
      <span className="text-so-muted">·</span>
      <span className="font-mono text-[9px] text-so-muted" title="platformId">
        pf:{ids.platformId}
      </span>
      {snapshot ? (
        <span
          className={`rounded border px-1 py-0.5 text-[8px] font-bold uppercase ${VERDICT_TONE[snapshot.overall]}`}
          title={`Validated ${new Date(snapshot.validatedAt).toLocaleString()}`}
        >
          {snapshot.overall}
        </span>
      ) : null}
    </div>
  )
}
