import { useAdminAccessStore } from '../admin/adminAccessStore'
import type { PlatformDiagnosticsScope } from './platformScope'
import type { PlatformNotificationSummary } from './summarizePlatformNotifications'
import type { SelfTestVerdict } from '../admin/selfTest/uteSelfTestTypes'
import type { UnifiedEvent, UnifiedEventSummary } from './unifiedEventTypes'
import type { WorkspaceContextId } from './workspaceContextTypes'

function scopeDetail(scope: PlatformDiagnosticsScope): string {
  return `platformId=${scope.platformId} tenantId=${scope.tenantId}`
}

/** Append-only mock audit via admin access store (no server). */
export function logPlatformNotificationView(summary: PlatformNotificationSummary): void {
  useAdminAccessStore.getState().log({
    action: 'platform_notification_view',
    resource: 'PlatformNotificationSlot',
    result: 'ok',
    detail: `total=${summary.total} critical=${summary.critical} warning=${summary.warning} unread=${summary.unread}`,
  })
}

export function logPlatformDiagnosticsOpen(scope: PlatformDiagnosticsScope): void {
  useAdminAccessStore.getState().log({
    action: 'platform_diagnostics_open',
    resource: 'PlatformDiagnosticsPanel',
    result: 'ok',
    detail: scopeDetail(scope),
  })
}

export function logPlatformDiagnosticsSnapshot(
  scope: PlatformDiagnosticsScope,
  overall: SelfTestVerdict,
): void {
  useAdminAccessStore.getState().log({
    action: 'platform_diagnostics_snapshot',
    resource: scope.scopeKey,
    result: 'ok',
    detail: `${scopeDetail(scope)} overall=${overall}`,
  })
}

export function logPlatformUnifiedFeedView(summary: UnifiedEventSummary): void {
  useAdminAccessStore.getState().log({
    action: 'platform_unified_feed_view',
    resource: 'PlatformUnifiedEventFeed',
    result: 'ok',
    detail: `total=${summary.total} critical=${summary.critical} headline=${summary.headline}`,
  })
}

export function logPlatformUnifiedEventAppend(event: UnifiedEvent): void {
  useAdminAccessStore.getState().log({
    action: 'platform_unified_event_append',
    resource: `${event.source}:${event.id}`,
    result: 'ok',
    detail: `severity=${event.severity} mockOnly=${event.mockOnly}${event.diagnosticsSnapshotId ? ` diag=${event.diagnosticsSnapshotId}` : ''}`,
  })
}

export function logPlatformDiagnosticsUiView(scopeKey: string, overall: string): void {
  useAdminAccessStore.getState().log({
    action: 'platform_diagnostics_ui_view',
    resource: 'PlatformDiagnosticsPanel',
    result: 'ok',
    detail: `scopeKey=${scopeKey} overall=${overall} diagnostics-ui view-model`,
  })
}

export function logPlatformWorkspaceContextNavigate(
  scope: PlatformDiagnosticsScope,
  contextId: WorkspaceContextId,
  eventId: string | null,
): void {
  useAdminAccessStore.getState().log({
    action: 'platform_workspace_context_navigate',
    resource: `${scope.scopeKey}/${contextId}`,
    result: 'ok',
    detail: `${scopeDetail(scope)} eventId=${eventId ?? 'none'} mockOnly=true`,
  })
}
