import { describe, expect, it } from 'vitest'
import type { AdminNotificationItem } from '../admin/adminNotificationTypes'
import { summarizePlatformNotifications } from './summarizePlatformNotifications'

function item(
  severity: AdminNotificationItem['severity'],
  title: string,
  read = false,
): AdminNotificationItem {
  return {
    id: `n-${title}`,
    severity,
    category: 'system',
    title,
    body: 'mock',
    createdAt: Date.now(),
    read,
  }
}

describe('summarizePlatformNotifications', () => {
  it('returns empty headline when no items', () => {
    const s = summarizePlatformNotifications([])
    expect(s.total).toBe(0)
    expect(s.topSeverity).toBe('none')
    expect(s.headline).toBe('No mock alerts')
  })

  it('prioritizes critical in headline', () => {
    const s = summarizePlatformNotifications([
      item('info', 'Info alert'),
      item('critical', 'Bridge down', false),
    ])
    expect(s.critical).toBe(1)
    expect(s.unread).toBe(2)
    expect(s.headline).toContain('critical')
    expect(s.headline).toContain('Bridge down')
  })
})
