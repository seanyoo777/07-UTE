import { useEffect, useMemo, useRef } from 'react'
import { verdictDisplayLabel } from '@tetherget/diagnostics-ui'
import { useEffectiveLayoutFlags } from '../../hooks/useEffectiveLayoutFlags'
import { buildMockGlobalDiagnosticsBundle } from '../globalDiagnostics/buildMockGlobalDiagnostics'
import { useIncidentReviewStore } from '../incidentReview/incidentReviewStore'
import { useProposalQueueStore } from '../proposalQueue/proposalQueueStore'
import { DEFAULT_PLATFORM_ID, buildPlatformDiagnosticsScope } from '../platformScope'
import { usePlatformTenantStore } from '../platformTenantStore'
import { PlatformMockOnlyBadge } from '../PlatformMockOnlyBadge'
import { buildCrossAppRiskGraph } from './buildCrossAppRiskGraph'
import { logRiskGraphView } from './riskGraphAudit'
import type { CrossAppRiskSnapshot, RiskTrend } from './riskGraphTypes'

const VERDICT_TONE: Record<string, string> = {
  PASS: 'text-so-bid',
  WARN: 'text-so-warn',
  FAIL: 'text-so-ask',
}

const SEVERITY_CHIP: Record<string, string> = {
  info: 'border-so-border/50 text-so-muted',
  warning: 'border-so-warn/40 text-so-warn',
  critical: 'border-so-ask/50 text-so-ask',
}

const TREND_LABEL: Record<RiskTrend, string> = {
  up: '↑ rising',
  down: '↓ easing',
  stable: '→ stable',
}

const PRESSURE_TONE: Record<string, string> = {
  low: 'text-so-bid',
  medium: 'text-so-warn',
  high: 'text-so-ask',
}

type Props = {
  bridgeErrorCount?: number
}

function AppRiskCard({ app }: { app: CrossAppRiskSnapshot }) {
  return (
    <li
      className="rounded-md border border-so-border/50 bg-so-bg/50 p-2"
      data-testid={`risk-graph-app-${app.appId}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold text-so-fg">{app.appLabel}</p>
          <p className="font-mono text-[9px] text-so-muted">{app.appId}</p>
        </div>
        <div className="text-right">
          <span
            className={`rounded border px-1.5 py-0.5 text-[8px] font-semibold uppercase ${SEVERITY_CHIP[app.severity]}`}
          >
            {app.severity}
          </span>
          <p className="mt-0.5 font-mono text-[10px] text-so-fg">{app.riskScoreMock}</p>
        </div>
      </div>
      <p className={`mt-1 text-[9px] ${VERDICT_TONE[app.diagnosticsHealth]}`}>
        Health {verdictDisplayLabel(app.diagnosticsHealth)} · {TREND_LABEL[app.trend]}
      </p>
      <p className="mt-0.5 font-mono text-[8px] text-so-muted">
        issues={app.activeIssues} · incident{' '}
        <span className={PRESSURE_TONE[app.incidentPressure]}>{app.incidentPressure}</span> · proposal{' '}
        <span className={PRESSURE_TONE[app.proposalPressure]}>{app.proposalPressure}</span>
      </p>
    </li>
  )
}

/** Cross-app mock risk graph — derived from diagnostics, incidents, proposals. */
export function CrossAppRiskGraphBoard({ bridgeErrorCount = 0 }: Props) {
  const tenant = usePlatformTenantStore((s) => s.tenant)
  const layoutFlags = useEffectiveLayoutFlags()
  const viewLoggedRef = useRef(false)

  const scope = useMemo(
    () => buildPlatformDiagnosticsScope(tenant.id, DEFAULT_PLATFORM_ID),
    [tenant.id],
  )

  const incidents = useIncidentReviewStore((s) => s.byScope[scope.scopeKey] ?? [])
  const proposals = useProposalQueueStore((s) => s.byScope[scope.scopeKey] ?? [])

  const graph = useMemo(() => {
    const globalBundle = buildMockGlobalDiagnosticsBundle({
      scope,
      tenantDisplayName: tenant.displayName,
      companyId: tenant.companyId,
      bridgeErrorCount,
    })
    return buildCrossAppRiskGraph({
      scope,
      globalBundle,
      incidents,
      proposals,
    })
  }, [scope, tenant.companyId, tenant.displayName, bridgeErrorCount, incidents, proposals])

  useEffect(() => {
    if (viewLoggedRef.current) return
    viewLoggedRef.current = true
    logRiskGraphView(graph)
  }, [graph])

  const { passWarnFailMap, proposalPressureSummary, incidentTrendSummary } = graph

  return (
    <div
      className="rounded-lg border border-so-border/80 bg-so-surface/40"
      data-testid="cross-app-risk-graph-board"
      data-risk-graph-overall={graph.overallVerdict}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-so-border/60 px-3 py-2">
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-so-muted">
            Cross-App Risk Graph
          </h2>
          <p className="mt-0.5 text-[9px] text-so-muted">
            mock risk map · no monitoring transport · {scope.scopeKey}
          </p>
        </div>
        <PlatformMockOnlyBadge />
      </div>

      <div className="space-y-3 p-3 text-xs">
        <div
          className="rounded-md border border-so-border/50 bg-so-bg/60 p-2"
          data-testid="risk-graph-pass-warn-fail-map"
        >
          <p className="text-[10px] text-so-muted">PASS / WARN / FAIL map (diagnostics health)</p>
          <p className="mt-1 font-mono text-[11px]">
            <span className={VERDICT_TONE.PASS}>PASS {passWarnFailMap.pass}</span>
            {' · '}
            <span className={VERDICT_TONE.WARN}>WARN {passWarnFailMap.warn}</span>
            {' · '}
            <span className={VERDICT_TONE.FAIL}>FAIL {passWarnFailMap.fail}</span>
            {' · overall '}
            <span className={VERDICT_TONE[graph.overallVerdict]}>
              {verdictDisplayLabel(graph.overallVerdict)}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div
            className="rounded-md border border-so-border/40 bg-so-bg/40 p-2"
            data-testid="risk-graph-proposal-pressure"
          >
            <p className="text-[10px] font-semibold text-so-muted">Proposal pressure</p>
            <p className="mt-1 font-mono text-[9px] text-so-fg">
              draft {proposalPressureSummary.draft} · pending{' '}
              {proposalPressureSummary.pendingReview} · approved {proposalPressureSummary.approved}
            </p>
            <p className="text-[8px] text-so-muted">refs: {graph.relatedProposalIds.length} proposals</p>
          </div>
          <div
            className="rounded-md border border-so-border/40 bg-so-bg/40 p-2"
            data-testid="risk-graph-incident-trend"
          >
            <p className="text-[10px] font-semibold text-so-muted">Incident trend</p>
            <p className="mt-1 font-mono text-[9px] text-so-fg">
              open {incidentTrendSummary.open} · critical {incidentTrendSummary.critical} · warn{' '}
              {incidentTrendSummary.warning}
            </p>
            <p className="text-[8px] text-so-muted">refs: {graph.relatedIncidentIds.length} incidents</p>
          </div>
        </div>

        {graph.relatedGlobalDiagnosticsId ? (
          <p className="font-mono text-[8px] text-so-muted">
            global diagnostics={graph.relatedGlobalDiagnosticsId}
          </p>
        ) : null}

        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-so-muted">
            App risk cards
          </p>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {graph.apps.map((app) => (
              <AppRiskCard key={app.appId} app={app} />
            ))}
          </ul>
        </div>

        <p className="text-[9px] text-so-muted">layout={layoutFlags.layoutPreset} · derived mock only</p>
      </div>

      <p className="border-t border-so-border/60 px-3 py-2 text-center text-[9px] text-so-muted">
        No monitoring API · no WebSocket · integrates incident + proposal + global diagnostics
      </p>
    </div>
  )
}
