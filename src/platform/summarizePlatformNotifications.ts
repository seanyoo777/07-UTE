import type {
  AdminNotificationItem,
  AdminNotificationSeverity,
} from '../admin/adminNotificationTypes'

export type PlatformNotificationSummary = {
  total: number
  unread: number
  critical: number
  warning: number
  info: number
  topSeverity: AdminNotificationSeverity | 'none'
  headline: string
}

const SEV_RANK: Record<AdminNotificationSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
}

export function summarizePlatformNotifications(
  items: AdminNotificationItem[],
): PlatformNotificationSummary {
  if (items.length === 0) {
    return {
      total: 0,
      unread: 0,
      critical: 0,
      warning: 0,
      info: 0,
      topSeverity: 'none',
      headline: 'No mock alerts',
    }
  }

  let critical = 0
  let warning = 0
  let info = 0
  let unread = 0
  let top: AdminNotificationItem = items[0]

  for (const n of items) {
    if (!n.read) unread++
    if (n.severity === 'critical') critical++
    else if (n.severity === 'warning') warning++
    else info++
    if (SEV_RANK[n.severity] < SEV_RANK[top.severity]) top = n
  }

  const topSeverity = top.severity
  const headline =
    critical > 0
      ? `${critical} critical · ${top.title}`
      : warning > 0
        ? `${warning} warning · ${top.title}`
        : top.title

  return {
    total: items.length,
    unread,
    critical,
    warning,
    info,
    topSeverity,
    headline,
  }
}
