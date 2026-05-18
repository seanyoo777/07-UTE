import { useBridgeDashboardStore } from '../bridges'
import { useAppNavigation } from '../appNavigation'
import { isWorkspaceContextActive } from './workspaceContextStore'
import { WORKSPACE_CONTEXT_PANELS } from './workspaceContextPanelConfig'
import { useWorkspaceContextRouter } from './useWorkspaceContextRouter'
import { useTenantContextBridge } from './tenantContext/useTenantContextBridge'

export function PlatformWorkspaceContextRail() {
  const { enabled, scope, activeContext, activeEventId, navigate } = useWorkspaceContextRouter()
  const { showRailWarning, showRailWarn, snapshot: tenantSnapshot } = useTenantContextBridge()
  const view = useAppNavigation((s) => s.view)
  const snapshots = useBridgeDashboardStore((s) => s.snapshots)

  if (!enabled) return null

  const oneai = snapshots.oneai.oneaiPanel
  const tg = snapshots.tetherget.tethergetPanel

  const panelHint: Record<string, string> = {
    oneai: oneai
      ? `${oneai.strategyCount} strat · ${oneai.riskLevel}`
      : 'OneAI mock idle',
    escrow: tg ? `locked ${tg.escrowLockedCount} · ${tg.p2pCount} P2P` : 'Escrow mock idle',
    streamhub: 'MD lane · no WebSocket',
    admin: view === 'admin' ? 'Admin workspace active' : 'Admin mock lane',
    diagnostics: 'Self-test · snapshots',
    tenant: tenantSnapshot
      ? `validation ${tenantSnapshot.overall}`
      : '12-TGX-TokenAdmin mock',
  }

  return (
    <div
      className="shrink-0 border-b border-so-border/60 bg-so-panel/40 px-2 py-1.5"
      role="navigation"
      aria-label="Workspace context router"
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-[9px] font-semibold uppercase tracking-wide text-so-muted">
          Workspace context
        </p>
        <span className="rounded border border-amber-500/30 px-1 py-0.5 text-[7px] uppercase text-amber-200/80">
          mockOnly
        </span>
        <span className="truncate font-mono text-[8px] text-so-muted" title={scope.scopeKey}>
          {scope.tenantId}
        </span>
        {showRailWarning ? (
          <span className="rounded border border-so-ask/50 bg-so-ask/15 px-1 py-0.5 text-[7px] font-bold uppercase text-so-ask">
            validation FAIL
          </span>
        ) : showRailWarn ? (
          <span className="rounded border border-so-warn/50 bg-so-warn/12 px-1 py-0.5 text-[7px] font-bold uppercase text-so-warn">
            validation WARN
          </span>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-1">
        {WORKSPACE_CONTEXT_PANELS.map((panel) => {
          const isActive = isWorkspaceContextActive(panel.id, activeContext, activeEventId)
          return (
            <button
              key={panel.id}
              type="button"
              onClick={() => navigate(panel.id)}
              className={`min-w-[72px] flex-1 rounded-md border px-2 py-1 text-left transition-colors ${
                isActive
                  ? 'border-so-bid/60 bg-so-bid/15 ring-1 ring-so-bid/40'
                  : 'border-so-border/50 bg-so-bg/50 hover:border-so-border hover:bg-so-bg/80'
              }`}
              aria-current={isActive ? 'true' : undefined}
              title={`${panel.label} · ${panel.mockLane}`}
            >
              <span className="text-[9px] font-semibold text-so-fg">{panel.label}</span>
              <span className="mt-0.5 block truncate text-[8px] text-so-muted">{panelHint[panel.id]}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
