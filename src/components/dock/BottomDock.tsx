import { useMemo, useState } from 'react'
import type {
  OrderRecordRow,
  PositionRow,
  TradeFillRow,
} from '../../core/domain/trading'
import type { SymbolSpec } from '../../core/symbols/SymbolSpec'
import { PnlDisplay } from '../common/PnlDisplay'
import { formatPrice, formatQty, formatPct } from '../../core/utils/format'
import type { MarketId } from '../../markets/types'
import { useTradingStore } from '../../store/tradingStore'

type Tab = 'positions' | 'open' | 'fills' | 'orders'

type Props = {
  marketId: MarketId
  symbols: SymbolSpec[]
  positions: PositionRow[]
  orders: OrderRecordRow[]
  fills: TradeFillRow[]
}

/**
 * 하단 dock — TGX-CEX PositionsFillsDock 패턴을 통합 자산용으로 일반화.
 *
 * 4개 탭:
 *  - 포지션: 활성 시장 + (옵션) 전 시장 합계 미리보기
 *  - 미체결: status가 accepted/submitting/partial
 *  - 체결: TradeFillRow 직전 200건
 *  - 주문내역: 전체 주문 기록 (filled/canceled/rejected 포함)
 */
export function BottomDock(props: Props) {
  const [tab, setTab] = useState<Tab>('positions')

  const specsBySymbol = useMemo(() => {
    const map: Record<string, SymbolSpec | undefined> = {}
    for (const sp of props.symbols) map[sp.symbol] = sp
    return map
  }, [props.symbols])

  const openOrders = useMemo(
    () =>
      props.orders.filter(
        (o) => o.status === 'accepted' || o.status === 'submitting' || o.status === 'partial',
      ),
    [props.orders],
  )

  return (
    <section
      className="so-panel-glow relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden border-t border-so-border bg-gradient-to-b from-so-surface to-so-surface/60"
      aria-label="포지션·주문 도크"
    >
      <div className="flex shrink-0 items-center gap-1 border-b border-so-border px-2 py-1.5">
        <DockTab id="positions" current={tab} label={`포지션 (${props.positions.length})`} onSelect={setTab} />
        <DockTab id="open" current={tab} label={`미체결 (${openOrders.length})`} onSelect={setTab} />
        <DockTab id="fills" current={tab} label={`체결 (${props.fills.length})`} onSelect={setTab} />
        <DockTab id="orders" current={tab} label={`주문내역 (${props.orders.length})`} onSelect={setTab} />
        <span className="ml-auto hidden text-[10px] uppercase tracking-wider text-so-muted lg:inline">
          포트폴리오 뷰 · 다음 단계
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {tab === 'positions' ? (
          <PositionsTable rows={props.positions} specsBySymbol={specsBySymbol} marketId={props.marketId} />
        ) : tab === 'open' ? (
          <OpenOrdersTable rows={openOrders} specsBySymbol={specsBySymbol} marketId={props.marketId} />
        ) : tab === 'fills' ? (
          <FillsTable rows={props.fills} specsBySymbol={specsBySymbol} />
        ) : (
          <OrdersTable rows={props.orders} specsBySymbol={specsBySymbol} />
        )}
      </div>
    </section>
  )
}

function DockTab({
  id,
  current,
  label,
  onSelect,
}: {
  id: Tab
  current: Tab
  label: string
  onSelect: (t: Tab) => void
}) {
  const active = id === current
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={[
        'shrink-0 rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors',
        active
          ? 'bg-so-accent/15 text-so-accent'
          : 'text-so-muted hover:bg-so-surface-2 hover:text-so-text',
      ].join(' ')}
      aria-pressed={active}
    >
      {label}
    </button>
  )
}

function Empty({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center px-3 py-6 text-center text-[11px] text-so-muted">
      {label}
    </div>
  )
}

function PositionsTable({
  rows,
  specsBySymbol,
  marketId,
}: {
  rows: PositionRow[]
  specsBySymbol: Record<string, SymbolSpec | undefined>
  marketId: MarketId
}) {
  if (rows.length === 0) return <Empty label="포지션 없음" />
  return (
    <div className="h-full overflow-auto">
      <table className="w-full min-w-[640px] table-fixed text-[12px]">
        <thead className="sticky top-0 z-[1] bg-so-surface text-[10px] uppercase tracking-wide text-so-muted">
          <tr className="border-b border-so-border">
            <Th width="16%">종목</Th>
            <Th width="8%" align="center">방향</Th>
            <Th width="11%" align="right">수량</Th>
            <Th width="12%" align="right">평단</Th>
            <Th width="18%" align="right">평가손익</Th>
            <Th width="12%" align="right">수익률</Th>
            <Th width="10%" align="right">청산</Th>
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
              <tr key={p.id} className="border-b border-so-border/60 hover:bg-so-surface-2">
                <Td>
                  <div className="truncate text-so-text">{spec?.displayName ?? p.symbol}</div>
                  <div className="truncate text-[10px] text-so-muted">{p.symbol}</div>
                </Td>
                <Td align="center" className={p.side === 'long' ? 'text-so-bid' : 'text-so-ask'}>
                  {p.side === 'long' ? '롱' : '숏'}
                </Td>
                <Td align="right">{formatQty(p.size, qd)}</Td>
                <Td align="right">{formatPrice(p.avgPrice, pd)}</Td>
                <Td align="right">
                  <PnlDisplay marketId={p.marketId} amount={p.unrealizedPnl} toneClassName={pnlTone} />
                </Td>
                <Td align="right" className={pnlTone}>
                  {formatPct(p.returnPct)}
                </Td>
                <Td align="right">
                  <ClosePositionBtn marketId={marketId} positionId={p.id} />
                </Td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function ClosePositionBtn({ marketId, positionId }: { marketId: MarketId; positionId: string }) {
  const setPositions = useTradingStore((s) => s.setPositions)
  const positions = useTradingStore((s) => s.boards[marketId].positions)
  return (
    <button
      type="button"
      className="rounded border border-so-ask/40 px-1.5 py-0.5 text-[10px] font-semibold text-so-ask hover:bg-so-ask/15"
      onClick={() => {
        if (window.confirm('모의 청산 — 실거래 아님')) {
          setPositions(marketId, positions.filter((p) => p.id !== positionId))
        }
      }}
    >
      청산
    </button>
  )
}

function OpenOrdersTable({
  rows,
  specsBySymbol,
  marketId,
}: {
  rows: OrderRecordRow[]
  specsBySymbol: Record<string, SymbolSpec | undefined>
  marketId: MarketId
}) {
  const cancelOrderLocal = useTradingStore((s) => s.cancelOrderLocal)
  if (rows.length === 0) return <Empty label="미체결 주문 없음" />
  return (
    <div className="h-full overflow-auto">
      <table className="w-full min-w-[640px] table-fixed text-[12px]">
        <thead className="sticky top-0 z-[1] bg-so-surface text-[10px] uppercase tracking-wide text-so-muted">
          <tr className="border-b border-so-border">
            <Th width="14%">시간</Th>
            <Th width="22%">종목</Th>
            <Th width="10%" align="center">방향</Th>
            <Th width="10%">유형</Th>
            <Th width="14%" align="right">가격</Th>
            <Th width="12%" align="right">수량</Th>
            <Th width="10%" align="right">상태</Th>
            <Th width="8%" align="right">취소</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => {
            const spec = specsBySymbol[o.symbol]
            const pd = spec?.priceDecimals ?? 2
            const qd = spec?.qtyDecimals ?? 2
            return (
              <tr key={o.id} className="border-b border-so-border/60 hover:bg-so-surface-2">
                <Td className="text-so-muted">{o.time}</Td>
                <Td>
                  <div className="truncate">{spec?.displayName ?? o.symbol}</div>
                  <div className="truncate text-[10px] text-so-muted">{o.symbol}</div>
                </Td>
                <Td align="center" className={o.side === 'buy' ? 'text-so-bid' : 'text-so-ask'}>
                  {o.side === 'buy' ? '매수' : '매도'}
                </Td>
                <Td className="text-so-muted">{o.type.toUpperCase()}</Td>
                <Td align="right">{o.price != null ? formatPrice(o.price, pd) : '시장가'}</Td>
                <Td align="right">{formatQty(o.quantity, qd)}</Td>
                <Td align="right" className="text-so-warn">{o.status}</Td>
                <Td align="right">
                  <button
                    type="button"
                    className="rounded border border-so-border px-1.5 py-0.5 text-[10px] text-so-muted hover:text-so-text"
                    onClick={() => cancelOrderLocal(marketId, o.id)}
                  >
                    취소
                  </button>
                </Td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function FillsTable({
  rows,
  specsBySymbol,
}: {
  rows: TradeFillRow[]
  specsBySymbol: Record<string, SymbolSpec | undefined>
}) {
  if (rows.length === 0) return <Empty label="체결 내역 없음" />
  return (
    <div className="h-full overflow-auto">
      <table className="w-full min-w-[640px] table-fixed text-[12px]">
        <thead className="sticky top-0 z-[1] bg-so-surface text-[10px] uppercase tracking-wide text-so-muted">
          <tr className="border-b border-so-border">
            <Th width="12%">시간</Th>
            <Th width="24%">종목</Th>
            <Th width="10%" align="center">방향</Th>
            <Th width="16%" align="right">가격</Th>
            <Th width="14%" align="right">수량</Th>
            <Th width="12%" align="right">수수료</Th>
            <Th width="12%" align="right">실현</Th>
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
              <tr key={f.id} className="border-b border-so-border/60 hover:bg-so-surface-2">
                <Td className="text-so-muted">{f.time}</Td>
                <Td>
                  <div className="truncate">{spec?.displayName ?? f.symbol}</div>
                  <div className="truncate text-[10px] text-so-muted">{f.symbol}</div>
                </Td>
                <Td align="center" className={f.side === 'buy' ? 'text-so-bid' : 'text-so-ask'}>
                  {f.side.toUpperCase()}
                </Td>
                <Td align="right">{formatPrice(f.price, pd)}</Td>
                <Td align="right">{formatQty(f.quantity, qd)}</Td>
                <Td align="right" className="text-so-muted">
                  {f.fee.toFixed(2)}
                </Td>
                <Td align="right">
                  <PnlDisplay marketId={f.marketId} amount={f.realizedPnl} toneClassName={pnlTone} />
                </Td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function OrdersTable({
  rows,
  specsBySymbol,
}: {
  rows: OrderRecordRow[]
  specsBySymbol: Record<string, SymbolSpec | undefined>
}) {
  if (rows.length === 0) return <Empty label="주문 내역 없음" />
  return (
    <div className="h-full overflow-auto">
      <table className="w-full min-w-[640px] table-fixed text-[12px]">
        <thead className="sticky top-0 z-[1] bg-so-surface text-[10px] uppercase tracking-wide text-so-muted">
          <tr className="border-b border-so-border">
            <Th width="12%">시간</Th>
            <Th width="24%">종목</Th>
            <Th width="10%" align="center">방향</Th>
            <Th width="10%">유형</Th>
            <Th width="14%" align="right">가격</Th>
            <Th width="14%" align="right">수량</Th>
            <Th width="8%" align="right">체결</Th>
            <Th width="8%" align="right">상태</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => {
            const spec = specsBySymbol[o.symbol]
            const pd = spec?.priceDecimals ?? 2
            const qd = spec?.qtyDecimals ?? 2
            const tone =
              o.status === 'filled'
                ? 'text-so-bid'
                : o.status === 'canceled' || o.status === 'rejected'
                  ? 'text-so-muted'
                  : 'text-so-warn'
            return (
              <tr key={o.id} className="border-b border-so-border/60 hover:bg-so-surface-2">
                <Td className="text-so-muted">{o.time}</Td>
                <Td>
                  <div className="truncate">{spec?.displayName ?? o.symbol}</div>
                  <div className="truncate text-[10px] text-so-muted">{o.symbol}</div>
                </Td>
                <Td align="center" className={o.side === 'buy' ? 'text-so-bid' : 'text-so-ask'}>
                  {o.side === 'buy' ? '매수' : '매도'}
                </Td>
                <Td className="text-so-muted">{o.type.toUpperCase()}</Td>
                <Td align="right">{o.price != null ? formatPrice(o.price, pd) : '시장가'}</Td>
                <Td align="right">{formatQty(o.quantity, qd)}</Td>
                <Td align="right">{formatQty(o.filledQuantity, qd)}</Td>
                <Td align="right" className={tone}>{o.status}</Td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Th({
  children,
  width,
  align = 'left',
}: {
  children: React.ReactNode
  width?: string
  align?: 'left' | 'right' | 'center'
}) {
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
  return (
    <th
      className={`px-2 py-1 font-semibold ${alignClass}`}
      style={width ? { width } : undefined}
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
  align?: 'left' | 'right' | 'center'
}) {
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
  return <td className={`px-2 py-1 ${alignClass} ${className}`}>{children}</td>
}
