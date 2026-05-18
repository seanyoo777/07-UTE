import { Suspense, lazy, useEffect } from 'react'
import { UnifiedAdminDashboard } from './admin'
import { useAppNavigation } from './appNavigation'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import type { MarketId } from './markets/types'
import { shouldShowHtsTopBar, shouldShowPremiumShell } from './config/layoutUiGuards'
import { useEffectiveLayoutFlags } from './hooks/useEffectiveLayoutFlags'
import { UtePlatformShell } from './platform/UtePlatformShell'
import { HtsTopBar } from './shell/HtsTopBar'
import { UtePremiumTradingShell } from './shell/UtePremiumTradingShell'
import { useTradingStore } from './store/tradingStore'

const KrStockView = lazy(() =>
  import('./markets/views/KrStockView').then((m) => ({ default: m.KrStockView })),
)
const UsStockView = lazy(() =>
  import('./markets/views/UsStockView').then((m) => ({ default: m.UsStockView })),
)
const KrFuturesView = lazy(() =>
  import('./markets/views/KrFuturesView').then((m) => ({ default: m.KrFuturesView })),
)
const GlobalFuturesView = lazy(() =>
  import('./markets/views/GlobalFuturesView').then((m) => ({ default: m.GlobalFuturesView })),
)
const CryptoView = lazy(() =>
  import('./markets/views/CryptoView').then((m) => ({ default: m.CryptoView })),
)

function ViewFor({
  marketId,
  onMarketChange,
}: {
  marketId: MarketId
  onMarketChange: (id: MarketId) => void
}) {
  switch (marketId) {
    case 'kr-stock':
      return <KrStockView onMarketChange={onMarketChange} />
    case 'us-stock':
      return <UsStockView onMarketChange={onMarketChange} />
    case 'kr-futures':
      return <KrFuturesView onMarketChange={onMarketChange} />
    case 'global-futures':
      return <GlobalFuturesView onMarketChange={onMarketChange} />
    case 'crypto':
      return <CryptoView onMarketChange={onMarketChange} />
  }
}

function AppFallback() {
  return (
    <div className="flex flex-1 items-center justify-center text-sm text-so-muted">
      트레이딩 화면 로딩…
    </div>
  )
}

/**
 * HTS 전체 셸:
 *  - 상단: HtsTopBar (OneAI · 뉴스 · 시스템트레이딩 · 시장상태 · 어댑터상태)
 *  - 본문: UtePremiumTradingShell — 시장 탭(전 구간) + 데스크탑 사이드 mock 패널 + 기존 View
 */
export default function App() {
  const view = useAppNavigation((s) => s.view)
  const syncFromWindow = useAppNavigation((s) => s.syncFromWindow)
  const activeMarketId = useTradingStore((s) => s.activeMarketId)
  const setActiveMarket = useTradingStore((s) => s.setActiveMarket)
  const status = useTradingStore((s) => s.boards[activeMarketId].status)
  const layoutFlags = useEffectiveLayoutFlags()
  const showTopBar = shouldShowHtsTopBar(layoutFlags)
  const showPremiumShell = shouldShowPremiumShell(layoutFlags)

  useEffect(() => {
    syncFromWindow()
  }, [syncFromWindow])

  useEffect(() => {
    const onPop = () => syncFromWindow()
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [syncFromWindow])

  if (view === 'admin') {
    return (
      <ErrorBoundary
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-so-bg p-6 text-red-300">
            관리자 화면 오류. 콘솔을 확인하세요.
          </div>
        }
      >
        <UtePlatformShell>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <UnifiedAdminDashboard />
          </div>
        </UtePlatformShell>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-so-bg p-6 text-red-300">
          앱 수준 오류가 발생했습니다. 콘솔을 확인하세요.
        </div>
      }
    >
      <UtePlatformShell activeMarketId={activeMarketId} adapterStatus={status}>
        <div className="flex h-full min-h-0 flex-col">
          {showTopBar ? <HtsTopBar marketId={activeMarketId} status={status} /> : null}
          <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-so-bg">
            {showPremiumShell ? (
              <UtePremiumTradingShell activeMarketId={activeMarketId} onMarketChange={setActiveMarket}>
                <Suspense fallback={<AppFallback />}>
                  <ViewFor marketId={activeMarketId} onMarketChange={setActiveMarket} />
                </Suspense>
              </UtePremiumTradingShell>
            ) : (
              <Suspense fallback={<AppFallback />}>
                <ViewFor marketId={activeMarketId} onMarketChange={setActiveMarket} />
              </Suspense>
            )}
          </main>
        </div>
      </UtePlatformShell>
    </ErrorBoundary>
  )
}
