import { Suspense, lazy } from 'react'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import type { MarketId } from './markets/types'
import { HtsTopBar } from './shell/HtsTopBar'
import { MarketTabs } from './shell/MarketTabs'
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
 *  - 모바일에서만: MarketTabs (가로 스크롤) — 데스크탑은 좌측 사이드바가 대체
 *  - 본문: 활성 시장 View
 */
export default function App() {
  const activeMarketId = useTradingStore((s) => s.activeMarketId)
  const setActiveMarket = useTradingStore((s) => s.setActiveMarket)
  const status = useTradingStore((s) => s.boards[activeMarketId].status)

  return (
    <ErrorBoundary
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-so-bg p-6 text-red-300">
          앱 수준 오류가 발생했습니다. 콘솔을 확인하세요.
        </div>
      }
    >
      <div className="flex h-full min-h-0 flex-col">
        <HtsTopBar marketId={activeMarketId} status={status} />
        <div className="lg:hidden">
          <MarketTabs active={activeMarketId} onChange={setActiveMarket} />
        </div>
        <main className="flex min-h-0 flex-1 flex-col">
          <Suspense fallback={<AppFallback />}>
            <ViewFor marketId={activeMarketId} onMarketChange={setActiveMarket} />
          </Suspense>
        </main>
      </div>
    </ErrorBoundary>
  )
}
