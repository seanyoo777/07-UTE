import { BRIDGE_ORDER } from '../bridges/shared/bridgeTypes'
import type { BridgeAdapterSnapshot, BridgeId } from '../bridges/shared/bridgeTypes'
import type { UteIntegrationSnapshot } from '../bridges/shared/integrationSnapshots'
import type { SecurityAdminStatusBundle } from '../bridges/shared/securityStatusTypes'

export type AdminRiskSeverity = 'info' | 'warn' | 'critical'

export type AdminRiskAlert = {
  id: string
  severity: AdminRiskSeverity
  title: string
  detail: string
  source: 'bridge' | 'security' | 'integration' | 'tetherget' | 'oneai'
}

const SEV_ORDER: Record<AdminRiskSeverity, number> = { critical: 0, warn: 1, info: 2 }

export function buildAdminRiskAlerts(
  snapshots: Record<BridgeId, BridgeAdapterSnapshot>,
  security: SecurityAdminStatusBundle,
  integration: UteIntegrationSnapshot | null,
): AdminRiskAlert[] {
  const alerts: AdminRiskAlert[] = []

  if (!integration) {
    alerts.push({
      id: 'integration-missing',
      severity: 'info',
      title: '통합 스냅샷 미로드',
      detail: '스냅샷 새로고침으로 지표를 채웁니다. 현재는 Bridge 카드·보안 번들만 최신일 수 있습니다.',
      source: 'integration',
    })
  }

  for (const id of BRIDGE_ORDER) {
    const s = snapshots[id]
    if (s.dashboardStatus === 'error') {
      alerts.push({
        id: `bridge-error-${id}`,
        severity: 'critical',
        title: `${s.displayName} 프로브 오류`,
        detail: s.lastError?.message ?? '알 수 없는 오류',
        source: 'bridge',
      })
    }
    if (id === 'tetherget' && s.tethergetPanel?.fallbackState === 'mock_fallback') {
      alerts.push({
        id: 'tetherget-mock-fallback',
        severity: 'warn',
        title: 'TetherGet ute-surface mock fallback',
        detail: s.tethergetPanel.fallbackReason ?? 'live 경로 비활성 또는 실패 후 mock',
        source: 'tetherget',
      })
    }
    if (id === 'tetherget' && s.tethergetPanel?.fallbackState === 'error') {
      alerts.push({
        id: 'tetherget-surface-error',
        severity: 'critical',
        title: 'TetherGet surface 오류',
        detail: s.tethergetPanel.fallbackReason ?? 'surface 소비 실패',
        source: 'tetherget',
      })
    }
    if (id === 'tetherget' && s.tethergetPanel?.adminRisk === 'high') {
      alerts.push({
        id: 'tetherget-admin-risk-high',
        severity: 'warn',
        title: 'TetherGet admin risk 높음 (mock)',
        detail: s.tethergetPanel.summaryLine,
        source: 'tetherget',
      })
    }
    if (id === 'tetherget' && s.tethergetPanel?.walletRisk === 'high') {
      alerts.push({
        id: 'tetherget-wallet-risk-high',
        severity: 'warn',
        title: 'TetherGet wallet risk 높음 (mock)',
        detail: s.tethergetPanel.summaryLine,
        source: 'tetherget',
      })
    }
  }

  if (security.wafStatus === 'block_mock') {
    alerts.push({
      id: 'sec-waf-block',
      severity: 'critical',
      title: 'WAF block (mock)',
      detail: '운영 시뮬레이션 — 실 차단 아님',
      source: 'security',
    })
  }
  if (security.rateLimitStatus === 'tripped_mock') {
    alerts.push({
      id: 'sec-rate-trip',
      severity: 'warn',
      title: 'Rate limit tripped (mock)',
      detail: '시뮬 상태',
      source: 'security',
    })
  }
  if (security.secretsStatus === 'vault_disconnected_mock') {
    alerts.push({
      id: 'sec-secrets-vault',
      severity: 'warn',
      title: 'Secrets vault disconnected (mock)',
      detail: '실 키·볼트 미연동',
      source: 'security',
    })
  }
  if (security.maintenanceMode === 'active_mock') {
    alerts.push({
      id: 'sec-maint-active',
      severity: 'warn',
      title: 'Maintenance active (mock)',
      detail: '유지보수 창 시뮬',
      source: 'security',
    })
  }
  if (security.auditLogStatus === 'error_mock') {
    alerts.push({
      id: 'sec-audit-error',
      severity: 'warn',
      title: 'Audit log error (mock)',
      detail: '감사 파이프라인 시뮬 오류',
      source: 'security',
    })
  }

  if (integration?.oneai.riskLevel === 'high') {
    alerts.push({
      id: 'oneai-risk-high',
      severity: 'warn',
      title: 'OneAI aggregate risk high (mock)',
      detail: `strategies ${integration.oneai.strategyCount} · signals/24h ${integration.oneai.recentSignalCount}`,
      source: 'oneai',
    })
  }

  const dedup = new Map<string, AdminRiskAlert>()
  for (const a of alerts) dedup.set(a.id, a)
  const list = [...dedup.values()].sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity])

  if (list.filter((a) => a.severity !== 'info').length === 0 && integration) {
    list.push({
      id: 'all-clear-mock',
      severity: 'info',
      title: '경고·오류 조건 없음 (mock 스냅샷)',
      detail: '실 운영 알람이 아닙니다.',
      source: 'integration',
    })
  }

  return list
}
