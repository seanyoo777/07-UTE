import {
  UNIFIED_EVENT_STORAGE_VERSION,
  type UnifiedEvent,
  type UnifiedEventStorageBlob,
} from './unifiedEventTypes'
import { trimUnifiedEvents, UNIFIED_EVENT_MAX } from './unifiedEventList'

const STORAGE_PREFIX = 'ute-unified-events:v1:'

export function unifiedEventStorageKey(scopeKey: string): string {
  return `${STORAGE_PREFIX}${scopeKey}`
}

export function loadUnifiedEventsFromStorage(scopeKey: string): UnifiedEvent[] {
  if (typeof window === 'undefined' || !window.localStorage) return []
  try {
    const raw = window.localStorage.getItem(unifiedEventStorageKey(scopeKey))
    if (!raw) return []
    const parsed = JSON.parse(raw) as UnifiedEventStorageBlob
    if (parsed.v !== UNIFIED_EVENT_STORAGE_VERSION || !Array.isArray(parsed.events)) {
      return []
    }
    return trimUnifiedEvents(
      parsed.events.filter((e) => e.mockOnly === true && e.scopeKey === scopeKey),
    )
  } catch {
    return []
  }
}

export function saveUnifiedEventsToStorage(scopeKey: string, events: UnifiedEvent[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return
  const blob: UnifiedEventStorageBlob = {
    v: UNIFIED_EVENT_STORAGE_VERSION,
    events: trimUnifiedEvents(events.filter((e) => e.scopeKey === scopeKey), UNIFIED_EVENT_MAX),
  }
  try {
    window.localStorage.setItem(unifiedEventStorageKey(scopeKey), JSON.stringify(blob))
  } catch {
    /* quota — keep in-memory only */
  }
}
