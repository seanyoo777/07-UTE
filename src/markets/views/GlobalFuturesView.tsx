import type { MarketId } from '../types'
import { UniversalMarketView } from './UniversalMarketView'

export function GlobalFuturesView({ onMarketChange }: { onMarketChange: (id: MarketId) => void }) {
  return (
    <UniversalMarketView
      marketId="global-futures"
      onMarketChange={onMarketChange}
      mobileHeaderSlot={
        <div className="flex items-center gap-2 text-[11px] text-so-muted">
          <span className="rounded-md bg-so-surface-2 px-2 py-0.5 text-so-text">CME · ICE</span>
          <span>NQ · ES · GC · CL — futures_contract 손익 공식</span>
        </div>
      }
    />
  )
}
