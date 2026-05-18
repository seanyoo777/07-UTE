/** Unified event feed sources (mock/demo — no WebSocket). */
export const UNIFIED_EVENT_SOURCES = [
  'oneai',
  'escrow',
  'diagnostics',
  'streamhub',
  'admin',
  'tenant',
] as const

export type UnifiedEventSource = (typeof UNIFIED_EVENT_SOURCES)[number]

export type UnifiedEventSeverity = 'info' | 'warning' | 'critical'

export type UnifiedEvent = {
  id: string
  source: UnifiedEventSource
  severity: UnifiedEventSeverity
  title: string
  body: string
  at: number
  mockOnly: true
  scopeKey: string
  diagnosticsSnapshotId?: string
}

export type UnifiedEventSummary = {
  total: number
  critical: number
  warning: number
  info: number
  topSeverity: UnifiedEventSeverity | 'none'
  bySource: Record<UnifiedEventSource, number>
  headline: string
  latest?: UnifiedEvent
}

export const UNIFIED_EVENT_STORAGE_VERSION = 1 as const

export type UnifiedEventStorageBlob = {
  v: typeof UNIFIED_EVENT_STORAGE_VERSION
  events: UnifiedEvent[]
}
