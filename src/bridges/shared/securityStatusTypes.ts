/**
 * 운영 보안 / Admin 관측용 mock 타입 (실 API·실 정산 없음).
 * BRG 패널 및 향후 대시보드에서 시각화할 값의 스키마만 정의합니다.
 */

/** 관리자/운영 콘솔 접근 (mock) */
export type AdminAccessStatus = 'locked_mock' | 'restricted_mock' | 'full_mock' | 'read_only_mock'

/** 감사 로그 파이프라인 (mock) */
export type AuditLogStatus = 'idle_mock' | 'streaming_mock' | 'backpressure_mock' | 'error_mock'

/** 시크릿/키 상태 (mock — 실 키 없음) */
export type SecretsStatus = 'local_dev_only_mock' | 'rotated_mock' | 'vault_disconnected_mock'

/** 환경 모드 (mock 라벨) */
export type EnvironmentMode = 'development_mock' | 'staging_mock' | 'production_blocked_mock'

/** 유지보수 창 (mock) */
export type MaintenanceMode = 'off_mock' | 'scheduled_mock' | 'active_mock'

/** 리전 제한 (mock) */
export type RegionRestrictionStatus = 'none_mock' | 'soft_block_mock' | 'hard_block_mock'

/** 레이트 리밋 (mock) */
export type RateLimitStatus = 'nominal_mock' | 'throttled_mock' | 'tripped_mock'

/** WAF (mock) */
export type WafStatus = 'pass_mock' | 'challenge_mock' | 'block_mock'

/** IP 허용 목록 (mock) */
export type IpAllowlistStatus = 'disabled_mock' | 'enforced_mock' | 'bypass_dev_mock'

/** BRG·운영 대시보드에 묶어서 노출할 mock 번들 */
export type SecurityAdminStatusBundle = {
  adminAccessStatus: AdminAccessStatus
  auditLogStatus: AuditLogStatus
  secretsStatus: SecretsStatus
  environmentMode: EnvironmentMode
  maintenanceMode: MaintenanceMode
  regionRestrictionStatus: RegionRestrictionStatus
  rateLimitStatus: RateLimitStatus
  wafStatus: WafStatus
  ipAllowlistStatus: IpAllowlistStatus
  asOf: number
}
