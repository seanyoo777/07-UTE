import type { ReactNode } from 'react'
import type { MarketId } from '../markets/types'
import type { AdapterStatus } from '../store/types'
import { MarketTabs } from './MarketTabs'
import { TopBar } from './TopBar'

type Props = {
  activeMarket: MarketId
  adapterStatus: AdapterStatus
  onMarketChange: (id: MarketId) => void
  children: ReactNode
}

/**
 * 최상위 셸: 헤더 + 시장 탭 + 활성 시장 콘텐츠.
 * - 콘텐츠 영역은 flex 1로 늘어남
 * - 모바일에서도 탭은 항상 노출 (가로 스크롤)
 */
export function AppShell({ activeMarket, adapterStatus, onMarketChange, children }: Props) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <TopBar marketId={activeMarket} status={adapterStatus} />
      <MarketTabs active={activeMarket} onChange={onMarketChange} />
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  )
}
