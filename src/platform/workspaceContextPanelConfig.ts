import type { WorkspaceContextId } from './workspaceContextTypes'

export type WorkspaceContextPanelMeta = {
  id: WorkspaceContextId
  label: string
  short: string
  mockLane: string
}

export const WORKSPACE_CONTEXT_PANELS: readonly WorkspaceContextPanelMeta[] = [
  { id: 'oneai', label: 'OneAI', short: 'AI', mockLane: 'strategies · signals' },
  { id: 'escrow', label: 'Escrow', short: 'ESC', mockLane: 'P2P · ute-surface' },
  { id: 'streamhub', label: 'StreamHub', short: 'STR', mockLane: 'MD lane (no WS)' },
  { id: 'admin', label: 'Admin', short: 'ADM', mockLane: 'RBAC · audit' },
  { id: 'diagnostics', label: 'Diagnostics', short: 'DIAG', mockLane: 'self-test' },
  { id: 'tenant', label: 'Tenant', short: 'TEN', mockLane: '12-TGX validation' },
] as const
