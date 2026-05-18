import type { SelfTestVerdict } from '../../admin/selfTest/uteSelfTestTypes'
import type { GlobalDiagnosticsSourceId } from '../globalDiagnostics/globalDiagnosticsTypes'
import type { PlatformDiagnosticsScope } from '../platformScope'
import type { UnifiedEventSeverity } from '../unifiedEventTypes'

export const RISK_GRAPH_SCHEMA_VERSION = '1.0.0' as const

export const CROSS_APP_RISK_APP_IDS = [
  '01-p2p',
  '03-oneai',
  '10-gamehub',
  '11-streamhub',
  'ute-07',
] as const

export type CrossAppRiskAppId = GlobalDiagnosticsSourceId | 'ute-07'

export type RiskPressureLevel = 'low' | 'medium' | 'high'

export type RiskTrend = 'up' | 'down' | 'stable'

export type CrossAppRiskSnapshot = {
  schemaVersion: typeof RISK_GRAPH_SCHEMA_VERSION
  appId: CrossAppRiskAppId
  appLabel: string
  severity: UnifiedEventSeverity
  riskScoreMock: number
  activeIssues: number
  diagnosticsHealth: SelfTestVerdict
  proposalPressure: RiskPressureLevel
  incidentPressure: RiskPressureLevel
  trend: RiskTrend
  mockOnly: true
}

export type CrossAppRiskGraphSnapshot = {
  schemaVersion: typeof RISK_GRAPH_SCHEMA_VERSION
  scope: PlatformDiagnosticsScope
  asOf: number
  mockOnly: true
  apps: CrossAppRiskSnapshot[]
  overallVerdict: SelfTestVerdict
  passWarnFailMap: { pass: number; warn: number; fail: number }
  proposalPressureSummary: {
    draft: number
    pendingReview: number
    approved: number
    total: number
  }
  incidentTrendSummary: {
    open: number
    critical: number
    warning: number
    total: number
  }
  relatedGlobalDiagnosticsId?: string
  relatedIncidentIds: string[]
  relatedProposalIds: string[]
}
