import { BRIDGE_ORDER } from '../bridges/shared/bridgeTypes'
import type { BridgeAdapterSnapshot, BridgeId } from '../bridges/shared/bridgeTypes'
import { AdminStatusBadge } from './AdminStatusBadge'

const FALLBACK_LABEL: Record<BridgeAdapterSnapshot['mockFallback'], string> = {
  none: 'none',
  explicit_demo: 'demo',
  live_unavailable: 'live off',
  circuit_open: 'circuit',
}

function bridgeDetailLine(s: BridgeAdapterSnapshot): string {
  if (s.id === 'tetherget' && s.tethergetPanel) {
    const p = s.tethergetPanel
    return `${p.summaryLine} · fb:${p.fallbackState}`
  }
  if (s.id === 'tgx' && s.tgxPanel) {
    const p = s.tgxPanel
    return `${p.selectedSymbolLine} · MD ${p.marketDataStatus} · pos ${p.positionsCount}`
  }
  if (s.id === 'oneai' && s.oneaiPanel) {
    const p = s.oneaiPanel
    return `${p.strategyCount} strat · ${p.recentSignalCount} sig/24h · ${p.riskLevel}`
  }
  if (s.id === 'mockinvest' && s.mockinvestPanel) {
    const p = s.mockinvestPanel
    return `${p.activeTournamentsCount} rooms · ${p.activeParticipantsTotal} participants`
  }
  if (s.id === 'speedorder' && s.speedorderPanel) {
    const p = s.speedorderPanel
    return `${p.engineStatus} · reg ${p.registryCount} · ${p.marketSyncState}`
  }
  return s.capabilitiesSummary
}

type Props = {
  snapshots: Record<BridgeId, BridgeAdapterSnapshot>
}

export function AdminBridgeHealthTable({ snapshots }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-so-border/80 bg-so-surface/40">
      <table className="w-full min-w-[640px] border-collapse text-left text-[10px]">
        <thead>
          <tr className="border-b border-so-border/80 bg-so-bg/50 text-[9px] font-semibold uppercase tracking-wider text-so-muted">
            <th className="px-2 py-2">Bridge</th>
            <th className="px-2 py-2">Status</th>
            <th className="px-2 py-2">Transport</th>
            <th className="px-2 py-2">Source</th>
            <th className="px-2 py-2">Fallback</th>
            <th className="px-2 py-2">Snapshot</th>
            <th className="px-2 py-2">Error</th>
          </tr>
        </thead>
        <tbody>
          {BRIDGE_ORDER.map((id) => {
            const s = snapshots[id]
            return (
              <tr key={id} className="border-b border-so-border/40 last:border-0">
                <td className="px-2 py-1.5 align-top">
                  <div className="font-semibold text-so-text">{s.displayName}</div>
                  <div className="font-mono text-[9px] text-so-muted">{s.productCode}</div>
                </td>
                <td className="px-2 py-1.5 align-top">
                  <AdminStatusBadge status={s.dashboardStatus} />
                </td>
                <td className="px-2 py-1.5 align-top text-so-muted">{s.connectionStatus}</td>
                <td className="px-2 py-1.5 align-top text-so-muted">{s.dataSource}</td>
                <td className="px-2 py-1.5 align-top font-mono text-so-muted">{FALLBACK_LABEL[s.mockFallback]}</td>
                <td className="max-w-[280px] px-2 py-1.5 align-top text-so-text/90">
                  <span className="line-clamp-2 break-words" title={bridgeDetailLine(s)}>
                    {bridgeDetailLine(s)}
                  </span>
                </td>
                <td className="max-w-[200px] px-2 py-1.5 align-top text-so-ask">
                  {s.lastError ? (
                    <span className="line-clamp-2 break-words" title={s.lastError.message}>
                      {s.lastError.code}: {s.lastError.message}
                    </span>
                  ) : (
                    <span className="text-so-muted">—</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
