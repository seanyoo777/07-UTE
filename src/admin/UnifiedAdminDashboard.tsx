import { useCallback, useEffect, useMemo } from 'react'
import { useAppNavigation } from '../appNavigation'
import { useBridgeDashboardStore } from '../bridges'
import { BRIDGE_ORDER } from '../bridges/shared/bridgeTypes'
import { useAdminAccessStore } from './adminAccessStore'
import { ADMIN_ROLE_DISPLAY, getCapabilitiesForRole } from './adminAccessPolicy'
import { buildMockAdminNotifications } from './adminNotificationTypes'
import { buildAdminExportPayloadBase, maskAdminExportPayload } from './adminSnapshotExport'
import { buildAdminSystemHealthSnapshot } from './adminSystemHealth'
import { AdminAuditLogPanel } from './AdminAuditLogPanel'
import { AdminBridgeHealthTable } from './AdminBridgeHealthTable'
import { AdminDangerZonePanel } from './AdminDangerZonePanel'
import { AdminMetricCard } from './AdminMetricCard'
import { AdminNotificationCenter } from './AdminNotificationCenter'
import { AdminPermissionSummaryCard } from './AdminPermissionSummaryCard'
import { AdminRiskAlertList } from './AdminRiskAlertList'
import { AdminSecurityStrip } from './AdminSecurityStrip'
import { AdminSelfTestCenterPanel } from './AdminSelfTestCenterPanel'
import { AdminSystemHealthPanel } from './AdminSystemHealthPanel'
import { buildAdminRiskAlerts } from './buildAdminRiskAlerts'
import {
  shouldEnableGlobalDiagnosticsCenter,
  shouldEnableIncidentReview,
  shouldEnableProposalQueue,
  shouldEnableOperationsTimeline,
  shouldEnableRiskGraph,
  shouldEnableWhitelabelPresets,
  shouldEnableWhitelabelAdminConfig,
  shouldEnableWhitelabelPreviewCenter,
} from '../config/layoutUiGuards'
import { useEffectiveLayoutFlags } from '../hooks/useEffectiveLayoutFlags'
import { resolveWhitelabelShellClasses } from '../whitelabel/resolveWhitelabelClasses'
import { TenantAdminConfigConsole } from '../whitelabel/admin/TenantAdminConfigConsole'
import { TenantPreviewCenter } from '../whitelabel/preview/TenantPreviewCenter'
import { useTenantWhitelabelStore } from '../whitelabel/tenantWhitelabelStore'
import { GlobalDiagnosticsCenterPanel } from '../platform/globalDiagnostics/GlobalDiagnosticsCenterPanel'
import { IncidentReviewBoard } from '../platform/incidentReview/IncidentReviewBoard'
import { ProposalQueueBoard } from '../platform/proposalQueue/ProposalQueueBoard'
import { OperationsTimelineBoard } from '../platform/operationsTimeline/OperationsTimelineBoard'
import { CrossAppRiskGraphBoard } from '../platform/riskGraph/CrossAppRiskGraphBoard'
import { useUnifiedEventStore } from '../platform/unifiedEventStore'

let adminSessionHydrated = false

/**
 * 통합 관리자 대시보드 — mock RBAC·감사·알림·헬스·보내기 마스킹(3차). 실 주문·송금·정산 없음.
 */
export function UnifiedAdminDashboard() {
  const goTradingNav = useAppNavigation((s) => s.goTrading)
  const role = useAdminAccessStore((s) => s.role)
  const auditLog = useAdminAccessStore((s) => s.auditLog)
  const log = useAdminAccessStore((s) => s.log)
  const unifiedEvents = useUnifiedEventStore((s) => s.events)
  const unifiedEventCount = unifiedEvents.length
  const layoutFlags = useEffectiveLayoutFlags()
  const showGlobalDiagnostics = shouldEnableGlobalDiagnosticsCenter(layoutFlags)
  const showIncidentReview = shouldEnableIncidentReview(layoutFlags)
  const showProposalQueue = shouldEnableProposalQueue(layoutFlags)
  const showRiskGraph = shouldEnableRiskGraph(layoutFlags)
  const showOperationsTimeline = shouldEnableOperationsTimeline(layoutFlags)
  const whitelabelEnabled = shouldEnableWhitelabelPresets(layoutFlags)
  const showWhitelabelPreview = shouldEnableWhitelabelPreviewCenter(layoutFlags)
  const showWhitelabelAdminConfig = shouldEnableWhitelabelAdminConfig(layoutFlags)
  const whitelabelPreset = useTenantWhitelabelStore((s) => s.preset)
  const { adminShellClass } = resolveWhitelabelShellClasses(whitelabelPreset)

  const snapshots = useBridgeDashboardStore((s) => s.snapshots)
  const securityAdmin = useBridgeDashboardStore((s) => s.securityAdmin)
  const uteIntegration = useBridgeDashboardStore((s) => s.uteIntegration)
  const lastProbeRunAt = useBridgeDashboardStore((s) => s.lastProbeRunAt)
  const refreshing = useBridgeDashboardStore((s) => s.refreshing)
  const refresh = useBridgeDashboardStore((s) => s.refresh)

  const caps = useMemo(() => getCapabilitiesForRole(role), [role])

  const latestBridgeUpdatedAt = useMemo(
    () => Math.max(...BRIDGE_ORDER.map((id) => snapshots[id].updatedAt)),
    [snapshots],
  )

  const healthAsOf = lastProbeRunAt ?? uteIntegration?.asOf ?? latestBridgeUpdatedAt

  const health = useMemo(
    () =>
      buildAdminSystemHealthSnapshot({
        snapshots,
        securityAdmin,
        integration: uteIntegration,
        lastProbeRunAt,
        asOf: healthAsOf,
      }),
    [snapshots, securityAdmin, uteIntegration, lastProbeRunAt, healthAsOf],
  )

  const notifications = useMemo(
    () =>
      buildMockAdminNotifications({
        snapshots,
        securityAdmin,
        integration: uteIntegration,
        health,
      }),
    [snapshots, securityAdmin, uteIntegration, health],
  )

  useEffect(() => {
    if (adminSessionHydrated) return
    adminSessionHydrated = true
    useAdminAccessStore.getState().log({
      action: 'view_admin',
      resource: '/admin',
      result: 'ok',
      detail: 'UnifiedAdminDashboard mount',
    })
    void useBridgeDashboardStore.getState().refresh().then(() => {
      useAdminAccessStore.getState().log({
        action: 'bootstrap_snapshot',
        resource: 'useBridgeDashboardStore',
        result: 'ok',
        detail: 'initial hydrate',
      })
    })
  }, [])

  const bridgeAgg = useMemo(() => {
    let connected = 0
    let errors = 0
    let disabled = 0
    for (const id of BRIDGE_ORDER) {
      const st = snapshots[id].dashboardStatus
      if (st === 'connected') connected++
      else if (st === 'error') errors++
      else if (st === 'disabled') disabled++
    }
    return { connected, errors, disabled, total: BRIDGE_ORDER.length }
  }, [snapshots])

  const alerts = useMemo(
    () => buildAdminRiskAlerts(snapshots, securityAdmin, uteIntegration),
    [snapshots, securityAdmin, uteIntegration],
  )

  const ix = uteIntegration
  const tg = ix?.tetherget
  const tgPanel = snapshots.tetherget.tethergetPanel
  const tethergetKpi =
    tg != null
      ? `${tg.ordersOpen} open · ${tg.escrowLocked} escrow · ~${tg.disputesOpen} disp · ref ${tg.referralsPending}`
      : tgPanel != null
        ? `${tgPanel.p2pCount} rows · ${tgPanel.escrowLockedCount} escrow · ${tgPanel.disputeCount} disp · fb ${tgPanel.fallbackState}`
        : '—'

  const cexKpi =
    ix != null
      ? `${ix.cex.selected} · MD ${ix.cex.marketData} · pos ${ix.cex.positions} ord ${ix.cex.orders}`
      : snapshots.tgx.tgxPanel != null
        ? `${snapshots.tgx.tgxPanel.selectedSymbolLine} · MD ${snapshots.tgx.tgxPanel.marketDataStatus}`
        : '—'

  const oneaiKpi =
    ix != null
      ? `${ix.oneai.strategyCount} strat · ${ix.oneai.recentSignalCount} sig/24h · WR ${ix.oneai.winratePct.toFixed(1)}% · risk ${ix.oneai.riskLevel}`
      : snapshots.oneai.oneaiPanel != null
        ? `${snapshots.oneai.oneaiPanel.strategyCount} strat · ${snapshots.oneai.oneaiPanel.recentSignalCount} sig/24h · ${snapshots.oneai.oneaiPanel.riskLevel}`
        : '—'

  const miKpi =
    ix != null
      ? `${ix.mockinvest.activeTournaments} rooms · ${ix.mockinvest.participants} participants · ${ix.mockinvest.topRankings} ranks`
      : snapshots.mockinvest.mockinvestPanel != null
        ? `${snapshots.mockinvest.mockinvestPanel.activeTournamentsCount} rooms · ${snapshots.mockinvest.mockinvestPanel.activeParticipantsTotal} participants`
        : '—'

  const soKpi =
    ix != null
      ? `${ix.speedOrder.engine} · reg ${ix.speedOrder.registryCount} · ${ix.speedOrder.marketSyncState}`
      : snapshots.speedorder.speedorderPanel != null
        ? `${snapshots.speedorder.speedorderPanel.engineStatus} · reg ${snapshots.speedorder.speedorderPanel.registryCount}`
        : '—'

  const bridgeKpiTone: 'bid' | 'warn' | 'ask' | 'muted' =
    bridgeAgg.errors > 0 ? 'ask' : bridgeAgg.connected === bridgeAgg.total - bridgeAgg.disabled ? 'bid' : 'warn'

  const probeLabel =
    lastProbeRunAt != null
      ? new Date(lastProbeRunAt).toLocaleString('ko-KR', { hour12: false })
      : '— (새로고침 후 갱신)'

  const onRefreshClick = useCallback(() => {
    if (!caps.canRefreshProbe) return
    void refresh().then(() =>
      log({
        action: 'refresh_probe',
        resource: 'bridgeProbeRunner',
        result: 'ok',
      }),
    )
  }, [caps.canRefreshProbe, log, refresh])

  const onExportSnapshot = useCallback(async () => {
    if (!caps.canExportSnapshot) return
    const b = useBridgeDashboardStore.getState()
    const raw = buildAdminExportPayloadBase({
      role: useAdminAccessStore.getState().role,
      bridges: b.snapshots,
      uteIntegration: b.uteIntegration,
      securityAdmin: b.securityAdmin,
    })
    const masked = maskAdminExportPayload(raw)
    const text = JSON.stringify(masked, null, 2)
    try {
      await navigator.clipboard.writeText(text)
      log({
        action: 'export_snapshot_masked',
        resource: 'clipboard',
        result: 'ok',
        detail: `masked ${text.length} chars · schema ${String(masked.schemaVersion)}`,
      })
    } catch (err) {
      log({
        action: 'export_snapshot',
        resource: 'clipboard',
        result: 'skipped',
        detail: err instanceof Error ? err.message : String(err),
      })
    }
  }, [caps.canExportSnapshot, log])

  const onGoTrading = useCallback(() => {
    log({ action: 'navigate_trading', resource: '/', result: 'ok' })
    goTradingNav()
  }, [goTradingNav, log])

  return (
    <div
      className={`flex min-h-0 flex-1 flex-col overflow-auto text-so-text ${whitelabelEnabled ? adminShellClass : 'bg-so-bg'}`}
      data-ute-admin={whitelabelEnabled ? whitelabelPreset.admin : undefined}
    >
      <header className="sticky top-0 z-10 border-b border-so-border bg-so-surface-2/95 px-3 py-2 backdrop-blur-md lg:px-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-so-text">통합 관리자 대시보드</h1>
              <span
                className="rounded border border-so-accent/50 bg-so-accent/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-so-accent"
                title="mock RBAC — IdP 없음"
              >
                {ADMIN_ROLE_DISPLAY[role]}
              </span>
              <span className="rounded border border-so-warn/40 bg-so-warn/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-so-warn">
                mock · read-only
              </span>
            </div>
            <p className="mt-0.5 text-[10px] text-so-muted">
              RBAC·감사·알림·헬스(mock) — 스냅샷 보내기는 마스킹 후 클립보드만. 설정/위험 액션 없음.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={refreshing || !caps.canRefreshProbe}
              title={!caps.canRefreshProbe ? 'canRefreshProbe=false (역할 readonly 등)' : undefined}
              onClick={() => void onRefreshClick()}
              className="rounded-md border border-so-border bg-so-bg/70 px-2.5 py-1 text-[10px] font-semibold text-so-text hover:bg-so-bg disabled:cursor-not-allowed disabled:opacity-45"
            >
              {refreshing ? '스냅샷…' : '스냅샷 새로고침'}
            </button>
            <button
              type="button"
              disabled={!caps.canExportSnapshot}
              title={
                !caps.canExportSnapshot
                  ? 'canExportSnapshot=false — JSON 보내기는 platform_admin 등에서만 활성'
                  : '마스킹 적용 후 클립보드 JSON (서버 전송 없음)'
              }
              onClick={() => void onExportSnapshot()}
              className="rounded-md border border-so-border bg-so-bg/70 px-2.5 py-1 text-[10px] font-semibold text-so-text hover:bg-so-bg disabled:cursor-not-allowed disabled:opacity-45"
            >
              스냅샷 보내기
            </button>
            <button
              type="button"
              onClick={onGoTrading}
              className="rounded-md border border-so-accent/40 bg-so-accent/10 px-2.5 py-1 text-[10px] font-semibold text-so-accent hover:bg-so-accent/20"
            >
              트레이딩으로
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl flex-1 space-y-5 px-3 py-4 lg:px-4">
        <AdminPermissionSummaryCard role={role} caps={caps} />

        <section aria-label="System health" className="space-y-2">
          <AdminSystemHealthPanel health={health} />
        </section>

        <section aria-label="Self-test center" className="space-y-2">
          <AdminSelfTestCenterPanel
            bridgeErrorCount={bridgeAgg.errors}
            auditEntryCount={auditLog.length}
            unifiedEventCount={unifiedEventCount}
            probeToken={lastProbeRunAt}
          />
        </section>

        {showWhitelabelPreview ? (
          <section aria-label="Tenant preview center" className="space-y-2">
            <TenantPreviewCenter />
          </section>
        ) : null}

        {showWhitelabelAdminConfig ? (
          <section aria-label="Tenant admin config console" className="space-y-2">
            <TenantAdminConfigConsole />
          </section>
        ) : null}

        {showGlobalDiagnostics ? (
          <section aria-label="Global diagnostics center" className="space-y-2">
            <GlobalDiagnosticsCenterPanel bridgeErrorCount={bridgeAgg.errors} />
          </section>
        ) : null}

        {showIncidentReview ? (
          <section aria-label="AI incident review" className="space-y-2">
            <IncidentReviewBoard unifiedEvents={unifiedEvents} />
          </section>
        ) : null}

        {showProposalQueue ? (
          <section aria-label="AI proposal queue" className="space-y-2">
            <ProposalQueueBoard />
          </section>
        ) : null}

        {showRiskGraph ? (
          <section aria-label="Cross-app risk graph" className="space-y-2">
            <CrossAppRiskGraphBoard bridgeErrorCount={bridgeAgg.errors} />
          </section>
        ) : null}

        {showOperationsTimeline ? (
          <section aria-label="Global operations timeline" className="space-y-2">
            <OperationsTimelineBoard bridgeErrorCount={bridgeAgg.errors} />
          </section>
        ) : null}

        <section aria-label="Notifications" className="space-y-2">
          <AdminNotificationCenter items={notifications} />
        </section>

        {ix?.headline ? (
          <p className="rounded-lg border border-so-border/60 bg-so-surface/40 px-3 py-2 text-[10px] leading-snug text-so-muted">
            <span className="font-semibold text-so-text">Headline · </span>
            {ix.headline}
          </p>
        ) : null}

        <section aria-label="KPI cards">
          <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-so-muted">상단 KPI</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <AdminMetricCard
              label="Bridge health"
              value={`${bridgeAgg.connected}/${bridgeAgg.total} OK`}
              hint={
                bridgeAgg.errors > 0
                  ? `오류 ${bridgeAgg.errors} · 비활성 ${bridgeAgg.disabled} — 카드는 스냅샷 기준`
                  : `비활성 ${bridgeAgg.disabled} — mock 프로브 결과`
              }
              tone={bridgeKpiTone}
            />
            <AdminMetricCard label="TGX / CEX" value={cexKpi} hint="selected · marketData · pos/ord" tone="default" />
            <AdminMetricCard label="OneAI" value={oneaiKpi} hint="strategy · signal · risk" tone="default" />
            <AdminMetricCard label="MockInvest" value={miKpi} hint="tournaments · participants · rankings" tone="default" />
            <AdminMetricCard label="TetherGet P2P" value={tethergetKpi} hint="ute-surface 요약 · BRG 패널 보조" tone="default" />
            <AdminMetricCard label="SpeedOrder" value={soKpi} hint="engine · registry · sync" tone="default" />
          </div>
        </section>

        <section aria-label="Bridge table">
          <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-so-muted">Bridge health</h2>
          <AdminBridgeHealthTable snapshots={snapshots} />
        </section>

        <section aria-label="Risk alerts">
          <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-so-muted">Risk · 관측 알림</h2>
          <AdminRiskAlertList alerts={alerts} />
        </section>

        <section aria-label="Audit log">
          <AdminAuditLogPanel entries={auditLog} />
        </section>

        <section aria-label="Security admin">
          <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-so-muted">Security / Admin</h2>
          {caps.canViewSecurity ? (
            <AdminSecurityStrip bundle={securityAdmin} />
          ) : (
            <p className="rounded-lg border border-so-border/60 bg-so-bg/40 px-3 py-3 text-[11px] text-so-muted">
              Security/Admin 영역은 현재 역할에서 비활성(mock RBAC).
            </p>
          )}
        </section>

        <section aria-label="Danger zone">
          <AdminDangerZonePanel />
        </section>

        <footer className="border-t border-so-border/60 pt-3 text-[10px] text-so-muted">
          <p>
            마지막 전체 프로브: <span className="font-mono text-so-text">{probeLabel}</span>
          </p>
          <p className="mt-1 text-[9px] text-so-muted/90">
            통합 스냅샷 asOf:{' '}
            {ix != null ? (
              <span className="font-mono text-so-text">
                {new Date(ix.asOf).toLocaleString('ko-KR', { hour12: false })}
              </span>
            ) : (
              '—'
            )}
          </p>
        </footer>
      </div>
    </div>
  )
}
