import { useEffect, useMemo, useRef } from 'react'
import { verdictDisplayLabel } from '@tetherget/diagnostics-ui'
import { useEffectiveLayoutFlags } from '../../hooks/useEffectiveLayoutFlags'
import { DEFAULT_PLATFORM_ID, buildPlatformDiagnosticsScope } from '../platformScope'
import { usePlatformTenantStore } from '../platformTenantStore'
import { PlatformMockOnlyBadge } from '../PlatformMockOnlyBadge'
import {
  buildGlobalDiagnosticsSnapshotFromBundle,
  buildMockGlobalDiagnosticsBundle,
} from './buildMockGlobalDiagnostics'
import { buildGlobalDiagnosticsCenterViewModel } from './globalDiagnosticsUiAdapter'
import {
  logGlobalDiagnosticsSnapshot,
  logGlobalDiagnosticsView,
} from './globalDiagnosticsAudit'
import { shouldEnableProposalQueue } from '../../config/layoutUiGuards'
import { useIncidentReviewStore } from '../incidentReview/incidentReviewStore'
import { useProposalQueueStore } from '../proposalQueue/proposalQueueStore'
import { useGlobalDiagnosticsStore } from './globalDiagnosticsStore'
import type { GlobalDiagnosticsSourceCard } from './globalDiagnosticsTypes'

const VERDICT_TONE: Record<string, string> = {
  PASS: 'text-so-bid',
  WARN: 'text-so-warn',
  FAIL: 'text-so-ask',
}

type Props = {
  bridgeErrorCount?: number
}

function formatAsOf(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function SourceCard({ card }: { card: GlobalDiagnosticsSourceCard }) {
  return (
    <li
      className="rounded-md border border-so-border/50 bg-so-bg/50 p-2"
      data-testid={`global-diagnostics-source-${card.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-so-fg">{card.appLabel}</p>
          <p className="truncate text-[9px] text-so-muted">{card.productName}</p>
        </div>
        <span className={`shrink-0 text-[9px] font-bold ${VERDICT_TONE[card.overall]}`}>
          {card.overall}
        </span>
      </div>
      <p className="mt-1 font-mono text-[9px] text-so-muted">
        P{card.pass} W{card.warn} F{card.fail}
      </p>
      <p className="mt-0.5 truncate text-[9px] text-so-fg" title={card.headline}>
        {card.headline}
      </p>
    </li>
  )
}

/**
 * Cross-app mock diagnostics draft — aggregated PASS/WARN/FAIL, no transport.
 */
export function GlobalDiagnosticsCenterPanel({ bridgeErrorCount = 0 }: Props) {
  const tenant = usePlatformTenantStore((s) => s.tenant)
  const layoutFlags = useEffectiveLayoutFlags()
  const record = useGlobalDiagnosticsStore((s) => s.record)
  const viewLoggedRef = useRef(false)
  const snapshotLoggedRef = useRef(false)

  const scope = useMemo(
    () => buildPlatformDiagnosticsScope(tenant.id, DEFAULT_PLATFORM_ID),
    [tenant.id],
  )

  const bundle = useMemo(
    () =>
      buildMockGlobalDiagnosticsBundle({
        scope,
        tenantDisplayName: tenant.displayName,
        companyId: tenant.companyId,
        bridgeErrorCount,
      }),
    [scope, tenant.companyId, tenant.displayName, bridgeErrorCount],
  )

  const vm = useMemo(() => buildGlobalDiagnosticsCenterViewModel(bundle), [bundle])
  const header = vm.header

  const recent = useGlobalDiagnosticsStore(
    (s) => s.byScope[scope.scopeKey]?.slice(0, 3) ?? [],
  )

  const ingestGlobalIncident = useIncidentReviewStore((s) => s.ingestFromGlobalDiagnostics)
  const createDraftFromGlobal = useProposalQueueStore((s) => s.createDraftFromGlobalDiagnostics)
  const showProposalAction = shouldEnableProposalQueue(layoutFlags)
  const latestSnap = useMemo(
    () => buildGlobalDiagnosticsSnapshotFromBundle(bundle),
    [bundle],
  )

  useEffect(() => {
    const snap = latestSnap
    record(snap)
    ingestGlobalIncident(snap)
    if (!snapshotLoggedRef.current) {
      snapshotLoggedRef.current = true
      logGlobalDiagnosticsSnapshot(scope, snap.overall)
    }
  }, [latestSnap, ingestGlobalIncident, record, scope])

  useEffect(() => {
    if (viewLoggedRef.current) return
    viewLoggedRef.current = true
    logGlobalDiagnosticsView(scope, header.overall)
  }, [header.overall, scope])

  const crossAppSummary = useMemo(() => {
    let pass = 0
    let warn = 0
    let fail = 0
    for (const c of bundle.sourceCards) {
      if (c.overall === 'FAIL') fail += 1
      else if (c.overall === 'WARN') warn += 1
      else pass += 1
    }
    return { pass, warn, fail }
  }, [bundle.sourceCards])

  return (
    <div
      className="rounded-lg border border-so-border/80 bg-so-surface/40"
      data-testid="global-diagnostics-center-panel"
      data-global-diagnostics-overall={header.overall}
      data-global-diagnostics-mock-only={header.mockOnly ? 'true' : 'false'}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-so-border/60 px-3 py-2">
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-so-muted">
            Global Diagnostics Center
          </h2>
          <p className="mt-0.5 text-[9px] text-so-muted">
            cross-app mock · no transport · {bundle.sourceCards.length} sources
          </p>
        </div>
        <PlatformMockOnlyBadge />
      </div>

      <div className="space-y-3 p-3 text-xs">
        <div
          className="rounded-md border border-so-border/50 bg-so-bg/60 p-2 font-mono text-[9px] text-so-muted"
          data-testid="global-diagnostics-tenant-summary"
        >
          <p>
            <span className="text-so-fg">tenant</span> {tenant.displayName}
          </p>
          <p>companyId={tenant.companyId}</p>
          <p>platformId={scope.platformId} · scopeKey={scope.scopeKey}</p>
          <p>layout={layoutFlags.layoutPreset}</p>
        </div>

        <div
          className="rounded-md border border-so-border/50 bg-so-bg/60 p-2"
          data-testid="global-diagnostics-ui-header"
        >
          <p className="text-[10px] text-so-muted">Aggregated cross-app (diagnostics-ui)</p>
          <p className="mt-1 font-mono text-[11px]">{vm.issueCountLabel}</p>
          <p className="mt-1 text-[10px] text-so-muted">
            Overall:{' '}
            <span className={VERDICT_TONE[header.overall]}>
              {verdictDisplayLabel(header.overall)}
            </span>
            {' · '}
            <span title={String(header.lastCheckedAtMs)}>{vm.lastCheckedLabel}</span>
          </p>
          <p className="mt-1 font-mono text-[9px] text-so-muted">
            Apps PASS {crossAppSummary.pass} · WARN {crossAppSummary.warn} · FAIL{' '}
            {crossAppSummary.fail}
          </p>
          {showProposalAction && latestSnap.overall !== 'PASS' ? (
            <button
              type="button"
              onClick={() => createDraftFromGlobal(latestSnap)}
              className="mt-2 rounded border border-so-accent/30 px-2 py-1 text-[9px] text-so-accent hover:bg-so-accent/10"
              data-testid="global-diagnostics-create-proposal"
            >
              Create proposal draft (global snapshot)
            </button>
          ) : null}
        </div>

        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-so-muted">
            Source cards
          </p>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {bundle.sourceCards.map((card) => (
              <SourceCard key={card.id} card={card} />
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-so-muted">
            Suite rows (diagnostics-ui)
          </p>
          <ul className="space-y-1">
            {vm.sourceRows.map((row) => (
              <li
                key={row.id}
                data-testid={`global-diagnostics-ui-row-${row.id}`}
                className="flex items-center justify-between gap-2 rounded border border-so-border/40 bg-so-bg/40 px-2 py-1"
              >
                <span className="truncate text-[10px] text-so-fg">{row.label}</span>
                <span className={`text-[9px] font-semibold ${VERDICT_TONE[row.status]}`}>
                  {verdictDisplayLabel(row.status)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {recent.length > 0 ? (
          <div data-testid="global-diagnostics-latest-snapshots">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-so-muted">
              Latest mock snapshots
            </p>
            <ul className="space-y-1.5">
              {recent.map((snap) => (
                <li
                  key={snap.id}
                  className="rounded border border-so-border/40 bg-so-bg/40 px-2 py-1.5"
                  data-testid={`global-diagnostics-snapshot-${snap.id}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] text-so-muted">{formatAsOf(snap.asOf)}</span>
                    <span className={`text-[9px] font-bold ${VERDICT_TONE[snap.overall]}`}>
                      {snap.overall}
                    </span>
                  </div>
                  <p className="mt-0.5 font-mono text-[9px] text-so-muted">
                    apps P{snap.issueCount.pass} W{snap.issueCount.warn} F{snap.issueCount.fail}
                  </p>
                  {snap.highlights[0] ? (
                    <p className="mt-0.5 truncate text-[9px] text-so-fg">{snap.highlights.join(' · ')}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <p className="border-t border-so-border/60 px-3 py-2 text-center text-[9px] text-so-muted">
        In-memory / session mock only · no WebSocket · no cross-app API
      </p>
    </div>
  )
}
