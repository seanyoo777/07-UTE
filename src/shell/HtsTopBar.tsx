import { useAppNavigation } from '../appNavigation'
import { BridgeIntegrationPanel } from '../components/bridge/BridgeIntegrationPanel'
import { getCategoryConfig } from '../config/categoryConfig'
import { MOCK_USD_KRW_RATE } from '../core/fx/mockUsdKrw'
import { selectBridgeSummaryText, useBridgeDashboardStore } from '../bridges'
import type { MarketId } from '../markets/types'
import type { AdapterStatus } from '../store/types'
import { MarketStateBadge } from '../components/status/MarketStateBadge'
import { NewsTicker } from '../components/status/NewsTicker'
import { OneAiBadge } from '../components/status/OneAiBadge'
import { SystemTradingStatus } from '../components/status/SystemTradingStatus'
import { UserStatusBadge } from '../components/status/UserStatusBadge'

type Props = {
  marketId: MarketId
  status: AdapterStatus
}

const STATUS_TONE: Record<AdapterStatus, string> = {
  idle: 'bg-so-border/40 text-so-muted',
  connecting: 'bg-so-warn/15 text-so-warn',
  ready: 'bg-so-bid/15 text-so-bid',
  error: 'bg-so-ask/15 text-so-ask',
}

const STATUS_LABEL: Record<AdapterStatus, string> = {
  idle: '대기',
  connecting: '연결중',
  ready: '연결됨',
  error: '오류',
}

/**
 * HTS 상단 상태바 (2026 다크 HTS 톤).
 *
 * 좌: UTX 로고 + 활성 카테고리 배지
 * 중: OneAI 신호 + 뉴스 티커
 * 우: 시스템트레이딩 / 시장 세션 / 어댑터 연결 / Bridge(BRG) / 사용자 상태
 */
export function HtsTopBar({ marketId, status }: Props) {
  const config = getCategoryConfig(marketId)
  const goAdmin = useAppNavigation((s) => s.goAdmin)
  const toggleBridgePanel = useBridgeDashboardStore((s) => s.togglePanel)
  const bridgePanelOpen = useBridgeDashboardStore((s) => s.panelOpen)
  const bridgeSnapshots = useBridgeDashboardStore((s) => s.snapshots)
  const bridgeSummary = selectBridgeSummaryText(bridgeSnapshots)

  return (
    <>
      <header className="relative flex shrink-0 items-center gap-2 border-b border-so-border bg-gradient-to-b from-so-surface-2 via-so-surface to-so-surface px-2 py-1.5 backdrop-blur-md lg:px-3 lg:py-2">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-so-accent/30 to-transparent" />

      <div className="flex shrink-0 items-center gap-2">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-md text-[11px] font-bold text-white shadow-[0_0_10px_rgba(59,130,246,0.35)]"
          style={{ backgroundColor: config.accentColor }}
        >
          UTX
        </div>
        <div className="hidden flex-col leading-tight md:flex">
          <span className="text-[12px] font-semibold text-so-text">Universal Trading Exchange</span>
          <span className="text-[9px] uppercase tracking-[0.18em] text-so-muted">
            HTS · mock · multi-asset
          </span>
        </div>
        <span
          className="ml-1 shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold text-white shadow-sm"
          style={{ backgroundColor: `${config.accentColor}cc` }}
          title={config.orderLogicHint}
        >
          {config.label}
        </span>
      </div>

      <div className="hidden min-w-0 flex-1 items-center gap-2 md:flex">
        {config.hasOneAiSignal ? <OneAiBadge key={marketId} marketId={marketId} /> : null}
        {config.hasNewsFeed ? <NewsTicker key={marketId} marketId={marketId} /> : null}
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        {config.hasSystemTrading ? <SystemTradingStatus key={marketId} marketId={marketId} /> : null}
        <span
          className="hidden shrink-0 rounded-md border border-so-border bg-so-bg/50 px-2 py-1 text-[10px] text-so-muted xl:inline"
          title="실시간 환율 API 미연동 — 당일 mock 환율"
        >
          USD/KRW <span className="font-semibold text-so-text">{MOCK_USD_KRW_RATE.toLocaleString('ko-KR')}</span>
          <span className="ml-1 text-[9px] opacity-80">(mock)</span>
        </span>
        <MarketStateBadge config={config} />
        <span
          className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${STATUS_TONE[status]}`}
          aria-live="polite"
        >
          {STATUS_LABEL[status]}
        </span>
        <button
          type="button"
          onClick={() => goAdmin()}
          className="inline-flex shrink-0 rounded-md border border-so-border bg-so-bg/50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-so-muted hover:border-so-accent/40 hover:text-so-accent"
          title="통합 관리자 대시보드 (mock · 읽기 전용 · /admin)"
        >
          ADM
        </button>
        <button
          type="button"
          onClick={() => toggleBridgePanel()}
          aria-expanded={bridgePanelOpen}
          className={`inline-flex shrink-0 rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${
            bridgePanelOpen ? 'border-so-accent/60 bg-so-accent/15 text-so-accent' : 'border-so-border bg-so-bg/50 text-so-muted'
          }`}
          title={`외부 Bridge 통합 (mock 전용) — ${bridgeSummary}`}
        >
          BRG
        </button>
        <UserStatusBadge />
      </div>
    </header>
      <BridgeIntegrationPanel />
    </>
  )
}
