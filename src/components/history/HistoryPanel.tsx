import { useState } from 'react'
import type { OrderRecordRow, TradeFillRow, PositionRow } from '../../core/domain/trading'
import { formatPrice, formatQty } from '../../core/utils/format'
import type { SymbolSpec } from '../../core/symbols/SymbolSpec'
import { PanelShell } from '../common/PanelShell'
import { PnlDisplay } from '../common/PnlDisplay'

type Tab = 'fills' | 'orders' | 'positions'

type Props = {
  fills: TradeFillRow[]
  orders: OrderRecordRow[]
  positions: PositionRow[]
  specsBySymbol: Record<string, SymbolSpec | undefined>
}

export function HistoryPanel({ fills, orders, positions, specsBySymbol }: Props) {
  const [tab, setTab] = useState<Tab>('positions')
  return (
    <PanelShell
      title="내역"
      action={
        <div className="flex gap-1 text-[11px]">
          <TabBtn active={tab === 'positions'} onClick={() => setTab('positions')} label={`포지션 (${positions.length})`} />
          <TabBtn active={tab === 'fills'} onClick={() => setTab('fills')} label={`체결 (${fills.length})`} />
          <TabBtn active={tab === 'orders'} onClick={() => setTab('orders')} label={`주문 (${orders.length})`} />
        </div>
      }
    >
      {tab === 'positions' ? (
        <PositionsTable rows={positions} specsBySymbol={specsBySymbol} />
      ) : tab === 'fills' ? (
        <FillsTable rows={fills} specsBySymbol={specsBySymbol} />
      ) : (
        <OrdersTable rows={orders} specsBySymbol={specsBySymbol} />
      )}
    </PanelShell>
  )
}

function TabBtn(props: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={[
        'rounded-md px-2 py-1 transition-colors',
        props.active
          ? 'bg-so-accent/15 text-so-accent'
          : 'text-so-muted hover:text-so-text',
      ].join(' ')}
    >
      {props.label}
    </button>
  )
}

function EmptyRow({ label }: { label: string }) {
  return <div className="px-3 py-6 text-center text-[11px] text-so-muted">{label}</div>
}

function PositionsTable({
  rows,
  specsBySymbol,
}: {
  rows: PositionRow[]
  specsBySymbol: Record<string, SymbolSpec | undefined>
}) {
  if (rows.length === 0) return <EmptyRow label="포지션 없음" />
  return (
    <table className="w-full text-[12px]">
      <thead className="sticky top-0 bg-so-surface text-[10px] uppercase tracking-wide text-so-muted">
        <tr>
          <Th>심볼</Th>
          <Th>방향</Th>
          <Th align="right">수량</Th>
          <Th align="right">평단</Th>
          <Th align="right">미실현</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((p) => {
          const spec = specsBySymbol[p.symbol]
          const pd = spec?.priceDecimals ?? 2
          const qd = spec?.qtyDecimals ?? 2
          const positive = p.unrealizedPnl >= 0
          const pnlTone = positive ? 'text-so-bid' : 'text-so-ask'
          return (
            <tr key={p.id} className="border-t border-so-border">
              <Td>{p.symbol}</Td>
              <Td className={p.side === 'long' ? 'text-so-bid' : 'text-so-ask'}>
                {p.side.toUpperCase()}
              </Td>
              <Td align="right">{formatQty(p.size, qd)}</Td>
              <Td align="right">{formatPrice(p.avgPrice, pd)}</Td>
              <Td align="right">
                <PnlDisplay marketId={p.marketId} amount={p.unrealizedPnl} toneClassName={pnlTone} />
              </Td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function FillsTable({
  rows,
  specsBySymbol,
}: {
  rows: TradeFillRow[]
  specsBySymbol: Record<string, SymbolSpec | undefined>
}) {
  if (rows.length === 0) return <EmptyRow label="체결 내역 없음" />
  return (
    <table className="w-full text-[12px]">
      <thead className="sticky top-0 bg-so-surface text-[10px] uppercase tracking-wide text-so-muted">
        <tr>
          <Th>시간</Th>
          <Th>심볼</Th>
          <Th>방향</Th>
          <Th align="right">가격</Th>
          <Th align="right">수량</Th>
          <Th align="right">실현</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((f) => {
          const spec = specsBySymbol[f.symbol]
          const pd = spec?.priceDecimals ?? 2
          const qd = spec?.qtyDecimals ?? 2
          const positive = f.realizedPnl >= 0
          const pnlTone = positive ? 'text-so-bid' : 'text-so-ask'
          return (
            <tr key={f.id} className="border-t border-so-border">
              <Td className="text-so-muted">{f.time}</Td>
              <Td>{f.symbol}</Td>
              <Td className={f.side === 'buy' ? 'text-so-bid' : 'text-so-ask'}>
                {f.side.toUpperCase()}
              </Td>
              <Td align="right">{formatPrice(f.price, pd)}</Td>
              <Td align="right">{formatQty(f.quantity, qd)}</Td>
              <Td align="right">
                <PnlDisplay marketId={f.marketId} amount={f.realizedPnl} toneClassName={pnlTone} />
              </Td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function OrdersTable({
  rows,
  specsBySymbol,
}: {
  rows: OrderRecordRow[]
  specsBySymbol: Record<string, SymbolSpec | undefined>
}) {
  if (rows.length === 0) return <EmptyRow label="주문 내역 없음" />
  return (
    <table className="w-full text-[12px]">
      <thead className="sticky top-0 bg-so-surface text-[10px] uppercase tracking-wide text-so-muted">
        <tr>
          <Th>시간</Th>
          <Th>심볼</Th>
          <Th>유형</Th>
          <Th align="right">가격</Th>
          <Th align="right">수량</Th>
          <Th align="right">상태</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((o) => {
          const spec = specsBySymbol[o.symbol]
          const pd = spec?.priceDecimals ?? 2
          const qd = spec?.qtyDecimals ?? 2
          return (
            <tr key={o.id} className="border-t border-so-border">
              <Td className="text-so-muted">{o.time}</Td>
              <Td>{o.symbol}</Td>
              <Td className="text-so-muted">{o.type.toUpperCase()}</Td>
              <Td align="right">{o.price != null ? formatPrice(o.price, pd) : '시장가'}</Td>
              <Td align="right">{formatQty(o.quantity, qd)}</Td>
              <Td align="right">{o.status}</Td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th
      className={`px-3 py-1.5 font-semibold ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      {children}
    </th>
  )
}

function Td({
  children,
  className = '',
  align = 'left',
}: {
  children: React.ReactNode
  className?: string
  align?: 'left' | 'right'
}) {
  return (
    <td
      className={[
        'px-3 py-1',
        align === 'right' ? 'text-right' : 'text-left',
        className,
      ].join(' ')}
    >
      {children}
    </td>
  )
}
