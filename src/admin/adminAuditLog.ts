import type { AdminRole } from './adminAccessTypes'

let auditSeq = 0

/** 감사에 남기는 읽기·탐색 이벤트(mock, 서버 저장 없음) */
export type AdminAuditAction =
  | 'view_admin'
  | 'bootstrap_snapshot'
  | 'refresh_probe'
  | 'export_snapshot'
  | 'export_snapshot_masked'
  | 'navigate_trading'
  | 'attempt_denied'
  | 'notification_view'
  | 'health_view'
  | 'self_test_run'
  | 'platform_notification_view'
  | 'platform_diagnostics_open'
  | 'platform_diagnostics_snapshot'
  | 'platform_unified_feed_view'
  | 'platform_unified_event_append'
  | 'platform_workspace_context_navigate'
  | 'platform_tenant_validation_read'
  | 'platform_scope_mismatch_detected'
  | 'platform_tenant_bridge_view'
  | 'platform_diagnostics_ui_view'
  | 'global_diagnostics_view'
  | 'global_diagnostics_snapshot'
  | 'incident.reviewed'
  | 'incident.mock_resolved'
  | 'proposal.created'
  | 'proposal.reviewed'
  | 'proposal.status_changed'
  | 'risk_graph_view'
  | 'operations_timeline_view'

export type AdminAuditLogEntry = {
  id: string
  at: number
  actorId: string
  actorLabel: string
  role: AdminRole
  action: AdminAuditAction
  resource: string
  result: 'ok' | 'denied' | 'skipped'
  detail?: string
}

export function createAdminAuditLogEntry(
  input: Omit<AdminAuditLogEntry, 'id' | 'at'> & { id?: string; at?: number },
): AdminAuditLogEntry {
  auditSeq += 1
  return {
    id: input.id ?? `audit-mock-${auditSeq}`,
    at: input.at ?? Date.now(),
    actorId: input.actorId,
    actorLabel: input.actorLabel,
    role: input.role,
    action: input.action,
    resource: input.resource,
    result: input.result,
    detail: input.detail,
  }
}

/** 스토어 초기값용 데모 행(과거 시각 고정 아님 — at은 생성 시각) */
export function buildMockAdminAuditSeed(now: number): AdminAuditLogEntry[] {
  return [
    createAdminAuditLogEntry({
      at: now - 3_600_000,
      actorId: 'mock-seed-1',
      actorLabel: 'MOCK batch',
      role: 'platform_admin',
      action: 'refresh_probe',
      resource: 'bridgeProbeRunner',
      result: 'ok',
      detail: 'mock seed row',
    }),
    createAdminAuditLogEntry({
      at: now - 1_800_000,
      actorId: 'mock-seed-1',
      actorLabel: 'MOCK batch',
      role: 'readonly',
      action: 'view_admin',
      resource: '/admin',
      result: 'ok',
      detail: 'mock seed row',
    }),
  ]
}
