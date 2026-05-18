import { useEffect, useMemo, useRef } from 'react'
import { verdictDisplayLabel } from '@tetherget/diagnostics-ui'
import { useAppNavigation } from '../appNavigation'
import { runUteSelfTestSuite } from '../admin/selfTest/runUteSelfTestSuite'
import { buildUteSelfTestCoreBundle } from '../admin/selfTest/uteSelfTestCoreAdapter'
import { useBridgeDashboardStore } from '../bridges'
import { useEffectiveLayoutFlags } from '../hooks/useEffectiveLayoutFlags'
import { countBridgeDashboardErrors } from './countBridgeErrors'
import {
  logPlatformDiagnosticsOpen,
  logPlatformDiagnosticsSnapshot,
  logPlatformDiagnosticsUiView,
} from './platformAudit'
import { usePlatformDiagnosticsStore } from './platformDiagnosticsStore'
import { useUnifiedEventStore } from './unifiedEventStore'
import { recordPlatformDiagnosticsSnapshot } from './recordPlatformDiagnosticsSnapshot'
import { PlatformMockOnlyBadge } from './PlatformMockOnlyBadge'
import { usePlatformDiagnosticsScope } from './usePlatformDiagnosticsScope'
import { DiagnosticsTenantValidationSection } from './tenantContext/DiagnosticsTenantValidationSection'
import { buildUteDiagnosticsPanelViewModel } from './diagnostics/diagnosticsUiAdapter'
import { DiagnosticsUiRowsList } from './diagnostics/DiagnosticsUiRowsList'
import { WhitelabelDiagnosticsSection } from '../whitelabel/WhitelabelDiagnosticsSection'

type Props = {
  onClose: () => void
}

const VERDICT_TONE: Record<string, string> = {
  PASS: 'text-so-bid',
  WARN: 'text-so-warn',
  FAIL: 'text-so-ask',
}

function formatAsOf(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

/**
 * Diagnostics entry panel — mock health snapshot, scoped by tenant/platform.
 */
export function PlatformDiagnosticsPanel({ onClose }: Props) {
  const goAdmin = useAppNavigation((s) => s.goAdmin)
  const snapshots = useBridgeDashboardStore((s) => s.snapshots)
  const layoutFlags = useEffectiveLayoutFlags()
  const scope = usePlatformDiagnosticsScope()
  const record = usePlatformDiagnosticsStore((s) => s.record)
  const appendFromDiagnostics = useUnifiedEventStore((s) => s.appendFromDiagnostics)
  const recent = usePlatformDiagnosticsStore(
    (s) => s.byScope[scope.scopeKey]?.slice(0, 3) ?? [],
  )
  const bridgeErrorCount = countBridgeDashboardErrors(snapshots)
  const openedRef = useRef(false)
  const uiViewLoggedRef = useRef(false)

  const { legacy: report, core, diagnosticsUi } = useMemo(() => {
    const legacy = runUteSelfTestSuite({ bridgeErrorCount })
    const bundle = buildUteSelfTestCoreBundle(legacy)
    const diagnosticsUi = buildUteDiagnosticsPanelViewModel(bundle)
    return { legacy, core: bundle.core, diagnosticsUi }
  }, [bridgeErrorCount])

  const header = diagnosticsUi.header

  useEffect(() => {
    if (openedRef.current) return
    openedRef.current = true
    logPlatformDiagnosticsOpen(scope)
    const snap = recordPlatformDiagnosticsSnapshot(scope, report)
    record(snap)
    appendFromDiagnostics(scope, snap)
    logPlatformDiagnosticsSnapshot(scope, snap.overall)
  }, [scope, report, record, appendFromDiagnostics])

  useEffect(() => {
    if (uiViewLoggedRef.current) return
    uiViewLoggedRef.current = true
    logPlatformDiagnosticsUiView(scope.scopeKey, header.overall)
  }, [header.overall, scope.scopeKey])

  const latestRecorded = recent[0]

  return (
    <aside
      className="flex w-full max-w-sm shrink-0 flex-col border-l border-so-border/80 bg-so-panel/95 shadow-xl"
      aria-label="Platform diagnostics"
      data-testid="platform-diagnostics-panel"
      data-ute-self-test-core-overall={core.overall}
      data-ute-self-test-core-mock-only={core.mockOnly ? 'true' : 'false'}
      data-diagnostics-ui-overall={header.overall}
      data-diagnostics-ui-mock-only={header.mockOnly ? 'true' : 'false'}
    >
      <div className="flex items-center justify-between gap-2 border-b border-so-border/60 px-3 py-2">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-so-muted">Diagnostics</p>
          <p className="truncate text-xs text-so-fg">Mock health entry</p>
        </div>
        <div className="flex items-center gap-1.5">
          <PlatformMockOnlyBadge />
          <button
            type="button"
            onClick={onClose}
            className="rounded px-2 py-1 text-[10px] text-so-muted hover:bg-so-border/30 hover:text-so-fg"
          >
            Close
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3 text-xs">
        <div className="rounded-md border border-so-border/50 bg-so-bg/60 p-2 font-mono text-[9px] text-so-muted">
          <p>
            <span className="text-so-fg">scope</span> {scope.scopeKey}
          </p>
          <p>platformId={scope.platformId}</p>
          <p>tenantId={scope.tenantId}</p>
        </div>

        <DiagnosticsTenantValidationSection />

        <WhitelabelDiagnosticsSection />

        <div
          className="rounded-md border border-so-border/50 bg-so-bg/60 p-2"
          data-testid="diagnostics-ui-header"
        >
          <p className="text-[10px] text-so-muted">Current self-test (live run)</p>
          <p className="mt-1 font-mono text-[11px]">{diagnosticsUi.issueCountLabel}</p>
          <p className="mt-1 text-[10px] text-so-muted">
            Overall:{' '}
            <span className={VERDICT_TONE[header.overall]}>
              {verdictDisplayLabel(header.overall)}
            </span>
            {latestRecorded ? ` · recorded ${formatAsOf(latestRecorded.asOf)}` : null}
            {' · '}
            <span title={String(header.lastCheckedAtMs)}>{diagnosticsUi.lastCheckedLabel}</span>
          </p>
        </div>

        {recent.length > 0 ? (
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-so-muted">
              Recent results ({scope.platformId})
            </p>
            <ul className="space-y-1.5">
              {recent.map((snap) => (
                <li
                  key={snap.id}
                  className="rounded border border-so-border/40 bg-so-bg/40 px-2 py-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] text-so-muted">{formatAsOf(snap.asOf)}</span>
                    <span className={`text-[9px] font-semibold ${VERDICT_TONE[snap.overall]}`}>
                      {snap.overall}
                    </span>
                  </div>
                  <p className="mt-0.5 font-mono text-[9px] text-so-muted">
                    P{snap.issueCount.pass} W{snap.issueCount.warn} F{snap.issueCount.fail}
                  </p>
                  {snap.highlights[0] ? (
                    <p className="mt-0.5 truncate text-[9px] text-so-fg" title={snap.highlights.join(' · ')}>
                      {snap.highlights[0]}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div
          data-diagnostics-ui-suite-count={diagnosticsUi.suiteRows.length}
          data-testid={`diagnostics-ui-suite-row-${diagnosticsUi.suiteRows[0]?.id ?? 'none'}`}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wide text-so-muted">Top checks</p>
          <DiagnosticsUiRowsList rows={diagnosticsUi.topCheckRows} testIdPrefix="diagnostics-ui-row" />
        </div>

        <div className="rounded-md border border-so-border/50 bg-so-bg/60 p-2 text-[10px] text-so-muted">
          <p>Layout: {layoutFlags.layoutPreset}</p>
          <p>readOnly={String(layoutFlags.readOnly)} emergency={String(layoutFlags.emergencyDisable)}</p>
          <p>Bridge errors (mock): {bridgeErrorCount}</p>
        </div>
      </div>

      <div className="border-t border-so-border/60 p-3">
        <button
          type="button"
          onClick={() => {
            onClose()
            goAdmin()
          }}
          className="w-full rounded-md border border-so-border/60 bg-so-bg/80 py-2 text-[11px] font-medium text-so-fg hover:bg-so-border/20"
        >
          Open Self-Test Center (Admin)
        </button>
        <p className="mt-2 text-center text-[9px] text-so-muted">No live API · mock probes only</p>
      </div>
    </aside>
  )
}
