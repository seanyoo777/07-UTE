import { useMemo, useState } from 'react'
import { shouldEnableProposalAiSummary } from '../../config/layoutUiGuards'
import { useEffectiveLayoutFlags } from '../../hooks/useEffectiveLayoutFlags'
import { DEFAULT_PLATFORM_ID, buildPlatformDiagnosticsScope } from '../platformScope'
import { usePlatformTenantStore } from '../platformTenantStore'
import { PlatformMockOnlyBadge } from '../PlatformMockOnlyBadge'
import type { ProposalSnapshot, ProposalStatus } from './proposalQueueTypes'
import { useProposalQueueStore } from './proposalQueueStore'

const SEVERITY_CHIP: Record<string, string> = {
  info: 'border-so-border/50 bg-so-bg/40 text-so-muted',
  warning: 'border-so-warn/40 bg-so-warn/10 text-so-warn',
  critical: 'border-so-ask/50 bg-so-ask/15 text-so-ask',
}

const STATUS_PILL: Record<ProposalStatus, string> = {
  draft: 'border-so-border/50 text-so-muted',
  pending_review: 'border-so-accent/40 text-so-accent',
  approved: 'border-so-bid/40 text-so-bid',
  rejected: 'border-so-ask/40 text-so-ask',
  deferred: 'border-so-warn/30 text-so-warn',
}

function formatWhen(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ProposalRow({
  proposal,
  showAiSummary,
  onStatus,
}: {
  proposal: ProposalSnapshot
  showAiSummary: boolean
  onStatus: (p: ProposalSnapshot, status: ProposalStatus) => void
}) {
  const [noteDraft, setNoteDraft] = useState(proposal.operatorNote)
  const setOperatorNote = useProposalQueueStore((s) => s.setOperatorNote)

  return (
    <li
      className="rounded-md border border-so-border/50 bg-so-bg/50 p-2"
      data-testid={`proposal-queue-row-${proposal.id}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1">
            <span
              className={`rounded px-1.5 py-0.5 text-[8px] font-semibold uppercase ${SEVERITY_CHIP[proposal.severity]}`}
            >
              {proposal.severity}
            </span>
            <span
              className={`rounded border px-1.5 py-0.5 text-[8px] font-medium ${STATUS_PILL[proposal.status]}`}
            >
              {proposal.status.replace('_', ' ')}
            </span>
          </div>
          <p className="mt-1 text-[10px] font-semibold text-so-fg">
            {proposal.category} · {proposal.proposalType}
          </p>
          <p className="text-[9px] text-so-muted">
            {proposal.source} · {formatWhen(proposal.createdAt)}
          </p>
        </div>
      </div>
      {showAiSummary ? (
        <div className="mt-2 space-y-1 rounded border border-so-border/30 bg-so-panel/40 p-1.5 text-[9px]">
          <p className="text-so-muted">
            <span className="font-semibold text-so-fg">AI summary (mock): </span>
            {proposal.mockAiSummary}
          </p>
          <p className="text-so-muted">
            <span className="font-semibold text-so-fg">Impact (mock): </span>
            {proposal.mockImpactSummary}
          </p>
        </div>
      ) : null}
      {proposal.relatedIncidentIds.length > 0 ? (
        <p className="mt-1 font-mono text-[8px] text-so-muted">
          incidents={proposal.relatedIncidentIds.join(',')}
        </p>
      ) : null}
      {proposal.relatedGlobalDiagnosticsSnapshotId ? (
        <p className="font-mono text-[8px] text-so-muted">
          global={proposal.relatedGlobalDiagnosticsSnapshotId}
        </p>
      ) : null}
      <label className="mt-2 block text-[8px] text-so-muted">
        Operator note
        <input
          type="text"
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          onBlur={() => setOperatorNote(proposal.scope.scopeKey, proposal.id, noteDraft)}
          className="mt-0.5 w-full rounded border border-so-border/40 bg-so-bg/60 px-1.5 py-0.5 text-[9px] text-so-fg"
        />
      </label>
      <div className="mt-2 flex flex-wrap gap-1">
        <button
          type="button"
          disabled={proposal.status !== 'draft'}
          onClick={() => onStatus(proposal, 'pending_review')}
          className="rounded border border-so-accent/40 px-2 py-0.5 text-[8px] text-so-accent hover:bg-so-accent/10 disabled:opacity-40"
        >
          Submit review
        </button>
        <button
          type="button"
          disabled={proposal.status === 'approved'}
          onClick={() => onStatus(proposal, 'approved')}
          className="rounded border border-so-bid/40 px-2 py-0.5 text-[8px] text-so-bid hover:bg-so-bid/10 disabled:opacity-40"
        >
          Approve
        </button>
        <button
          type="button"
          disabled={proposal.status === 'rejected'}
          onClick={() => onStatus(proposal, 'rejected')}
          className="rounded border border-so-ask/40 px-2 py-0.5 text-[8px] text-so-ask hover:bg-so-ask/10 disabled:opacity-40"
        >
          Reject
        </button>
        <button
          type="button"
          disabled={proposal.status === 'deferred'}
          onClick={() => onStatus(proposal, 'deferred')}
          className="rounded border border-so-border/50 px-2 py-0.5 text-[8px] text-so-muted hover:bg-so-border/20 disabled:opacity-40"
        >
          Defer
        </button>
      </div>
    </li>
  )
}

/** AI Proposal Queue mock — status changes only, no autonomous execution. */
export function ProposalQueueBoard() {
  const tenant = usePlatformTenantStore((s) => s.tenant)
  const layoutFlags = useEffectiveLayoutFlags()
  const showAiSummary = shouldEnableProposalAiSummary(layoutFlags)
  const scope = useMemo(
    () => buildPlatformDiagnosticsScope(tenant.id, DEFAULT_PLATFORM_ID),
    [tenant.id],
  )
  const setStatus = useProposalQueueStore((s) => s.setStatus)
  const recent = useProposalQueueStore((s) => s.getRecent(scope.scopeKey, 8))

  const handleStatus = (proposal: ProposalSnapshot, status: ProposalStatus) => {
    setStatus(scope.scopeKey, proposal.id, status)
  }

  const draftCount = recent.filter((p) => p.status === 'draft').length

  return (
    <div
      className="rounded-lg border border-so-border/80 bg-so-surface/40"
      data-testid="proposal-queue-board"
      data-proposal-queue-draft-count={draftCount}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-so-border/60 px-3 py-2">
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-so-muted">
            AI Proposal Queue
          </h2>
          <p className="mt-0.5 text-[9px] text-so-muted">
            mock operations proposals · no autonomous execution · {scope.scopeKey}
          </p>
        </div>
        <PlatformMockOnlyBadge />
      </div>

      <div className="p-3">
        {recent.length === 0 ? (
          <p className="text-[10px] text-so-muted" data-testid="proposal-queue-empty">
            No proposals — create a draft from Incident Review or Global Diagnostics.
          </p>
        ) : (
          <ul className="space-y-2" data-testid="proposal-queue-list">
            {recent.map((proposal) => (
              <ProposalRow
                key={proposal.id}
                proposal={proposal}
                showAiSummary={showAiSummary}
                onStatus={handleStatus}
              />
            ))}
          </ul>
        )}
      </div>

      <p className="border-t border-so-border/60 px-3 py-2 text-center text-[9px] text-so-muted">
        Append-only audit · status-only · no API · no WebSocket · no auto-remediation
      </p>
    </div>
  )
}
