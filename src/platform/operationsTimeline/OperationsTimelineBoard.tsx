import { useEffect, useMemo, useRef } from 'react'
import { verdictDisplayLabel } from '@tetherget/diagnostics-ui'
import { useEffectiveLayoutFlags } from '../../hooks/useEffectiveLayoutFlags'
import { buildMockGlobalDiagnosticsBundle } from '../globalDiagnostics/buildMockGlobalDiagnostics'
import { useIncidentReviewStore } from '../incidentReview/incidentReviewStore'
import { useProposalQueueStore } from '../proposalQueue/proposalQueueStore'
import { DEFAULT_PLATFORM_ID, buildPlatformDiagnosticsScope } from '../platformScope'
import { usePlatformTenantStore } from '../platformTenantStore'
import { PlatformMockOnlyBadge } from '../PlatformMockOnlyBadge'
import { buildCrossAppRiskGraph } from '../riskGraph/buildCrossAppRiskGraph'
import { buildOperationsTimeline } from './buildOperationsTimeline'
import { logOperationsTimelineView } from './operationsTimelineAudit'
import type { OperationsTimelineEvent, TimelineEventKind } from './operationsTimelineTypes'

const VERDICT_TONE: Record<string, string> = {
  PASS: 'text-so-bid',
  WARN: 'text-so-warn',
  FAIL: 'text-so-ask',
}

const KIND_LABEL: Record<TimelineEventKind, string> = {
  diagnostics: 'Diagnostics',
  incident: 'Incident',
  proposal: 'Proposal',
  risk_graph: 'Risk',
}

type Props = {
  bridgeErrorCount?: number
}

function formatWhen(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function TimelineRow({ event }: { event: OperationsTimelineEvent }) {
  return (
    <li
      className="flex gap-2 border-l-2 border-so-border/50 pl-2"
      data-testid={`operations-timeline-row-${event.id}`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded bg-so-bg/80 px-1.5 py-0.5 text-[8px] font-semibold uppercase text-so-muted">
            {KIND_LABEL[event.kind]}
          </span>
          {event.verdict ? (
            <span className={`text-[8px] font-bold ${VERDICT_TONE[event.verdict]}`}>
              {verdictDisplayLabel(event.verdict)}
            </span>
          ) : null}
          <span className="text-[8px] text-so-muted">{formatWhen(event.at)}</span>
        </div>
        <p className="mt-0.5 text-[10px] font-medium text-so-fg">{event.label}</p>
        <p className="truncate text-[9px] text-so-muted" title={event.detail}>
          {event.detail}
        </p>
      </div>
    </li>
  )
}

/** Global operations timeline — mock chronological review. */
export function OperationsTimelineBoard({ bridgeErrorCount = 0 }: Props) {
  const tenant = usePlatformTenantStore((s) => s.tenant)
  const layoutFlags = useEffectiveLayoutFlags()
  const viewLoggedRef = useRef(false)

  const scope = useMemo(
    () => buildPlatformDiagnosticsScope(tenant.id, DEFAULT_PLATFORM_ID),
    [tenant.id],
  )

  const incidents = useIncidentReviewStore((s) => s.byScope[scope.scopeKey] ?? [])
  const proposals = useProposalQueueStore((s) => s.byScope[scope.scopeKey] ?? [])

  const timeline = useMemo(() => {
    const globalBundle = buildMockGlobalDiagnosticsBundle({
      scope,
      tenantDisplayName: tenant.displayName,
      companyId: tenant.companyId,
      bridgeErrorCount,
    })
    const riskGraph = buildCrossAppRiskGraph({
      scope,
      globalBundle,
      incidents,
      proposals,
    })
    return buildOperationsTimeline({
      scope,
      globalBundle,
      incidents,
      proposals,
      riskGraph,
    })
  }, [scope, tenant.companyId, tenant.displayName, bridgeErrorCount, incidents, proposals])

  useEffect(() => {
    if (viewLoggedRef.current) return
    viewLoggedRef.current = true
    logOperationsTimelineView(timeline)
  }, [timeline])

  const { passWarnFailCount } = timeline

  return (
    <div
      className="rounded-lg border border-so-border/80 bg-so-surface/40"
      data-testid="operations-timeline-board"
      data-operations-timeline-event-count={timeline.events.length}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-so-border/60 px-3 py-2">
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-so-muted">
            Global Operations Timeline
          </h2>
          <p className="mt-0.5 text-[9px] text-so-muted">
            mock chronological review · {scope.scopeKey} · generated{' '}
            {formatWhen(timeline.generatedAtMs)}
          </p>
        </div>
        <PlatformMockOnlyBadge />
      </div>

      <div className="space-y-3 p-3 text-xs">
        <div
          className="rounded-md border border-so-border/50 bg-so-bg/60 p-2"
          data-testid="operations-timeline-pass-warn-fail"
        >
          <p className="text-[10px] text-so-muted">PASS / WARN / FAIL (diagnostics map)</p>
          <p className="mt-1 font-mono text-[10px]">
            <span className={VERDICT_TONE.PASS}>PASS {passWarnFailCount.pass}</span>
            {' · '}
            <span className={VERDICT_TONE.WARN}>WARN {passWarnFailCount.warn}</span>
            {' · '}
            <span className={VERDICT_TONE.FAIL}>FAIL {passWarnFailCount.fail}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div
            className="rounded-md border border-so-border/40 bg-so-bg/40 p-2"
            data-testid="operations-timeline-proposal-pressure"
          >
            <p className="text-[10px] font-semibold text-so-muted">Proposal pressure</p>
            <p className="mt-0.5 font-mono text-[9px] text-so-fg">{timeline.proposalPressureSummary}</p>
            <p className="text-[8px] text-so-muted">{timeline.proposalMarkers.length} markers</p>
          </div>
          <div
            className="rounded-md border border-so-border/40 bg-so-bg/40 p-2"
            data-testid="operations-timeline-incident-trend"
          >
            <p className="text-[10px] font-semibold text-so-muted">Incident trend</p>
            <p className="mt-0.5 font-mono text-[9px] text-so-fg">{timeline.incidentTrendSummary}</p>
            <p className="text-[8px] text-so-muted">{timeline.incidentMarkers.length} markers</p>
          </div>
        </div>

        <p className="font-mono text-[8px] text-so-muted">
          diagnostics={timeline.diagnosticsMarkers.length} · risk=
          {timeline.riskGraphMarkers.length}
        </p>

        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-so-muted">
            Unified timeline
          </p>
          {timeline.events.length === 0 ? (
            <p className="text-[10px] text-so-muted" data-testid="operations-timeline-empty">
              No events — populate incident review, proposals, or open global diagnostics.
            </p>
          ) : (
            <ul className="space-y-2" data-testid="operations-timeline-list">
              {timeline.events.slice(0, 20).map((event) => (
                <TimelineRow key={event.id} event={event} />
              ))}
            </ul>
          )}
        </div>

        <p className="text-[9px] text-so-muted">layout={layoutFlags.layoutPreset}</p>
      </div>

      <p className="border-t border-so-border/60 px-3 py-2 text-center text-[9px] text-so-muted">
        No remediation · no API · no WebSocket · read-only timeline
      </p>
    </div>
  )
}
