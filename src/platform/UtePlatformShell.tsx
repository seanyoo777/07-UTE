import { useState, type ReactNode } from 'react'
import { useAppNavigation } from '../appNavigation'
import { useBridgeDashboardStore } from '../bridges'
import { shouldEnableWhitelabelPresets, shouldEnableWorkspaceContextRouter } from '../config/layoutUiGuards'
import { useEffectiveLayoutFlags } from '../hooks/useEffectiveLayoutFlags'
import { resolveWhitelabelShellClasses } from '../whitelabel/resolveWhitelabelClasses'
import { useTenantWhitelabelStore } from '../whitelabel/tenantWhitelabelStore'
import type { MarketId } from '../markets/types'
import type { AdapterStatus } from '../store/types'
import { countBridgeDashboardErrors } from './countBridgeErrors'
import { PlatformDiagnosticsPanel } from './PlatformDiagnosticsPanel'
import { PlatformHeader } from './PlatformHeader'
import { PlatformSidebar } from './PlatformSidebar'
import { PlatformWorkspaceContextRail } from './PlatformWorkspaceContextRail'
import type { PlatformNavId } from './platformShellConfig'
import { useWorkspaceContextStore } from './workspaceContextStore'

type Props = {
  children: ReactNode
  activeMarketId?: MarketId
  adapterStatus?: AdapterStatus
}

/**
 * Tenant-aware platform shell: header · sidebar · workspace.
 * Additive wrapper — no live trading API.
 */
export function UtePlatformShell({ children, activeMarketId, adapterStatus }: Props) {
  const view = useAppNavigation((s) => s.view)
  const snapshots = useBridgeDashboardStore((s) => s.snapshots)
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false)
  const [sidebarNav, setSidebarNav] = useState<PlatformNavId>('trading')
  const layoutFlags = useEffectiveLayoutFlags()
  const preset = useTenantWhitelabelStore((s) => s.preset)
  const shellLayout = resolveWhitelabelShellClasses(preset)
  const whitelabelOn = shouldEnableWhitelabelPresets(layoutFlags)
  const routerEnabled = shouldEnableWorkspaceContextRouter(layoutFlags)
  const activeContext = useWorkspaceContextStore((s) => s.activeContext)

  const bridgeErrorCount = countBridgeDashboardErrors(snapshots)

  const onSelectNav = (id: PlatformNavId) => {
    setSidebarNav(id)
    if (id === 'diagnostics') {
      setDiagnosticsOpen(true)
    } else {
      setDiagnosticsOpen(false)
    }
  }

  const showDiagnosticsPanel =
    diagnosticsOpen ||
    (routerEnabled && (activeContext === 'diagnostics' || activeContext === 'tenant'))

  return (
    <div className="flex h-full min-h-0 min-h-[100dvh] flex-col bg-so-bg">
      <PlatformHeader
        activeMarketId={activeMarketId}
        adapterStatus={adapterStatus}
        diagnosticsOpen={showDiagnosticsPanel}
        onToggleDiagnostics={() => {
          setDiagnosticsOpen((o) => !o)
          if (!diagnosticsOpen) setSidebarNav('diagnostics')
        }}
      />
      <div className="flex min-h-0 flex-1">
        <PlatformSidebar activeNav={sidebarNav} onSelectNav={onSelectNav} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <PlatformWorkspaceContextRail />
          <div className="flex min-h-0 min-w-0 flex-1">
            <main
              className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${
                whitelabelOn
                  ? `${shellLayout.gridDensityClass} ${shellLayout.cardLayoutClass} ${shellLayout.workspaceSpacingClass}`
                  : ''
              }`}
              data-ute-layout-grid={whitelabelOn ? shellLayout.gridDensityData : undefined}
              data-ute-layout-card={whitelabelOn ? shellLayout.cardLayoutData : undefined}
            >
              <div className="ute-shell-card flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-[var(--ute-shell-pad,0)]">
                {children}
              </div>
            </main>
            {showDiagnosticsPanel ? (
              <PlatformDiagnosticsPanel
                onClose={() => {
                  setDiagnosticsOpen(false)
                  if (routerEnabled && activeContext === 'diagnostics') {
                    useWorkspaceContextStore.getState().clearHighlight()
                  }
                  if (sidebarNav === 'diagnostics') setSidebarNav(view === 'admin' ? 'admin' : 'trading')
                }}
              />
            ) : null}
          </div>
        </div>
      </div>
      <footer className="shrink-0 border-t border-so-border/40 px-3 py-1 text-center text-[9px] text-so-muted">
        Platform Shell MVP · tenant mock · bridge errors {bridgeErrorCount} · no live orders
      </footer>
    </div>
  )
}
