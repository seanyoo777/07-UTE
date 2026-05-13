import type { TickerRow } from '../../core/domain/trading'
import { formatPct, formatPrice } from '../../core/utils/format'

type Props = {
  tickers: TickerRow[]
  activeSymbol: string
  priceDecimals: number
  onSelect: (symbol: string) => void
}

export function TickerBar({ tickers, activeSymbol, priceDecimals, onSelect }: Props) {
  return (
    <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-b border-so-border bg-so-surface px-2 py-2">
      {tickers.length === 0 ? (
        <span className="px-2 text-xs text-so-muted">티커를 불러오는 중…</span>
      ) : null}
      {tickers.map((t) => {
        const isActive = t.symbol === activeSymbol
        const positive = t.changePct >= 0
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.symbol)}
            className={[
              'flex shrink-0 flex-col rounded-md border px-3 py-1.5 text-left transition-colors',
              isActive
                ? 'border-so-accent bg-so-accent/10 text-so-text'
                : 'border-so-border bg-so-surface-2 text-so-muted hover:border-so-border-2 hover:text-so-text',
            ].join(' ')}
            aria-pressed={isActive}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
              {t.displayName}
            </span>
            <span className="flex items-baseline gap-2 text-[12px] font-semibold">
              <span className="text-so-text">{formatPrice(t.price, priceDecimals)}</span>
              <span className={positive ? 'text-so-bid' : 'text-so-ask'}>
                {formatPct(t.changePct)}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
