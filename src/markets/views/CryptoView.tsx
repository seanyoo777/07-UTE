import type { MarketId } from '../types'
import { UniversalMarketView } from './UniversalMarketView'

export function CryptoView({ onMarketChange }: { onMarketChange: (id: MarketId) => void }) {
  return (
    <UniversalMarketView
      marketId="crypto"
      onMarketChange={onMarketChange}
      mobileHeaderSlot={
        <div className="flex items-center gap-2 text-[11px] text-so-muted">
          <span className="rounded-md bg-so-surface-2 px-2 py-0.5 text-so-text">24h</span>
          <span>USDT 영구선물 mock — 레버리지·청산가 다음 단계</span>
        </div>
      }
    />
  )
}
