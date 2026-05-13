import type { MarketId } from '../../markets/types'
import { MOCK_USD_KRW_RATE } from '../../core/fx/mockUsdKrw'
import { isDomesticKrwPnlMarket, isOverseasUsdPnlMarket } from '../../core/fx/pnlCurrency'
import { safeNumber } from '../../core/utils/safe'

function formatSignedKrwWon(value: number): string {
  const v = Math.round(safeNumber(value, 0))
  const sign = v > 0 ? '+' : ''
  return `${sign}${v.toLocaleString('ko-KR')}원`
}

function formatSignedUsd2(value: number): string {
  const v = safeNumber(value, 0)
  const sign = v > 0 ? '+' : v < 0 ? '-' : ''
  const abs = Math.abs(v)
  return `${sign}$${abs.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatApproxKrwFromUsd(usdPnl: number, rate: number): string {
  const krw = Math.round(safeNumber(usdPnl, 0) * rate)
  return `약 ${krw.toLocaleString('ko-KR')}원`
}

type Props = {
  marketId: MarketId
  amount: number
  /** 손익 부호에 따른 톤 (bid/ask) */
  toneClassName: string
  /** 한 줄로 붙일지(예: 헤더), 테이블은 기본 두 줄 */
  layout?: 'stack' | 'inline'
}

/**
 * 모의/실거래 동일 규칙: 국내=원화만, 해외=USD 손익 + 당일환율 mock 원화.
 */
export function PnlDisplay({
  marketId,
  amount,
  toneClassName,
  layout = 'stack',
}: Props) {
  const tone = toneClassName

  if (isDomesticKrwPnlMarket(marketId)) {
    return <span className={`tabular-nums ${tone}`}>{formatSignedKrwWon(amount)}</span>
  }

  if (isOverseasUsdPnlMarket(marketId)) {
    const usd = formatSignedUsd2(amount)
    const krw = formatApproxKrwFromUsd(amount, MOCK_USD_KRW_RATE)
    if (layout === 'inline') {
      return (
        <span className={`tabular-nums ${tone}`}>
          <span>{usd}</span>
          <span className="text-so-muted"> / </span>
          <span className="text-so-muted">{krw}</span>
        </span>
      )
    }
    return (
      <span className={`flex flex-col items-end tabular-nums leading-tight ${tone}`}>
        <span>{usd}</span>
        <span className="text-[10px] font-normal text-so-muted">{krw}</span>
      </span>
    )
  }

  return <span className={`tabular-nums ${tone}`}>{formatSignedKrwWon(amount)}</span>
}
