import type { TradingWindowHtsGrid } from '../tradingWindowPresetTypes'
import type { MobileStackSlotId } from '../tradingWindowPresetTypes'

export type HtsWireframeModel = {
  chart: number
  book: number
  order: number
  dockOpen: boolean
  orderBookEmphasis: boolean
}

export type MobileWireframeModel = {
  stackOrder: MobileStackSlotId[]
  bottomSheet: 'off' | 'half' | 'full'
  thumbZone: 'left' | 'right' | 'balanced'
  safeInsetPx: number
}

const SLOT_LABELS: Record<MobileStackSlotId, string> = {
  ticker: 'Ticker',
  chart: 'Chart',
  book: 'Book',
  order: 'Order',
  history: 'Hist',
}

export function buildHtsWireframeModel(
  grid: TradingWindowHtsGrid,
  opts: { dockOpen?: boolean; orderBookEmphasis?: boolean } = {},
): HtsWireframeModel {
  return {
    chart: grid.chart,
    book: grid.orderBook,
    order: grid.orderPanel,
    dockOpen: opts.dockOpen ?? true,
    orderBookEmphasis: opts.orderBookEmphasis ?? false,
  }
}

export function buildMobileWireframeModel(
  stackOrder: MobileStackSlotId[],
  bottomSheet: MobileWireframeModel['bottomSheet'],
  thumbZone: MobileWireframeModel['thumbZone'],
): MobileWireframeModel {
  return {
    stackOrder,
    bottomSheet,
    thumbZone,
    safeInsetPx: thumbZone === 'right' ? 12 : thumbZone === 'left' ? 12 : 6,
  }
}

export function slotLabel(slot: MobileStackSlotId): string {
  return SLOT_LABELS[slot]
}
