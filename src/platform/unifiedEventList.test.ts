import { describe, expect, it } from 'vitest'
import type { UnifiedEvent } from './unifiedEventTypes'
import { appendUnifiedEvent, mergeUnifiedEventCandidates, UNIFIED_EVENT_MAX } from './unifiedEventList'

function ev(id: string): UnifiedEvent {
  return {
    id,
    source: 'admin',
    severity: 'info',
    title: id,
    body: 'mock',
    at: 1,
    mockOnly: true,
    scopeKey: 'ute-07:tenant-a',
  }
}

describe('unifiedEventList', () => {
  it('caps list at UNIFIED_EVENT_MAX', () => {
    let list: UnifiedEvent[] = []
    for (let i = 0; i < 12; i++) {
      list = appendUnifiedEvent(list, ev(`e-${i}`))
    }
    expect(list).toHaveLength(UNIFIED_EVENT_MAX)
    expect(list[0].id).toBe('e-11')
  })

  it('merge skips duplicate ids', () => {
    const stored = [ev('a')]
    const merged = mergeUnifiedEventCandidates(stored, [ev('a'), ev('b')])
    expect(merged).toHaveLength(2)
    expect(merged[0].id).toBe('b')
  })
})
