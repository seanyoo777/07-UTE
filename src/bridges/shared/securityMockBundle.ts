import type { SecurityAdminStatusBundle } from './securityStatusTypes'

/** 데모용 고정 mock — 네트워크·실 키 없음 */
export function buildMockSecurityAdminBundle(): SecurityAdminStatusBundle {
  return {
    adminAccessStatus: 'read_only_mock',
    auditLogStatus: 'streaming_mock',
    secretsStatus: 'local_dev_only_mock',
    environmentMode: 'development_mock',
    maintenanceMode: 'off_mock',
    regionRestrictionStatus: 'none_mock',
    rateLimitStatus: 'nominal_mock',
    wafStatus: 'pass_mock',
    ipAllowlistStatus: 'bypass_dev_mock',
    asOf: Date.now(),
  }
}
