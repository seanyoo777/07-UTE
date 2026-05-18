import type { ReactNode } from 'react'
import type { TradingWindowBundle } from '../tradingWindowPresetTypes'
import { mapPositionDefaultTab } from '../tradingWindowPanelChrome'
import { TradingWindowDockChrome } from './TradingWindowDockChrome'
import { TradingWindowOrderBookChrome } from './TradingWindowOrderBookChrome'
import { TradingWindowOrderPanelChrome } from './TradingWindowOrderPanelChrome'

export function wrapTradingWindowOrderBook(
  bundle: TradingWindowBundle | null,
  node: ReactNode,
): ReactNode {
  if (!bundle) return node
  return <TradingWindowOrderBookChrome bundle={bundle}>{node}</TradingWindowOrderBookChrome>
}

export function wrapTradingWindowOrderPanel(
  bundle: TradingWindowBundle | null,
  node: ReactNode,
): ReactNode {
  if (!bundle) return node
  return <TradingWindowOrderPanelChrome bundle={bundle}>{node}</TradingWindowOrderPanelChrome>
}

export function wrapTradingWindowDock(
  bundle: TradingWindowBundle | null,
  node: ReactNode,
): ReactNode {
  if (!bundle) return node
  return <TradingWindowDockChrome bundle={bundle}>{node}</TradingWindowDockChrome>
}

export function tradingWindowDockInitialTab(
  bundle: TradingWindowBundle | null,
): 'positions' | 'open' | 'fills' | 'orders' | undefined {
  if (!bundle) return undefined
  return mapPositionDefaultTab(bundle.preset.positionPanel.defaultTab)
}

export function tradingWindowDockTabBarClass(bundle: TradingWindowBundle | null): string | undefined {
  if (!bundle) return undefined
  return bundle.classNames.dockPanel
}
