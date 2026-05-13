import type { OrderBookSnapshot } from '../../core/domain/trading'
import type { SymbolSpec } from '../../core/symbols/SymbolSpec'
import { formatPrice, formatQty } from '../../core/utils/format'
import { PanelShell } from '../common/PanelShell'

type Props = {
  book: OrderBookSnapshot
  spec: SymbolSpec | undefined
  lastPrice: number
}

const MAX_ROWS = 10

export function OrderBookPanel({ book, spec, lastPrice }: Props) {
  const priceDecimals = spec?.priceDecimals ?? 2
  const qtyDecimals = spec?.qtyDecimals ?? 2
  const asks = book.asks.slice(0, MAX_ROWS).slice().reverse()
  const bids = book.bids.slice(0, MAX_ROWS)
  const maxQty = Math.max(
    1,
    ...asks.map((l) => l.quantity),
    ...bids.map((l) => l.quantity),
  )

  return (
    <PanelShell title="호가" scrollBody={false}>
      <div className="grid grid-cols-2 px-3 py-1 text-[10px] uppercase tracking-wide text-so-muted">
        <span>가격</span>
        <span className="text-right">수량</span>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        <ul className="flex flex-col">
          {asks.map((lvl, i) => (
            <BookRow
              key={`a-${i}`}
              price={lvl.price}
              qty={lvl.quantity}
              priceDecimals={priceDecimals}
              qtyDecimals={qtyDecimals}
              side="ask"
              fillRatio={lvl.quantity / maxQty}
            />
          ))}
          <li className="border-y border-so-border bg-so-surface-2 px-3 py-1 text-center text-[12px] font-semibold">
            {formatPrice(lastPrice, priceDecimals)}
          </li>
          {bids.map((lvl, i) => (
            <BookRow
              key={`b-${i}`}
              price={lvl.price}
              qty={lvl.quantity}
              priceDecimals={priceDecimals}
              qtyDecimals={qtyDecimals}
              side="bid"
              fillRatio={lvl.quantity / maxQty}
            />
          ))}
        </ul>
      </div>
    </PanelShell>
  )
}

function BookRow(props: {
  price: number
  qty: number
  priceDecimals: number
  qtyDecimals: number
  side: 'ask' | 'bid'
  fillRatio: number
}) {
  const color = props.side === 'ask' ? 'text-so-ask' : 'text-so-bid'
  const bg = props.side === 'ask' ? 'bg-so-ask/10' : 'bg-so-bid/10'
  return (
    <li className="relative grid grid-cols-2 px-3 py-0.5 text-[12px]">
      <span
        className={`absolute inset-y-0 right-0 ${bg}`}
        style={{ width: `${Math.min(100, props.fillRatio * 100)}%` }}
        aria-hidden
      />
      <span className={`relative font-medium ${color}`}>
        {formatPrice(props.price, props.priceDecimals)}
      </span>
      <span className="relative text-right text-so-muted">
        {formatQty(props.qty, props.qtyDecimals)}
      </span>
    </li>
  )
}
