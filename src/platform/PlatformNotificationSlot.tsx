import { useEffect, useRef } from 'react'
import type { PlatformNotificationSummary } from './summarizePlatformNotifications'
import { logPlatformNotificationView } from './platformAudit'
import { usePlatformMockNotificationFeed } from './usePlatformMockNotificationFeed'

const SEV_DOT: Record<PlatformNotificationSummary['topSeverity'], string> = {
  critical: 'bg-so-ask',
  warning: 'bg-so-warn',
  info: 'bg-so-bid/80',
  none: 'bg-so-muted/50',
}

type Props = {
  summary?: PlatformNotificationSummary
}

/**
 * Mock notification summary — bridge/health snapshot, no push/WebSocket.
 */
export function PlatformNotificationSlot({ summary: summaryOverride }: Props) {
  const feed = usePlatformMockNotificationFeed()
  const summary = summaryOverride ?? feed.summary
  const loggedRef = useRef(false)

  useEffect(() => {
    if (loggedRef.current) return
    loggedRef.current = true
    logPlatformNotificationView(summary)
  }, [summary])

  return (
    <div
      className="flex min-w-[140px] max-w-[220px] items-center gap-1.5 rounded-md border border-so-border/60 bg-so-bg/50 px-2 py-1"
      title={`${summary.total} mock alerts · ${summary.headline}`}
      role="status"
      aria-label={`Notifications: ${summary.headline}`}
    >
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${SEV_DOT[summary.topSeverity]}`}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[9px] font-medium text-so-fg">
          {summary.unread > 0 ? `${summary.unread} unread` : `${summary.total} alerts`}
          {summary.critical > 0 ? ` · ${summary.critical} crit` : null}
        </p>
        <p className="truncate text-[8px] text-so-muted">{summary.headline}</p>
      </div>
    </div>
  )
}
