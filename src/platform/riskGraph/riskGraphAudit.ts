import { useAdminAccessStore } from '../../admin/adminAccessStore'
import type { CrossAppRiskGraphSnapshot } from './riskGraphTypes'

export function logRiskGraphView(graph: CrossAppRiskGraphSnapshot): void {
  useAdminAccessStore.getState().log({
    action: 'risk_graph_view',
    resource: 'CrossAppRiskGraphBoard',
    result: 'ok',
    detail: `scope=${graph.scope.scopeKey} overall=${graph.overallVerdict} apps=${graph.apps.length} mockOnly=true`,
  })
}
