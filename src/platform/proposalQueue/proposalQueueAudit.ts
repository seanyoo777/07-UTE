import { useAdminAccessStore } from '../../admin/adminAccessStore'
import type { ProposalSnapshot, ProposalStatus } from './proposalQueueTypes'

export function logProposalCreated(proposal: ProposalSnapshot): void {
  useAdminAccessStore.getState().log({
    action: 'proposal.created',
    resource: proposal.id,
    result: 'ok',
    detail: `source=${proposal.source} status=${proposal.status} scope=${proposal.scope.scopeKey} mockOnly=true`,
  })
}

export function logProposalReviewed(proposal: ProposalSnapshot): void {
  useAdminAccessStore.getState().log({
    action: 'proposal.reviewed',
    resource: proposal.id,
    result: 'ok',
    detail: `category=${proposal.category} type=${proposal.proposalType} no autonomous execution`,
  })
}

export function logProposalStatusChanged(
  proposal: ProposalSnapshot,
  from: ProposalStatus,
  to: ProposalStatus,
): void {
  useAdminAccessStore.getState().log({
    action: 'proposal.status_changed',
    resource: proposal.id,
    result: 'ok',
    detail: `${from}→${to} severity=${proposal.severity} mockOnly=true`,
  })
}
