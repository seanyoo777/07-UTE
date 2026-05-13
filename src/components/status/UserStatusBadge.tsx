import { useMemo } from 'react'
import { isDomesticKrwPnlMarket, isOverseasUsdPnlMarket } from '../../core/fx/pnlCurrency'
import { useTradingStore } from '../../store/tradingStore'
import { PnlDisplay } from '../common/PnlDisplay'

/**
 * 사용자 상태 — 우측 상단 표시용 컴팩트 배지.
 *
 * 현재는 mock:
 *  - 계좌 ID 고정
 *  - 모든 보드의 포지션·미체결 카운트 합산
 *  - 미실현 손익: 국내(KRW) / 해외(USD+원화 환산) 분리 합산
 *
 * 통합 완료 후: 계좌 어댑터(account adapter) 가 이 영역의 데이터 소스가 됨.
 */
export function UserStatusBadge() {
  const boards = useTradingStore((s) => s.boards)

  const stats = useMemo(() => {
    let positions = 0
    let openOrders = 0
    let unrealizedKrw = 0
    let unrealizedUsd = 0
    for (const b of Object.values(boards)) {
      positions += b.positions.length
      openOrders += b.orders.filter(
        (o) => o.status === 'accepted' || o.status === 'submitting' || o.status === 'partial',
      ).length
      for (const p of b.positions) {
        if (!Number.isFinite(p.unrealizedPnl)) continue
        if (isDomesticKrwPnlMarket(p.marketId)) unrealizedKrw += p.unrealizedPnl
        else if (isOverseasUsdPnlMarket(p.marketId)) unrealizedUsd += p.unrealizedPnl
      }
    }
    return { positions, openOrders, unrealizedKrw, unrealizedUsd }
  }, [boards])

  const krwTone = stats.unrealizedKrw >= 0 ? 'text-so-bid' : 'text-so-ask'
  const usdTone = stats.unrealizedUsd >= 0 ? 'text-so-bid' : 'text-so-ask'

  return (
    <div className="flex shrink-0 items-center gap-1.5 rounded-md border border-so-border bg-so-surface-2 px-2 py-1 text-[10px]">
      <span className="grid h-5 w-5 place-items-center rounded-full bg-so-accent/20 text-[9px] font-bold text-so-accent">
        U
      </span>
      <div className="hidden flex-col leading-tight lg:flex">
        <span className="font-semibold uppercase tracking-wider text-so-text">UTX-0001</span>
        <span className="text-[9px] text-so-muted">모의투자 · mock</span>
      </div>
      <span className="mx-0.5 hidden h-3 w-px bg-so-border lg:inline-block" aria-hidden />
      <span className="hidden flex-col items-end leading-tight sm:flex">
        <span className="text-[9px] uppercase text-so-muted">미실현 (KR)</span>
        <span className="text-[11px]">
          <PnlDisplay marketId="kr-stock" amount={stats.unrealizedKrw} toneClassName={`font-semibold ${krwTone}`} />
        </span>
      </span>
      <span className="mx-0.5 hidden h-3 w-px bg-so-border sm:inline-block" aria-hidden />
      <span className="flex flex-col items-end leading-tight">
        <span className="text-[9px] uppercase text-so-muted">미실현 (USD)</span>
        <span className="text-[11px]">
          <PnlDisplay
            marketId="us-stock"
            amount={stats.unrealizedUsd}
            toneClassName={`font-semibold ${usdTone}`}
            layout="inline"
          />
        </span>
      </span>
      <span className="mx-0.5 hidden h-3 w-px bg-so-border lg:inline-block" aria-hidden />
      <span className="hidden flex-col items-end leading-tight lg:flex">
        <span className="text-[9px] uppercase text-so-muted">포지션·미체결</span>
        <span className="tabular-nums font-semibold text-so-text">
          {stats.positions} · {stats.openOrders}
        </span>
      </span>
    </div>
  )
}
