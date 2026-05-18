import { useAdminAccessStore } from '../../admin/adminAccessStore'
import type { IncidentReviewSnapshot } from './incidentReviewTypes'

export function logIncidentReviewed(incident: IncidentReviewSnapshot): void {
  useAdminAccessStore.getState().log({
    action: 'incident.reviewed',
    resource: incident.id,
    result: 'ok',
    detail: `source=${incident.source} triage=${incident.triageVerdict} scope=${incident.scope.scopeKey} mockOnly=true`,
  })
}

export function logIncidentMockResolved(incident: IncidentReviewSnapshot): void {
  useAdminAccessStore.getState().log({
    action: 'incident.mock_resolved',
    resource: incident.id,
    result: 'ok',
    detail: `source=${incident.source} triage=${incident.triageVerdict} no auto-remediation`,
  })
}
