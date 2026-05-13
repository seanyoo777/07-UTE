import type { MarketId } from '../types'
import { UniversalMarketView } from './UniversalMarketView'

export function KrStockView({ onMarketChange }: { onMarketChange: (id: MarketId) => void }) {
  return (
    <UniversalMarketView
      marketId="kr-stock"
      onMarketChange={onMarketChange}
      mobileHeaderSlot={
        <div className="flex items-center gap-2 text-[11px] text-so-muted">
          <span className="rounded-md bg-so-surface-2 px-2 py-0.5 text-so-text">정규장</span>
          <span>호가 단위·상하한가는 종목별 SymbolSpec에서 자동 반영</span>
        </div>
      }
    />
  )
}
