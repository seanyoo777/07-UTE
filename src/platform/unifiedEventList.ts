import type { UnifiedEvent } from './unifiedEventTypes'

export const UNIFIED_EVENT_MAX = 10

export function trimUnifiedEvents(
  events: UnifiedEvent[],
  max = UNIFIED_EVENT_MAX,
): UnifiedEvent[] {
  return events.slice(0, max)
}

/** Newest first; dedupe by id (incoming wins). */
export function appendUnifiedEvent(
  events: UnifiedEvent[],
  event: UnifiedEvent,
  max = UNIFIED_EVENT_MAX,
): UnifiedEvent[] {
  const without = events.filter((e) => e.id !== event.id)
  return trimUnifiedEvents([event, ...without], max)
}

export function mergeUnifiedEventCandidates(
  stored: UnifiedEvent[],
  candidates: UnifiedEvent[],
  max = UNIFIED_EVENT_MAX,
): UnifiedEvent[] {
  let next = stored
  for (const c of candidates) {
    if (next.some((e) => e.id === c.id)) continue
    next = appendUnifiedEvent(next, c, max)
  }
  return next
}
