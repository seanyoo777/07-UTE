import { useEffect, useMemo, useState } from 'react'
import { verdictDisplayLabel } from '@tetherget/diagnostics-ui'
import {
  shouldEnableIncidentAiSummary,
  shouldEnableProposalQueue,
} from '../../config/layoutUiGuards'
import { useEffectiveLayoutFlags } from '../../hooks/useEffectiveLayoutFlags'
import { DEFAULT_PLATFORM_ID, buildPlatformDiagnosticsScope } from '../platformScope'
import { usePlatformTenantStore } from '../platformTenantStore'
import type { UnifiedEvent } from '../unifiedEventTypes'
import { PlatformMockOnlyBadge } from '../PlatformMockOnlyBadge'
import { logIncidentMockResolved, logIncidentReviewed } from './incidentReviewAudit'
import { useProposalQueueStore } from '../proposalQueue/proposalQueueStore'
import { useIncidentReviewStore } from './incidentReviewStore'
import type { IncidentReviewSnapshot } from './incidentReviewTypes'

const VERDICT_TONE: Record<string, string> = {
  PASS: 'text-so-bid',
  WARN: 'text-so-warn',
  FAIL: 'text-so-ask',
}

const STATUS_LABEL: Record<string, string> = {
  open: 'Open',
  reviewed: 'Reviewed',
  mock_resolved: 'Mock resolved',
}

type Props = {
  /** Re-ingest session unified events when board mounts (idempotent upsert). */
  unifiedEvents?: UnifiedEvent[]
}

function formatWhen(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function IncidentRow({
  incident,
  showAiSummary,
  onReviewed,
  onMockResolved,
  onCreateProposal,
  showProposalAction,
}: {
  incident: IncidentReviewSnapshot
  showAiSummary: boolean
  onReviewed: (inc: IncidentReviewSnapshot) => void
  onMockResolved: (inc: IncidentReviewSnapshot) => void
  onCreateProposal: (inc: IncidentReviewSnapshot) => void
  showProposalAction: boolean
}) {
  const [noteDraft, setNoteDraft] = useState(incident.mockOperatorNote)
  const setOperatorNote = useIncidentReviewStore((s) => s.setOperatorNote)

  return (
    <li
      className="rounded-md border border-so-border/50 bg-so-bg/50 p-2"
      data-testid={`incident-review-row-${incident.id}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-so-fg">{incident.title}</p>
          <p className="text-[9px] text-so-muted">
            {incident.source} · {incident.severity} · {formatWhen(incident.createdAt)}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <span className={`text-[9px] font-bold ${VERDICT_TONE[incident.triageVerdict]}`}>
            {verdictDisplayLabel(incident.triageVerdict)}
          </span>
          <span className="text-[8px] text-so-muted">{STATUS_LABEL[incident.resolutionStatus]}</span>
        </div>
      </div>
      <p className="mt-1 truncate text-[9px] text-so-fg" title={incident.body}>
        {incident.body}
      </p>
      {incident.relatedDiagnosticsSnapshotId ? (
        <p className="mt-0.5 font-mono text-[8px] text-so-muted">
          diag={incident.relatedDiagnosticsSnapshotId}
        </p>
      ) : null}
      {incident.relatedGlobalDiagnosticsSnapshotId ? (
        <p className="mt-0.5 font-mono text-[8px] text-so-muted">
          global={incident.relatedGlobalDiagnosticsSnapshotId}
        </p>
      ) : null}
      {incident.relatedEventIds.length > 0 ? (
        <p className="mt-0.5 font-mono text-[8px] text-so-muted">
          events={incident.relatedEventIds.join(',')}
        </p>
      ) : null}
      {showAiSummary ? (
        <div className="mt-2 space-y-1 rounded border border-so-border/30 bg-so-panel/40 p-1.5 text-[9px]">
          <p className="text-so-muted">
            <span className="font-semibold text-so-fg">AI (mock): </span>
            {incident.mockAiRecommendation}
          </p>
          <p className="text-so-muted">
            <span className="font-semibold text-so-fg">Root cause (mock): </span>
            {incident.mockRootCauseSummary}
          </p>
        </div>
      ) : null}
      <label className="mt-2 block text-[8px] text-so-muted">
        Operator note (mock)
        <input
          type="text"
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          onBlur={() => setOperatorNote(incident.scope.scopeKey, incident.id, noteDraft)}
          className="mt-0.5 w-full rounded border border-so-border/40 bg-so-bg/60 px-1.5 py-0.5 text-[9px] text-so-fg"
        />
      </label>
      <div className="mt-2 flex flex-wrap gap-1">
        <button
          type="button"
          disabled={incident.resolutionStatus !== 'open'}
          onClick={() => onReviewed(incident)}
          className="rounded border border-so-border/50 px-2 py-0.5 text-[8px] text-so-fg hover:bg-so-border/20 disabled:opacity-40"
        >
          Mark reviewed
        </button>
        <button
          type="button"
          disabled={incident.resolutionStatus === 'mock_resolved'}
          onClick={() => onMockResolved(incident)}
          className="rounded border border-so-warn/40 px-2 py-0.5 text-[8px] text-so-warn hover:bg-so-warn/10 disabled:opacity-40"
        >
          Mock resolve
        </button>
        {showProposalAction ? (
          <button
            type="button"
            onClick={() => onCreateProposal(incident)}
            className="rounded border border-so-accent/30 px-2 py-0.5 text-[8px] text-so-accent hover:bg-so-accent/10"
            data-testid={`incident-create-proposal-${incident.id}`}
          >
            Create proposal draft
          </button>
        ) : null}
      </div>
    </li>
  )
}

/**
 * AI Incident Review mock board — triage only, no auto-remediation.
 */
export function IncidentReviewBoard({ unifiedEvents }: Props) {
  const tenant = usePlatformTenantStore((s) => s.tenant)
  const layoutFlags = useEffectiveLayoutFlags()
  const showAiSummary = shouldEnableIncidentAiSummary(layoutFlags)
  const showProposalAction = shouldEnableProposalQueue(layoutFlags)
  const createDraftFromIncident = useProposalQueueStore((s) => s.createDraftFromIncident)
  const scope = useMemo(
    () => buildPlatformDiagnosticsScope(tenant.id, DEFAULT_PLATFORM_ID),
    [tenant.id],
  )
  const ingestFromUnifiedEvent = useIncidentReviewStore((s) => s.ingestFromUnifiedEvent)
  const setResolution = useIncidentReviewStore((s) => s.setResolution)
  const recent = useIncidentReviewStore((s) => s.getRecent(scope.scopeKey, 8))

  useEffect(() => {
    if (!unifiedEvents?.length) return
    for (const event of unifiedEvents) {
      ingestFromUnifiedEvent(event, scope)
    }
  }, [unifiedEvents, ingestFromUnifiedEvent, scope])

  const handleReviewed = (incident: IncidentReviewSnapshot) => {
    setResolution(scope.scopeKey, incident.id, 'reviewed')
    logIncidentReviewed({ ...incident, resolutionStatus: 'reviewed' })
  }

  const handleMockResolved = (incident: IncidentReviewSnapshot) => {
    setResolution(scope.scopeKey, incident.id, 'mock_resolved')
    logIncidentMockResolved({ ...incident, resolutionStatus: 'mock_resolved' })
  }

  const openCount = recent.filter((i) => i.resolutionStatus === 'open').length

  return (
    <div
      className="rounded-lg border border-so-border/80 bg-so-surface/40"
      data-testid="incident-review-board"
      data-incident-review-open-count={openCount}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-so-border/60 px-3 py-2">
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-so-muted">
            AI Incident Review
          </h2>
          <p className="mt-0.5 text-[9px] text-so-muted">
            mock triage · no auto-remediation · scope {scope.scopeKey}
          </p>
        </div>
        <PlatformMockOnlyBadge />
      </div>

      <div className="p-3">
        {recent.length === 0 ? (
          <p className="text-[10px] text-so-muted" data-testid="incident-review-empty">
            No incidents yet — open diagnostics or unified feed to populate mock incidents.
          </p>
        ) : (
          <ul className="space-y-2" data-testid="incident-review-list">
            {recent.map((incident) => (
              <IncidentRow
                key={incident.id}
                incident={incident}
                showAiSummary={showAiSummary}
                onReviewed={handleReviewed}
                onMockResolved={handleMockResolved}
                onCreateProposal={(inc) => {
                  createDraftFromIncident(inc)
                }}
                showProposalAction={showProposalAction}
              />
            ))}
          </ul>
        )}
      </div>

      <p className="border-t border-so-border/60 px-3 py-2 text-center text-[9px] text-so-muted">
        Append-only audit · no WebSocket · no external API · no automated fixes
      </p>
    </div>
  )
}
