import { useMemo, useState } from 'react'
import { getCategoryConfig, type OrderTypeOption } from '../../config/categoryConfig'
import type { OrderRequest } from '../../core/domain/order'
import type { SymbolSpec } from '../../core/symbols/SymbolSpec'
import { formatPrice } from '../../core/utils/format'
import type { MarketId } from '../../markets/types'
import { useTradingStore } from '../../store/tradingStore'
import { PanelShell } from '../common/PanelShell'

type Props = {
  marketId: MarketId
  spec: SymbolSpec | undefined
  lastPrice: number
  /** UI guard only — does not change store / submitOrder contract. */
  readOnly?: boolean
}

const ORDER_TYPE_LABEL: Record<OrderTypeOption, string> = {
  market: '시장가',
  limit: '지정가',
  stop: 'STOP',
  stop_limit: 'STOP-L',
}

/**
 * 우측 통합 주문창.
 *
 * - 모든 카테고리에서 동일 컴포넌트 사용
 * - 카테고리별 차이는 CategoryConfig 로만 표현 (orderTypes / sides 라벨 / leverage / SLTP 등)
 * - submitOrder 어댑터 호출은 그대로 (UI는 어댑터를 모른다)
 */
export function OrderPanel({ marketId, spec, lastPrice, readOnly = false }: Props) {
  const config = getCategoryConfig(marketId)
  const submitOrder = useTradingStore((s) => s.submitOrder)

  /**
   * 카테고리/심볼이 바뀌면 부모(UniversalMarketView)에서 `key={marketId}` 로 remount.
   * → 아래 useState 들의 초기값이 새 props 기준으로 재계산됨. (effect 기반 reset 제거)
   */
  const [orderType, setOrderType] = useState<OrderTypeOption>(config.defaultOrderType)
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [qty, setQty] = useState('')
  const [price, setPrice] = useState('')
  const [leverage, setLeverage] = useState<number>(spec?.defaultLeverage ?? 1)
  const [hedge, setHedge] = useState(false)
  const [stopLoss, setStopLoss] = useState('')
  const [takeProfit, setTakeProfit] = useState('')
  const [binaryExpirySec, setBinaryExpirySec] = useState<number>(
    config.binaryExpiryOptions?.[1] ?? config.binaryExpiryOptions?.[0] ?? 60,
  )
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const effectivePrice = useMemo(() => {
    if (orderType === 'limit' || orderType === 'stop_limit') {
      const n = Number(price)
      return Number.isFinite(n) && n > 0 ? n : lastPrice
    }
    return lastPrice
  }, [orderType, price, lastPrice])

  const notional = useMemo(() => {
    const q = Number(qty) || 0
    return effectivePrice * q
  }, [effectivePrice, qty])

  const requiredMargin = useMemo(() => {
    if (!config.showLeverageSelector) return notional
    const lev = leverage > 0 ? leverage : 1
    return notional / lev
  }, [notional, leverage, config.showLeverageSelector])

  async function onSubmit(): Promise<void> {
    if (readOnly) return
    if (!spec) return
    const quantity = Number(qty) || 0
    if (quantity <= 0) {
      setMessage('수량을 입력하세요.')
      return
    }
    const isLimit = orderType === 'limit' || orderType === 'stop_limit'
    const limitPrice = isLimit ? Number(price) || undefined : undefined

    const req: OrderRequest = {
      symbol: spec.symbol,
      side,
      mode: config.defaultOrderMode,
      orderType: isLimit ? 'limit' : 'market',
      quantity,
      limitPrice,
      conditionalType:
        orderType === 'stop' ? 'STOP' : orderType === 'stop_limit' ? 'STOP_LIMIT' : undefined,
      binaryExpirySec: config.showBinaryExpiry ? binaryExpirySec : undefined,
      binaryDirection: config.showBinaryExpiry ? (side === 'buy' ? 'up' : 'down') : undefined,
      meta: {
        leverage: config.showLeverageSelector ? leverage : undefined,
        hedge: config.showHedgeToggle ? hedge : undefined,
        stopLoss: config.showStopLossTakeProfit ? Number(stopLoss) || undefined : undefined,
        takeProfit: config.showStopLossTakeProfit ? Number(takeProfit) || undefined : undefined,
      },
    }

    setBusy(true)
    setMessage(null)
    try {
      const ack = await submitOrder(marketId, req)
      if (ack.ok) {
        setMessage(`체결 처리됨: ${ack.order.id}`)
      } else {
        setMessage(`거절: ${ack.reason}`)
      }
    } finally {
      setBusy(false)
    }
  }

  const inputsDisabled = readOnly || busy

  return (
    <PanelShell title={config.label + ' 주문'} scrollBody>
      <div className="flex flex-col gap-3 p-3 text-[12px]">
        {readOnly ? (
          <p className="rounded-md border border-so-accent/30 bg-so-accent/10 px-2 py-1 text-[10px] text-so-accent">
            Demo · read-only — 주문 입력·제출 비활성 (mock UI guard)
          </p>
        ) : null}
        <div className="grid grid-cols-2 gap-1 rounded-md bg-so-surface-2 p-1">
          <SideTab
            active={side === 'buy'}
            tone={config.sides.buyAccent}
            onClick={() => setSide('buy')}
            label={config.sides.buy}
            disabled={inputsDisabled}
          />
          <SideTab
            active={side === 'sell'}
            tone={config.sides.sellAccent}
            onClick={() => setSide('sell')}
            label={config.sides.sell}
            disabled={inputsDisabled}
          />
        </div>

        {config.orderTypes.length > 1 ? (
          <div className="flex flex-wrap gap-1 rounded-md border border-so-border p-1 text-[11px] text-so-muted">
            {config.orderTypes.map((t) => (
              <button
                key={t}
                type="button"
                disabled={inputsDisabled}
                onClick={() => setOrderType(t)}
                className={[
                  'rounded px-2 py-1 transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                  orderType === t ? 'bg-so-surface-2 text-so-text' : 'hover:text-so-text',
                ].join(' ')}
              >
                {ORDER_TYPE_LABEL[t]}
              </button>
            ))}
          </div>
        ) : null}

        {(orderType === 'limit' || orderType === 'stop_limit') && spec ? (
          <Field
            label="가격"
            suffix={spec.quoteCurrency}
            value={price}
            placeholder={formatPrice(lastPrice, spec.priceDecimals)}
            onChange={setPrice}
            disabled={inputsDisabled}
          />
        ) : null}

        {orderType === 'stop' || orderType === 'stop_limit' ? (
          <Field
            label="트리거가"
            suffix={spec?.quoteCurrency}
            value={stopLoss}
            placeholder={spec ? formatPrice(lastPrice, spec.priceDecimals) : ''}
            onChange={setStopLoss}
            disabled={inputsDisabled}
          />
        ) : null}

        <Field
          label="수량"
          suffix={spec?.qtyDecimals === 0 ? '계약' : ''}
          value={qty}
          placeholder={spec ? `min ${spec.minQty}` : ''}
          onChange={setQty}
          disabled={inputsDisabled}
        />

        {config.showLeverageSelector ? (
          <LeverageRow
            value={leverage}
            max={Math.max(1, spec?.defaultLeverage ?? 1) * 5}
            onChange={setLeverage}
            disabled={inputsDisabled}
          />
        ) : null}

        {config.showHedgeToggle ? (
          <Toggle
            label="Hedge 모드"
            hint="롱/숏 동시 보유"
            value={hedge}
            onChange={setHedge}
            disabled={inputsDisabled}
          />
        ) : null}

        {config.showStopLossTakeProfit ? (
          <div className="grid grid-cols-2 gap-2">
            <Field
              label="손절"
              value={stopLoss}
              onChange={setStopLoss}
              placeholder="옵션"
              disabled={inputsDisabled}
            />
            <Field
              label="익절"
              value={takeProfit}
              onChange={setTakeProfit}
              placeholder="옵션"
              disabled={inputsDisabled}
            />
          </div>
        ) : null}

        {config.showBinaryExpiry && config.binaryExpiryOptions ? (
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-so-muted">만기 시간</span>
            <div className="grid grid-cols-4 gap-1">
              {config.binaryExpiryOptions.map((sec) => (
                <button
                  key={sec}
                  type="button"
                  disabled={inputsDisabled}
                  onClick={() => setBinaryExpirySec(sec)}
                  className={[
                    'rounded-md border px-1 py-1 text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                    binaryExpirySec === sec
                      ? 'border-so-accent bg-so-accent/15 text-so-text'
                      : 'border-so-border text-so-muted hover:text-so-text',
                  ].join(' ')}
                >
                  {sec < 60 ? `${sec}s` : `${Math.round(sec / 60)}m`}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="rounded-md border border-so-border bg-so-surface-2 px-2 py-1.5 text-[11px]">
          <SummaryRow label="예상 체결가" value={spec ? formatPrice(effectivePrice, spec.priceDecimals) : '—'} />
          <SummaryRow
            label={config.showLeverageSelector ? '필요 증거금' : '필요 금액'}
            value={spec ? `${requiredMargin.toFixed(2)} ${spec.marginCurrency}` : '—'}
          />
          {config.showBinaryExpiry && spec ? (
            <SummaryRow
              label="페이아웃"
              value={`+${Math.round((spec.binaryPayoutPct ?? 0) * 100)}%`}
              tone="bid"
            />
          ) : null}
        </div>

        {config.showShortSellWarning && side === 'sell' ? (
          <p className="rounded-md border border-so-warn/40 bg-so-warn/10 px-2 py-1 text-[10px] text-so-warn">
            ※ 보유 수량을 초과하는 매도는 mock 청산 처리 (실거래 공매도 아님).
          </p>
        ) : null}

        <button
          type="button"
          onClick={onSubmit}
          disabled={inputsDisabled || !spec}
          className={[
            'mt-1 rounded-md px-3 py-2 text-[13px] font-semibold text-white transition-colors disabled:opacity-50',
            side === 'buy'
              ? config.sides.buyAccent === 'bid'
                ? 'bg-so-bid hover:bg-so-bid/90'
                : 'bg-so-ask hover:bg-so-ask/90'
              : config.sides.sellAccent === 'ask'
                ? 'bg-so-ask hover:bg-so-ask/90'
                : 'bg-so-bid hover:bg-so-bid/90',
          ].join(' ')}
        >
          {busy ? '전송중…' : side === 'buy' ? config.sides.buy : config.sides.sell}
        </button>

        {message ? (
          <p className="rounded-md border border-so-border bg-so-surface-2 px-2 py-1 text-[11px] text-so-muted">
            {message}
          </p>
        ) : null}

        <p className="text-[10px] text-so-muted">{config.orderLogicHint}</p>
      </div>
    </PanelShell>
  )
}

function SideTab(props: {
  active: boolean
  tone: 'bid' | 'ask'
  onClick: () => void
  label: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      disabled={props.disabled}
      onClick={props.onClick}
      className={[
        'disabled:cursor-not-allowed disabled:opacity-50',
        'rounded-md px-2 py-1.5 text-[12px] font-semibold transition-colors',
        props.active
          ? props.tone === 'bid'
            ? 'bg-so-bid text-white'
            : 'bg-so-ask text-white'
          : 'text-so-muted hover:text-so-text',
      ].join(' ')}
    >
      {props.label}
    </button>
  )
}

function Field(props: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  suffix?: string
  disabled?: boolean
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] text-so-muted">{props.label}</span>
      <div className="flex items-center rounded-md border border-so-border bg-so-surface-2 px-2 py-1.5">
        <input
          inputMode="decimal"
          disabled={props.disabled}
          value={props.value}
          placeholder={props.placeholder}
          onChange={(e) => props.onChange(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-[13px] text-so-text outline-none placeholder:text-so-muted"
        />
        {props.suffix ? (
          <span className="ml-1 text-[11px] text-so-muted">{props.suffix}</span>
        ) : null}
      </div>
    </label>
  )
}

function LeverageRow(props: {
  value: number
  max: number
  onChange: (n: number) => void
  disabled?: boolean
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="flex items-center justify-between text-[11px] text-so-muted">
        <span>레버리지</span>
        <span className="font-semibold text-so-text">×{props.value}</span>
      </span>
      <input
        type="range"
        min={1}
        max={Math.max(1, props.max)}
        step={1}
        disabled={props.disabled}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
        className="accent-so-accent"
      />
    </label>
  )
}

function Toggle(props: {
  label: string
  hint: string
  value: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      disabled={props.disabled}
      onClick={() => props.onChange(!props.value)}
      className="flex items-center justify-between rounded-md border border-so-border bg-so-surface-2 px-2 py-1.5 text-left text-[12px] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="flex flex-col">
        <span className="text-so-text">{props.label}</span>
        <span className="text-[10px] text-so-muted">{props.hint}</span>
      </span>
      <span
        className={`h-4 w-8 rounded-full transition-colors ${
          props.value ? 'bg-so-accent' : 'bg-so-border'
        }`}
        aria-hidden
      >
        <span
          className={`block h-4 w-4 rounded-full bg-white transition-transform ${
            props.value ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  )
}

function SummaryRow(props: { label: string; value: string; tone?: 'bid' | 'ask' | 'muted' }) {
  const toneClass =
    props.tone === 'bid' ? 'text-so-bid' : props.tone === 'ask' ? 'text-so-ask' : 'text-so-text'
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-so-muted">{props.label}</span>
      <span className={`tabular-nums font-semibold ${toneClass}`}>{props.value}</span>
    </div>
  )
}
