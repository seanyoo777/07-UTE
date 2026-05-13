import type { MarketId } from '../types'
import { UniversalMarketView } from './UniversalMarketView'

export function KrFuturesView({ onMarketChange }: { onMarketChange: (id: MarketId) => void }) {
  return (
    <UniversalMarketView
      marketId="kr-futures"
      onMarketChange={onMarketChange}
      mobileHeaderSlot={
        <div className="flex items-center gap-2 text-[11px] text-so-muted">
          <span className="rounded-md bg-so-surface-2 px-2 py-0.5 text-so-text">선물 세션</span>
          <span>증거금·만기는 SymbolSpec.tickValue / contractSize 기준 계산</span>
        </div>
      }
    />
  )
}
