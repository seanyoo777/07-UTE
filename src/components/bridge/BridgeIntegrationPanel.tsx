import { useEffect } from 'react'
import { useAppNavigation } from '../../appNavigation'
import type {
  BridgeAdapterSnapshot,
  BridgeDashboardStatus,
  SecurityAdminStatusBundle,
  UteIntegrationSnapshot,
} from '../../bridges'
import {
  BRIDGE_ORDER,
  selectBridgeSummaryText,
  useBridgeDashboardStore,
} from '../../bridges'

const STATUS_TONE: Record<BridgeDashboardStatus, string> = {
  disabled: 'border-so-border bg-so-border/30 text-so-muted',
  error: 'border-so-ask/50 bg-so-ask/15 text-so-ask',
  mock: 'border-so-warn/50 bg-so-warn/15 text-so-warn',
  connected: 'border-so-bid/50 bg-so-bid/15 text-so-bid',
}

const STATUS_LABEL: Record<BridgeDashboardStatus, string> = {
  disabled: 'DISABLED',
  error: 'ERROR',
  mock: 'MOCK',
  connected: 'CONNECTED',
}

const FALLBACK_LABEL: Record<BridgeAdapterSnapshot['mockFallback'], string> = {
  none: 'fallback: none',
  explicit_demo: 'fallback: demo',
  live_unavailable: 'fallback: live off',
  circuit_open: 'fallback: circuit',
}

function TethergetExtras({ snap }: { snap: BridgeAdapterSnapshot }) {
  const p = snap.tethergetPanel
  if (!p) return null
  const fallbackLabel =
    p.fallbackState === 'mock_fallback'
      ? `surface: mock_fallback${p.fallbackReason ? ` (${p.fallbackReason})` : ''}`
      : 'surface: mock (API 미시도)'
  return (
    <ul className="mt-1 space-y-0.5 border-t border-so-border/50 pt-1.5 text-[9px] leading-tight text-so-muted">
      <li className="font-mono text-so-text/90">schemaVersion: {p.schemaVersion}</li>
      <li>
        P2P <span className="font-semibold text-so-text">{p.p2pCount}</span> · escrow locked{' '}
        <span className="font-semibold text-so-text">{p.escrowLockedCount}</span> · disputes{' '}
        <span className="font-semibold text-so-text">{p.disputeCount}</span>
      </li>
      <li>
        referral pending <span className="font-semibold text-so-text">{p.referralPending}</span> · wallet risk{' '}
        <span className="uppercase text-so-warn">{p.walletRisk}</span> · admin{' '}
        <span className="uppercase text-so-warn">{p.adminRisk}</span>
      </li>
      <li className="line-clamp-2 text-[8px] text-so-text/85" title={p.summaryLine}>
        {p.summaryLine}
      </li>
      <li className="text-[8px]">{fallbackLabel}</li>
    </ul>
  )
}

function TgxExtras({ snap }: { snap: BridgeAdapterSnapshot }) {
  const p = snap.tgxPanel
  if (!p) return null
  return (
    <ul className="mt-1 space-y-0.5 border-t border-so-border/50 pt-1.5 text-[9px] leading-tight text-so-muted">
      <li className="font-mono text-so-text/90">selected: {p.selectedSymbolLine}</li>
      <li>universe: {p.symbolUniverseCount} symbols</li>
      <li>marketData: {p.marketDataStatus}</li>
      <li>
        pos {p.positionsCount} · ord {p.ordersCount}
      </li>
      <li className="text-so-text/85">{p.tickerLine}</li>
    </ul>
  )
}

function SpeedorderExtras({ snap }: { snap: BridgeAdapterSnapshot }) {
  const p = snap.speedorderPanel
  if (!p) return null
  return (
    <ul className="mt-1 space-y-0.5 border-t border-so-border/50 pt-1.5 text-[9px] leading-tight text-so-muted">
      <li className="text-so-text/90">engine: {p.engineStatus}</li>
      <li>registry: {p.registryCount} rows</li>
      <li className="break-all">sync: {p.marketSyncState}</li>
      <li className="line-clamp-2 break-all" title={p.marketSyncLine}>
        {p.marketSyncLine}
      </li>
      <li className="font-mono text-[8px] opacity-90">policy: {p.executionPolicy}</li>
    </ul>
  )
}

function OneaiExtras({ snap }: { snap: BridgeAdapterSnapshot }) {
  const p = snap.oneaiPanel
  if (!p) return null
  return (
    <ul className="mt-1 space-y-0.5 border-t border-so-border/50 pt-1.5 text-[9px] leading-tight text-so-muted">
      <li>
        strategies: <span className="font-semibold text-so-text">{p.strategyCount}</span>
      </li>
      <li>
        signals (24h): <span className="font-semibold text-so-text">{p.recentSignalCount}</span>
      </li>
      <li>agg winrate: {p.aggregateWinrate}</li>
      <li>agg pnl: {p.aggregatePnl}</li>
      <li>
        risk:{' '}
        <span className="uppercase text-so-warn">{p.riskLevel}</span> <span className="text-[8px]">(mock)</span>
      </li>
    </ul>
  )
}

function MockinvestExtras({ snap }: { snap: BridgeAdapterSnapshot }) {
  const p = snap.mockinvestPanel
  if (!p) return null
  return (
    <ul className="mt-1 space-y-0.5 border-t border-so-border/50 pt-1.5 text-[9px] leading-tight text-so-muted">
      <li>
        active tournaments:{' '}
        <span className="font-semibold text-so-text">{p.activeTournamentsCount}</span>
      </li>
      <li>participants (active rooms): {p.activeParticipantsTotal}</li>
      <li>top ranking rows: {p.topRankingCount}</li>
      <li title={p.rewardPoolsLine}>{p.rewardPoolsLine}</li>
      <li className="line-clamp-2" title={p.lifecycleLine}>
        {p.lifecycleLine}
      </li>
    </ul>
  )
}

function UteIntegrationStrip({ data }: { data: UteIntegrationSnapshot }) {
  return (
    <div className="mt-3 rounded-lg border border-so-border/80 bg-so-surface/50 px-2.5 py-2">
      <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-so-text">UTE integration (mock)</h3>
      <p className="mb-2 text-[9px] leading-snug text-so-muted">{data.headline}</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded border border-so-border/40 bg-so-bg/30 px-2 py-1.5 text-[9px] text-so-muted">
          <div className="mb-0.5 font-semibold text-so-text">TGX cex</div>
          <div>selected: {data.cex.selected}</div>
          <div>MD: {data.cex.marketData}</div>
          <div>
            pos {data.cex.positions} · ord {data.cex.orders} · last {data.cex.tickerLast.toFixed(2)}
          </div>
        </div>
        <div className="rounded border border-so-border/40 bg-so-bg/30 px-2 py-1.5 text-[9px] text-so-muted">
          <div className="mb-0.5 font-semibold text-so-text">OneAI strategies</div>
          <div>registry: {data.oneai.registryCount} · backtests: {data.oneai.backtestCount}</div>
          <div>
            signals/24h: {data.oneai.recentSignalCount} · WR {data.oneai.winratePct.toFixed(1)}% (mock)
          </div>
          <div>
            pnl: {data.oneai.pnlMock >= 0 ? '+' : ''}
            {data.oneai.pnlMock.toFixed(0)} USD (mock) · risk{' '}
            <span className="uppercase text-so-warn">{data.oneai.riskLevel}</span>
          </div>
        </div>
        <div className="rounded border border-so-border/40 bg-so-bg/30 px-2 py-1.5 text-[9px] text-so-muted">
          <div className="mb-0.5 font-semibold text-so-text">MockInvest tournaments</div>
          <div>
            active: {data.mockinvest.activeTournaments} · participants: {data.mockinvest.participants}
          </div>
          <div>
            rankings: {data.mockinvest.topRankings} · pools: {data.mockinvest.rewardPoolCount} · remaining ~{' '}
            {Math.round(data.mockinvest.rewardRemainingMock).toLocaleString('en-US')} (mock)
          </div>
          <div className="line-clamp-2 font-mono text-[8px]" title={data.mockinvest.lifecycleSummary}>
            lifecycle: {data.mockinvest.lifecycleSummary}
          </div>
          <div>upcoming events: {data.mockinvest.upcomingEvents}</div>
        </div>
        <div className="rounded border border-so-border/40 bg-so-bg/30 px-2 py-1.5 text-[9px] text-so-muted">
          <div className="mb-0.5 font-semibold text-so-text">TetherGet P2P (ute-surface)</div>
          <div>schema: {data.tetherget.schemaVersion}</div>
          <div>
            P2P rows {data.tetherget.p2pOrderCount} · open {data.tetherget.ordersOpen} · escrow↑{' '}
            {data.tetherget.escrowLocked}
          </div>
          <div>
            disputes~{data.tetherget.disputesOpen} · ref pending {data.tetherget.referralsPending}
          </div>
          <div className="line-clamp-2 font-mono text-[8px]" title={data.tetherget.summaryLine}>
            {data.tetherget.summaryLine}
          </div>
        </div>
        <div className="rounded border border-so-border/40 bg-so-bg/30 px-2 py-1.5 text-[9px] text-so-muted">
          <div className="mb-0.5 font-semibold text-so-text">SpeedOrder vendor</div>
          <div>engine: {data.speedOrder.engine}</div>
          <div>registry: {data.speedOrder.registryCount}</div>
          <div>sync: {data.speedOrder.marketSyncState}</div>
          <div className="truncate font-mono text-[8px]" title={data.speedOrder.marketSyncLine}>
            {data.speedOrder.marketSyncLine}
          </div>
        </div>
      </div>
      <p className="mt-1.5 text-[8px] text-so-muted/80">
        snapshot asOf: {new Date(data.asOf).toLocaleString('ko-KR', { hour12: false })}
      </p>
    </div>
  )
}

function Card({ snap }: { snap: BridgeAdapterSnapshot }) {
  const setBridgeDisabled = useBridgeDashboardStore((s) => s.setBridgeDisabled)
  const isDisabled = snap.dashboardStatus === 'disabled'
  return (
    <div
      className={`flex min-w-0 flex-col gap-1.5 rounded-lg border px-2.5 py-2 ${STATUS_TONE[snap.dashboardStatus]}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-[11px] font-semibold text-so-text">{snap.displayName}</div>
          <div className="truncate font-mono text-[9px] opacity-80">{snap.productCode}</div>
        </div>
        <span className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wide">
          {STATUS_LABEL[snap.dashboardStatus]}
        </span>
      </div>
      <p className="line-clamp-2 text-[10px] leading-snug text-so-muted">{snap.capabilitiesSummary}</p>
      <div className="flex flex-wrap items-center gap-1 text-[9px] text-so-muted">
        <span>transport: {snap.connectionStatus}</span>
        <span>·</span>
        <span>source: {snap.dataSource}</span>
        <span>·</span>
        <span title="mock fallback 종류">{FALLBACK_LABEL[snap.mockFallback]}</span>
        {snap.lastError ? (
          <>
            <span>·</span>
            <span className="text-so-ask" title={snap.lastError.message}>
              {snap.lastError.code}
            </span>
          </>
        ) : null}
      </div>
      {snap.id === 'tetherget' ? <TethergetExtras snap={snap} /> : null}
      {snap.id === 'tgx' ? <TgxExtras snap={snap} /> : null}
      {snap.id === 'oneai' ? <OneaiExtras snap={snap} /> : null}
      {snap.id === 'mockinvest' ? <MockinvestExtras snap={snap} /> : null}
      {snap.id === 'speedorder' ? <SpeedorderExtras snap={snap} /> : null}
      <label className="mt-1 flex cursor-pointer items-center gap-2 text-[10px] text-so-text">
        <input
          type="checkbox"
          className="accent-so-accent"
          checked={isDisabled}
          onChange={(e) => setBridgeDisabled(snap.id, e.target.checked)}
        />
        비활성 (데모)
      </label>
    </div>
  )
}

function SecurityAdminStrip({ bundle }: { bundle: SecurityAdminStatusBundle }) {
  const rows: { k: string; v: string }[] = [
    { k: 'admin', v: bundle.adminAccessStatus },
    { k: 'audit', v: bundle.auditLogStatus },
    { k: 'secrets', v: bundle.secretsStatus },
    { k: 'env', v: bundle.environmentMode },
    { k: 'maint', v: bundle.maintenanceMode },
    { k: 'region', v: bundle.regionRestrictionStatus },
    { k: 'rate', v: bundle.rateLimitStatus },
    { k: 'waf', v: bundle.wafStatus },
    { k: 'ip', v: bundle.ipAllowlistStatus },
  ]
  return (
    <div className="mt-3 rounded-lg border border-so-border bg-so-bg/40 px-2.5 py-2">
      <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-so-text">
        Security / Admin (mock)
      </h3>
      <p className="mb-2 text-[9px] text-so-muted">
        운영 보안 관측용 스키마만 준비됨 — 실 WAF/시크릿/프로덕션 연동 없음.
      </p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {rows.map((r) => (
          <div key={r.k} className="min-w-0 font-mono text-[9px] text-so-muted">
            <span className="text-so-muted/80">{r.k}</span>{' '}
            <span className="break-all text-so-text">{r.v}</span>
          </div>
        ))}
      </div>
      <p className="mt-1.5 text-[9px] text-so-muted/90">
        asOf: {new Date(bundle.asOf).toLocaleString('ko-KR', { hour12: false })}
      </p>
    </div>
  )
}

export function BridgeIntegrationPanel() {
  const goAdmin = useAppNavigation((s) => s.goAdmin)
  const panelOpen = useBridgeDashboardStore((s) => s.panelOpen)
  const snapshots = useBridgeDashboardStore((s) => s.snapshots)
  const refreshing = useBridgeDashboardStore((s) => s.refreshing)
  const refresh = useBridgeDashboardStore((s) => s.refresh)
  const setPanelOpen = useBridgeDashboardStore((s) => s.setPanelOpen)
  const lastProbeRunAt = useBridgeDashboardStore((s) => s.lastProbeRunAt)
  const securityAdmin = useBridgeDashboardStore((s) => s.securityAdmin)
  const uteIntegration = useBridgeDashboardStore((s) => s.uteIntegration)

  useEffect(() => {
    if (panelOpen) void refresh()
  }, [panelOpen, refresh])

  if (!panelOpen) return null

  const summary = selectBridgeSummaryText(snapshots)
  const probeLabel =
    lastProbeRunAt != null
      ? new Date(lastProbeRunAt).toLocaleString('ko-KR', { hour12: false })
      : '—'

  return (
    <section
      className="shrink-0 border-b border-so-border bg-so-surface-2/90 px-2 py-2 backdrop-blur-md lg:px-3"
      aria-label="외부 Bridge 통합 상태"
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-so-text">Integration bridges</h2>
          <p className="text-[10px] text-so-muted">
            {summary} · 실 API 미연동 · mock 전용 · 마지막 probe:{' '}
            <span className="font-mono text-so-text">{probeLabel}</span> ·{' '}
            <button
              type="button"
              className="text-so-accent underline-offset-2 hover:underline"
              onClick={() => setPanelOpen(false)}
            >
              닫기
            </button>
            {' · '}
            <button
              type="button"
              className="text-so-accent underline-offset-2 hover:underline"
              onClick={() => {
                setPanelOpen(false)
                goAdmin()
              }}
              title="읽기 전용 mock (/admin)"
            >
              관리자 대시보드
            </button>
          </p>
        </div>
        <button
          type="button"
          disabled={refreshing}
          onClick={() => void refresh()}
          className="rounded-md border border-so-border bg-so-bg/60 px-2 py-1 text-[10px] font-semibold text-so-text hover:bg-so-bg disabled:opacity-50"
        >
          {refreshing ? '새로고침…' : '새로고침'}
        </button>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {BRIDGE_ORDER.map((id) => (
          <Card key={id} snap={snapshots[id]} />
        ))}
      </div>
      {uteIntegration ? <UteIntegrationStrip data={uteIntegration} /> : null}
      <SecurityAdminStrip bundle={securityAdmin} />
    </section>
  )
}
