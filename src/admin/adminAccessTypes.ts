/**
 * 통합 관리자 mock RBAC — 실 IdP·실 권한 서버 없음.
 */

export type AdminRole =
  | 'super_admin'
  | 'hq_admin'
  | 'platform_admin'
  | 'risk_admin'
  | 'finance_admin'
  | 'operator'
  | 'support'
  | 'readonly'

/** 정책 키(향후 서버 정렬용) */
export type AdminPermission =
  | 'admin.view'
  | 'admin.refresh_probe'
  | 'admin.view_security'
  | 'admin.export_snapshot'
  | 'admin.change_settings'
  | 'admin.trigger_danger'

/** UI·가드에 쓰는 파생 플래그(전부 mock 산출) */
export type AdminCapabilityFlags = {
  canViewAdmin: boolean
  canRefreshProbe: boolean
  canViewSecurity: boolean
  canExportSnapshot: boolean
  /** 본 빌드에서는 항상 false — 실 설정·실연동 없음 */
  canChangeSettings: boolean
  /** 본 빌드에서는 항상 false — 송금·주문·정산 트리거 없음 */
  canTriggerDangerAction: boolean
}

/**
 * 단일 시점의 접근 상태(스토어 스냅샷에 대응).
 * `permissions`는 역할에서 파생된 허용 목록.
 */
export type AdminAccessState = {
  role: AdminRole
  actorId: string
  actorLabel: string
  permissions: readonly AdminPermission[]
} & AdminCapabilityFlags
