import { useAdminAccessStore } from '../../admin/adminAccessStore'
import type { OperationsTimelineSnapshot } from './operationsTimelineTypes'

export function logOperationsTimelineView(timeline: OperationsTimelineSnapshot): void {
  useAdminAccessStore.getState().log({
    action: 'operations_timeline_view',
    resource: 'OperationsTimelineBoard',
    result: 'ok',
    detail: `scope=${timeline.scope.scopeKey} events=${timeline.events.length} generatedAt=${timeline.generatedAtMs} mockOnly=true`,
  })
}
