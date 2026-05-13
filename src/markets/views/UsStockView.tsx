import type { MarketId } from '../types'
import { UniversalMarketView } from './UniversalMarketView'

export function UsStockView({ onMarketChange }: { onMarketChange: (id: MarketId) => void }) {
  return (
    <UniversalMarketView
      marketId="us-stock"
      onMarketChange={onMarketChange}
      mobileHeaderSlot={
        <div className="flex items-center gap-2 text-[11px] text-so-muted">
          <span className="rounded-md bg-so-surface-2 px-2 py-0.5 text-so-text">USD</span>
          <span>프리/포스트 마켓 세션 토글은 다음 단계</span>
        </div>
      }
    />
  )
}
