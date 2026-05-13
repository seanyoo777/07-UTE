import { PanelShell } from '../common/PanelShell'
import type { SymbolSpec } from '../../core/symbols/SymbolSpec'
import { formatPct, formatPrice } from '../../core/utils/format'

type Props = {
  spec: SymbolSpec | undefined
  lastPrice: number
  changePct: number
}

/**
 * 차트 영역 placeholder.
 * 실제 차트 라이브러리(예: lightweight-charts, kline-charts) 연동은 다음 단계.
 */
export function ChartArea({ spec, lastPrice, changePct }: Props) {
  const priceDecimals = spec?.priceDecimals ?? 2
  const positive = changePct >= 0
  return (
    <PanelShell
      title={`차트${spec ? ` · ${spec.displayName}` : ''}`}
      action={
        <span className={positive ? 'text-so-bid' : 'text-so-ask'}>
          {formatPct(changePct)}
        </span>
      }
      scrollBody={false}
    >
      <div className="relative flex flex-1 flex-col items-center justify-center gap-2 px-4 py-6 text-center">
        <div className="text-[28px] font-bold tracking-tight">
          {formatPrice(lastPrice, priceDecimals)}
          <span className="ml-2 text-[12px] font-normal text-so-muted">
            {spec?.quoteCurrency}
          </span>
        </div>
        <div className="text-xs text-so-muted">
          차트 라이브러리 연결 예정 — 현재는 라스트 프라이스만 표시
        </div>
        <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-end gap-1 opacity-60">
          {Array.from({ length: 40 }).map((_, i) => {
            const h = 6 + ((i * 13 + 7) % 28)
            return (
              <div
                key={i}
                className={i % 2 ? 'bg-so-bid/40' : 'bg-so-ask/30'}
                style={{ width: 4, height: h }}
              />
            )
          })}
        </div>
      </div>
    </PanelShell>
  )
}
