import { useEffect, useRef } from 'react'
import {
  UNIFIED_EVENT_SOURCES,
  type UnifiedEventSeverity,
  type UnifiedEventSource,
} from './unifiedEventTypes'
import { isWorkspaceContextActive } from './workspaceContextStore'
import { logPlatformUnifiedFeedView } from './platformAudit'
import { usePlatformUnifiedEventFeed } from './usePlatformUnifiedEventFeed'
import { useWorkspaceContextRouter } from './useWorkspaceContextRouter'

const SEV_BADGE: Record<UnifiedEventSeverity, string> = {
  critical: 'border-so-ask/60 bg-so-ask/15 text-so-ask',
  warning: 'border-so-warn/50 bg-so-warn/12 text-so-warn',
  info: 'border-so-border/70 bg-so-surface/50 text-so-muted',
}

const SOURCE_LABEL: Record<UnifiedEventSource, string> = {
  oneai: 'OneAI',
  escrow: 'Escrow',
  diagnostics: 'Diag',
  streamhub: 'Stream',
  admin: 'Admin',
  tenant: 'Tenant',
}

const PREVIEW_COUNT = 3

export function PlatformUnifiedEventFeed() {
  const { events, summary } = usePlatformUnifiedEventFeed()
  const { enabled: routerOn, activeContext, activeEventId, navigate, navigateFromEvent } =
    useWorkspaceContextRouter()
  const loggedRef = useRef(false)

  useEffect(() => {
    if (loggedRef.current) return
    loggedRef.current = true
    logPlatformUnifiedFeedView(summary)
  }, [summary])

  const preview = events.slice(0, PREVIEW_COUNT)

  return (
    <div
      className="flex w-full min-w-[180px] max-w-[260px] flex-col gap-1 rounded-md border border-so-border/60 bg-so-bg/40 px-2 py-1.5"
      role="region"
      aria-label="Unified event feed"
    >
      <div className="flex flex-wrap items-center gap-1">
        <span className="rounded border border-amber-500/30 bg-amber-500/10 px-1 py-0.5 text-[8px] font-semibold uppercase text-amber-200/80">
          mockOnly
        </span>
        <span className="text-[9px] font-medium text-so-fg">{summary.total} events</span>
        {summary.critical > 0 ? (
          <span className={`rounded px-1 py-0.5 text-[8px] font-bold uppercase ${SEV_BADGE.critical}`}>
            {summary.critical} crit
          </span>
        ) : null}
        {UNIFIED_EVENT_SOURCES.map((src) =>
          summary.bySource[src] > 0 ? (
            routerOn ? (
              <button
                key={src}
                type="button"
                onClick={() => navigate(src)}
                className={`rounded px-1 py-0.5 text-[7px] uppercase transition-colors ${
                  activeContext === src && activeEventId == null
                    ? 'bg-so-bid/20 text-so-bid ring-1 ring-so-bid/40'
                    : 'bg-so-panel/80 text-so-muted hover:text-so-fg'
                }`}
                title={`${SOURCE_LABEL[src]}: ${summary.bySource[src]} · go to workspace panel`}
              >
                {src.slice(0, 4)}
                {summary.bySource[src]}
              </button>
            ) : (
              <span
                key={src}
                className="rounded bg-so-panel/80 px-1 py-0.5 text-[7px] uppercase text-so-muted"
                title={`${SOURCE_LABEL[src]}: ${summary.bySource[src]}`}
              >
                {src.slice(0, 4)}
                {summary.bySource[src]}
              </span>
            )
          ) : null,
        )}
      </div>
      <p className="truncate text-[8px] text-so-muted" title={summary.headline}>
        {summary.headline}
      </p>
      {preview.length > 0 ? (
        <ul className="space-y-0.5 border-t border-so-border/40 pt-1">
          {preview.map((e) => {
            const highlighted = routerOn && isWorkspaceContextActive(e.source, activeContext, activeEventId, e.id)
            const RowTag = routerOn ? 'button' : 'li'
            return (
              <RowTag
                key={e.id}
                type={routerOn ? 'button' : undefined}
                onClick={routerOn ? () => navigateFromEvent(e) : undefined}
                className={`flex w-full items-start gap-1 text-left text-[8px] leading-tight ${
                  highlighted
                    ? 'rounded bg-so-bid/10 ring-1 ring-so-bid/30'
                    : routerOn
                      ? 'rounded hover:bg-so-border/20'
                      : ''
                }`}
                title={routerOn ? `Open ${e.source} workspace context` : e.body}
              >
                <span
                  className={`mt-0.5 shrink-0 rounded px-0.5 text-[7px] font-bold uppercase ${SEV_BADGE[e.severity]}`}
                >
                  {e.severity.slice(0, 1)}
                </span>
                <span className="shrink-0 uppercase text-so-muted">{e.source}</span>
                <span className="min-w-0 truncate text-so-fg">{e.title}</span>
              </RowTag>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
