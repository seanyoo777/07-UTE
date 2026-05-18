import type { IncidentReviewSource } from '../incidentReview/incidentReviewTypes'
import type { ProposalSource } from '../proposalQueue/proposalQueueTypes'
import { GLOBAL_DIAGNOSTICS_SOURCE_META } from '../globalDiagnostics/globalDiagnosticsSourceMeta'
import type { CrossAppRiskAppId } from './riskGraphTypes'

/** Map unified / incident / proposal sources to cross-app risk node id. */
export function mapSourceToAppId(
  source: IncidentReviewSource | ProposalSource | string,
): CrossAppRiskAppId {
  if (source === '01-p2p' || source === 'escrow') return '01-p2p'
  if (source === '03-oneai' || source === 'oneai') return '03-oneai'
  if (source === '10-gamehub') return '10-gamehub'
  if (source === '11-streamhub' || source === 'streamhub') return '11-streamhub'
  if (source === 'global-diagnostics' || source === 'diagnostics' || source === 'ute-07') {
    return 'ute-07'
  }
  if (source in GLOBAL_DIAGNOSTICS_SOURCE_META) {
    return source as CrossAppRiskAppId
  }
  return 'ute-07'
}

export function appLabelForId(appId: CrossAppRiskAppId): string {
  if (appId === 'ute-07') return '07 UTE'
  return GLOBAL_DIAGNOSTICS_SOURCE_META[appId]?.appLabel ?? appId
}
