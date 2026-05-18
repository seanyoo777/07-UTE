import { useTenantContextBridge } from './useTenantContextBridge'
import { TenantValidationSnapshotViewer } from './TenantValidationSnapshotViewer'

const VERDICT_TONE: Record<string, string> = {
  PASS: 'text-so-bid',
  WARN: 'text-so-warn',
  FAIL: 'text-so-ask',
}

export function DiagnosticsTenantValidationSection() {
  const { enabled, snapshot, scopeMismatch, ids } = useTenantContextBridge()

  if (!enabled || !snapshot) return null

  return (
    <section className="space-y-2" aria-label="Tenant config validation">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-so-muted">
        12-TGX-TokenAdmin · Tenant validation (read-only)
      </p>
      <div className="rounded-md border border-violet-500/30 bg-violet-500/5 p-2 text-[9px] text-so-muted">
        mockOnly · no server · snapshot from localStorage/in-memory
      </div>
      <p className="font-mono text-[9px] text-so-muted">
        workspace scope: {ids.scopeKey}
        {scopeMismatch ? (
          <span className="ml-1 text-so-ask">· MISMATCH</span>
        ) : (
          <span className="ml-1 text-so-bid">· aligned</span>
        )}
      </p>
      {scopeMismatch ? (
        <div className="rounded border border-so-ask/50 bg-so-ask/10 p-2 text-[10px] text-so-ask">
          <p className="font-semibold">Scope mismatch diagnostic</p>
          <p className="mt-0.5">{scopeMismatch.message}</p>
          <p className="mt-1 font-mono text-[9px]">
            workspace={scopeMismatch.workspaceScopeKey} expected={scopeMismatch.expectedScopeKey}
          </p>
        </div>
      ) : null}
      <p className="text-[10px] text-so-muted">
        Overall:{' '}
        <span className={`font-semibold ${VERDICT_TONE[snapshot.overall]}`}>
          {snapshot.overall}
        </span>
        {' · '}
        Last validation:{' '}
        {new Date(snapshot.validatedAt).toLocaleString(undefined, {
          dateStyle: 'short',
          timeStyle: 'medium',
        })}
      </p>
      <TenantValidationSnapshotViewer snapshot={snapshot} />
    </section>
  )
}
