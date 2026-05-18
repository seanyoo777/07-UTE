import {
  UNIFIED_EVENT_SOURCES,
  type UnifiedEvent,
  type UnifiedEventSeverity,
  type UnifiedEventSource,
  type UnifiedEventSummary,
} from './unifiedEventTypes'

const SEV_RANK: Record<UnifiedEventSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
}

export function summarizeUnifiedEvents(events: UnifiedEvent[]): UnifiedEventSummary {
  const bySource = Object.fromEntries(
    UNIFIED_EVENT_SOURCES.map((s) => [s, 0]),
  ) as Record<UnifiedEventSource, number>

  if (events.length === 0) {
    return {
      total: 0,
      critical: 0,
      warning: 0,
      info: 0,
      topSeverity: 'none',
      bySource,
      headline: 'No unified events',
    }
  }

  let critical = 0
  let warning = 0
  let info = 0
  let top = events[0]

  for (const e of events) {
    bySource[e.source] += 1
    if (e.severity === 'critical') critical++
    else if (e.severity === 'warning') warning++
    else info++
    if (SEV_RANK[e.severity] < SEV_RANK[top.severity]) top = e
  }

  const activeSources = UNIFIED_EVENT_SOURCES.filter((s) => bySource[s] > 0)
  const headline =
    critical > 0
      ? `${critical} critical · ${top.source} · ${top.title}`
      : `${events.length} events · ${activeSources.join('+')}`

  return {
    total: events.length,
    critical,
    warning,
    info,
    topSeverity: top.severity,
    bySource,
    headline,
    latest: events[0],
  }
}
