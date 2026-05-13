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
