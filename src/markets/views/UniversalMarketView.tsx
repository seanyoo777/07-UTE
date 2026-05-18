import { useMemo } from 'react'
import { BottomDock } from '../../components/dock/BottomDock'
import { HistoryPanel } from '../../components/history/HistoryPanel'
import { LayoutDockPlaceholder } from '../../components/layout/LayoutDockPlaceholder'
import { LayoutModeBanner } from '../../components/layout/LayoutModeBanner'
import { LayoutSidebarPlaceholder } from '../../components/layout/LayoutSidebarPlaceholder'
import { OrderBookPanel } from '../../components/orderbook/OrderBookPanel'
import { OrderPanel } from '../../components/order/OrderPanel'
import { MarketSidebar } from '../../components/sidebar/MarketSidebar'
import { TickerBar } from '../../components/ticker/TickerBar'
import { TradingViewChart } from '../../components/chart/TradingViewChart'
import { IntegrationSlot } from '../../components/common/IntegrationSlot'
import {
  getLayoutModeBannerCopy,
  isOrderPanelReadOnly,
  shouldShowBottomDock,
  shouldShowChromeSidebar,
  shouldShowIntegrationSlot,
} from '../../config/layoutUiGuards'
import type { SymbolSpec } from '../../core/symbols/SymbolSpec'
import { useEffectiveLayoutFlags } from '../../hooks/useEffectiveLayoutFlags'
import { useMarketSubscription } from '../../hooks/useMarketSubscription'
import { HtsLayout } from '../../layouts/HtsLayout'
import { TradingLayout } from '../../layouts/TradingLayout'
import { useTradingStore } from '../../store/tradingStore'
import type { TradingWindowBundle } from '../../tradingWindow/tradingWindowPresetTypes'
import {
  tradingWindowDockInitialTab,
  tradingWindowDockTabBarClass,
  wrapTradingWindowDock,
  wrapTradingWindowOrderBook,
  wrapTradingWindowOrderPanel,
} from '../../tradingWindow/panels/wrapTradingWindowPanelChrome'
import { useTradingWindowBundle } from '../../tradingWindow/useTradingWindowBundle'
import { useTenantWhitelabelStore } from '../../whitelabel/tenantWhitelabelStore'
import type { MarketId } from '../types'

type Props = {
  marketId: MarketId
  onMarketChange: (id: MarketId) => void
  /** 모바일 fallback 헤더 슬롯 (TradingLayout 위에 표시) */
  mobileHeaderSlot?: React.ReactNode
}

type SlotWrapProps = {
  showBadge: boolean
  source: '05-SpeedOrder' | '02-TGX-CEX'
  module: string
  state?: 'planned' | 'in-progress'
  note?: string
  children: React.ReactNode
}

function twpWorkspaceProps(bundle: TradingWindowBundle | null): {
  className?: string
} & Record<string, string | undefined> {
  if (!bundle) return {}
  return {
    className: bundle.classNames.workspace,
    ...bundle.dataAttributes,
  }
}

function SlotWrap({ showBadge, source, module, state, note, children }: SlotWrapProps) {
  if (!showBadge) return <>{children}</>
  return (
    <IntegrationSlot source={source} module={module} state={state} note={note}>
      {children}
    </IntegrationSlot>
  )
}

/**
 * 모든 시장이 동일하게 사용하는 트레이딩 뷰.
 *
 * - 데스크탑(lg+): HtsLayout (사이드바 + 차트 + 호가 + 주문 + 하단 dock, 모두 resizable)
 * - 모바일/태블릿: 기존 TradingLayout (세로 스택)
 * - Layout flags: `resolveEffectiveLayoutFlags` via `useEffectiveLayoutFlags` (UI guards only)
 */
export function UniversalMarketView({ marketId, onMarketChange, mobileHeaderSlot }: Props) {
  useMarketSubscription(marketId)

  const tenantPreset = useTenantWhitelabelStore((s) => s.preset)
  const twBundle = useTradingWindowBundle(tenantPreset, marketId)
  const layoutFlags = useEffectiveLayoutFlags()
  const bannerCopy = useMemo(() => getLayoutModeBannerCopy(layoutFlags), [layoutFlags])
  const rawSpeedState = twBundle?.preset.speedOrder.integrationState ?? 'planned'
  const speedState: 'planned' | 'in-progress' =
    rawSpeedState === 'integrated' ? 'in-progress' : rawSpeedState
  const slotModule = (key: keyof TradingWindowBundle['preset']['speedOrder']['moduleLabels'], fallback: string) =>
    twBundle?.preset.speedOrder.moduleLabels[key] ?? fallback
  const showSpeedOrderSlot = shouldShowIntegrationSlot(layoutFlags, 'speedOrderChrome')
  const showChromeSidebar = shouldShowChromeSidebar(layoutFlags)
  const showBottomDock = shouldShowBottomDock(layoutFlags)
  const orderReadOnly = isOrderPanelReadOnly(layoutFlags)

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

  const orderPanel = (
    <OrderPanel
      key={`${marketId}:${board.activeSymbol}`}
      marketId={marketId}
      spec={activeSpec}
      lastPrice={board.lastPrice}
      readOnly={orderReadOnly}
    />
  )

  return (
    <>
      <div
        className={`hidden h-full min-h-0 lg:flex lg:flex-col ${twBundle?.classNames.workspace ?? ''}`}
        {...twpWorkspaceProps(twBundle)}
      >
        <LayoutModeBanner copy={bannerCopy} />
        <div className="min-h-0 flex-1">
          <HtsLayout
            htsGrid={twBundle?.htsGrid ?? null}
            showSidebar={showChromeSidebar}
            showDock={showBottomDock}
            sidebar={
              showChromeSidebar ? (
                <MarketSidebar activeMarket={marketId} onMarketChange={onMarketChange} />
              ) : (
                <LayoutSidebarPlaceholder />
              )
            }
            chart={
              <SlotWrap
                showBadge={showSpeedOrderSlot}
                source="05-SpeedOrder"
                module={slotModule('chart', 'ChartArea + DOM')}
                state={speedState}
                note="TradingView 위젯 임시 사용 — 5번 차트 모듈로 교체 예정"
              >
                <TradingViewChart spec={activeSpec} lastPrice={board.lastPrice} changePct={changePct} />
              </SlotWrap>
            }
            orderBook={
              <SlotWrap
                showBadge={showSpeedOrderSlot}
                source="05-SpeedOrder"
                module={slotModule('orderBook', 'OrderBookPanel (HTS)')}
                state={speedState}
                note="현재 mock 호가. 5번 HTS 호가창으로 교체 예정"
              >
                {wrapTradingWindowOrderBook(
                  twBundle,
                  <OrderBookPanel book={board.orderBook} spec={activeSpec} lastPrice={board.lastPrice} />,
                )}
              </SlotWrap>
            }
            orderPanel={
              <SlotWrap
                showBadge={showSpeedOrderSlot}
                source="05-SpeedOrder"
                module={slotModule('orderPanel', 'SpeedOrderPanel + StopMit')}
                state={speedState}
                note="현재 카테고리 config 기반 mock. 5번 거래 엔진 통합 예정"
              >
                {wrapTradingWindowOrderPanel(twBundle, orderPanel)}
              </SlotWrap>
            }
            dock={
              showBottomDock ? (
                <SlotWrap
                  showBadge={showSpeedOrderSlot}
                  source="05-SpeedOrder"
                  module={slotModule('dock', 'PositionPanel + TradeHistoryPanel')}
                  state={speedState}
                  note="포지션·체결 표는 5번 패널로 교체 예정"
                >
                  {wrapTradingWindowDock(
                    twBundle,
                    <BottomDock
                      key={`dock:${twBundle?.preset.profileId ?? 'default'}`}
                      marketId={marketId}
                      symbols={board.symbols}
                      positions={board.positions}
                      orders={board.orders}
                      fills={board.fills}
                      initialTab={tradingWindowDockInitialTab(twBundle)}
                      tabBarClassName={tradingWindowDockTabBarClass(twBundle)}
                    />,
                  )}
                </SlotWrap>
              ) : (
                <LayoutDockPlaceholder />
              )
            }
          />
        </div>
      </div>

      <div
        className={`flex h-full min-h-0 flex-col lg:hidden ${twBundle?.classNames.workspace ?? ''}`}
        {...twpWorkspaceProps(twBundle)}
        data-ute-twp-viewport="mobile"
      >
        <LayoutModeBanner copy={bannerCopy} />
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
          orderBook={wrapTradingWindowOrderBook(
            twBundle,
            <OrderBookPanel book={board.orderBook} spec={activeSpec} lastPrice={board.lastPrice} />,
          )}
          orderPanel={wrapTradingWindowOrderPanel(twBundle, orderPanel)}
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
