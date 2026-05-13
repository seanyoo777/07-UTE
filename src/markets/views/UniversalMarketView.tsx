import { useMemo } from 'react'
import { BottomDock } from '../../components/dock/BottomDock'
import { HistoryPanel } from '../../components/history/HistoryPanel'
import { OrderBookPanel } from '../../components/orderbook/OrderBookPanel'
import { OrderPanel } from '../../components/order/OrderPanel'
import { MarketSidebar } from '../../components/sidebar/MarketSidebar'
import { TickerBar } from '../../components/ticker/TickerBar'
import { TradingViewChart } from '../../components/chart/TradingViewChart'
import { IntegrationSlot } from '../../components/common/IntegrationSlot'
import type { SymbolSpec } from '../../core/symbols/SymbolSpec'
import { useMarketSubscription } from '../../hooks/useMarketSubscription'
import { HtsLayout } from '../../layouts/HtsLayout'
import { TradingLayout } from '../../layouts/TradingLayout'
import { useTradingStore } from '../../store/tradingStore'
import type { MarketId } from '../types'

type Props = {
  marketId: MarketId
  onMarketChange: (id: MarketId) => void
  /** 모바일 fallback 헤더 슬롯 (TradingLayout 위에 표시) */
  mobileHeaderSlot?: React.ReactNode
}

/**
 * 모든 시장이 동일하게 사용하는 트레이딩 뷰.
 *
 * - 데스크탑(lg+): HtsLayout (사이드바 + 차트 + 호가 + 주문 + 하단 dock, 모두 resizable)
 * - 모바일/태블릿: 기존 TradingLayout (세로 스택)
 */
export function UniversalMarketView({ marketId, onMarketChange, mobileHeaderSlot }: Props) {
  useMarketSubscription(marketId)

  const board = useTradingStore((s) => s.boards[marketId])

  const activeSpec: SymbolSpec | undefined = useMemo(
    () => board.symbols.find((sp) => sp.symbol === board.activeSymbol),
    [board.symbols, board.activeSymbol],
  )

  const specsBySymbol = useMemo(() => {
    const map: Record<string, SymbolSpec | undefined> = {}
    for (const sp of board.symbols) map[sp.symbol] = sp
    return map
  }, [board.symbols])

  const activeTicker = board.tickers.find((t) => t.symbol === board.activeSymbol)
  const changePct = activeTicker?.changePct ?? 0

  return (
    <>
      <div className="hidden h-full min-h-0 lg:flex lg:flex-col">
        <HtsLayout
          sidebar={<MarketSidebar activeMarket={marketId} onMarketChange={onMarketChange} />}
          chart={
            <IntegrationSlot
              source="05-SpeedOrder"
              module="ChartArea + DOM"
              state="in-progress"
              note="TradingView 위젯 임시 사용 — 5번 차트 모듈로 교체 예정"
            >
              <TradingViewChart spec={activeSpec} lastPrice={board.lastPrice} changePct={changePct} />
            </IntegrationSlot>
          }
          orderBook={
            <IntegrationSlot
              source="05-SpeedOrder"
              module="OrderBookPanel (HTS)"
              state="planned"
              note="현재 mock 호가. 5번 HTS 호가창으로 교체 예정"
            >
              <OrderBookPanel book={board.orderBook} spec={activeSpec} lastPrice={board.lastPrice} />
            </IntegrationSlot>
          }
          orderPanel={
            <IntegrationSlot
              source="05-SpeedOrder"
              module="SpeedOrderPanel + StopMit"
              state="planned"
              note="현재 카테고리 config 기반 mock. 5번 거래 엔진 통합 예정"
            >
              <OrderPanel
                key={`${marketId}:${board.activeSymbol}`}
                marketId={marketId}
                spec={activeSpec}
                lastPrice={board.lastPrice}
              />
            </IntegrationSlot>
          }
          dock={
            <IntegrationSlot
              source="05-SpeedOrder"
              module="PositionPanel + TradeHistoryPanel"
              state="planned"
              note="포지션·체결 표는 5번 패널로 교체 예정"
            >
              <BottomDock
                marketId={marketId}
                symbols={board.symbols}
                positions={board.positions}
                orders={board.orders}
                fills={board.fills}
              />
            </IntegrationSlot>
          }
        />
      </div>

      <div className="flex h-full min-h-0 flex-col lg:hidden">
        {mobileHeaderSlot ? (
          <div className="shrink-0 border-b border-so-border bg-so-surface px-3 py-1.5">
            {mobileHeaderSlot}
          </div>
        ) : null}
        <TradingLayout
          ticker={
            <TickerBar
              tickers={board.tickers}
              activeSymbol={board.activeSymbol}
              priceDecimals={activeSpec?.priceDecimals ?? 2}
              onSelect={(sym) => useTradingStore.getState().setActiveSymbol(marketId, sym)}
            />
          }
          chart={
            <TradingViewChart spec={activeSpec} lastPrice={board.lastPrice} changePct={changePct} />
          }
          orderBook={
            <OrderBookPanel book={board.orderBook} spec={activeSpec} lastPrice={board.lastPrice} />
          }
          orderPanel={
            <OrderPanel
              key={`${marketId}:${board.activeSymbol}`}
              marketId={marketId}
              spec={activeSpec}
              lastPrice={board.lastPrice}
            />
          }
          history={
            <HistoryPanel
              fills={board.fills}
              orders={board.orders}
              positions={board.positions}
              specsBySymbol={specsBySymbol}
            />
          }
        />
      </div>
    </>
  )
}
