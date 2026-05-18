import type { MobileStackSlotId, TradingWindowPreset } from '../tradingWindowPresetTypes'

export const MOBILE_VISUAL_PRESET_IDS = [
  'compact',
  'balanced',
  'futures',
  'mobile-mts',
] as const

export type MobileVisualPresetId = (typeof MOBILE_VISUAL_PRESET_IDS)[number]

export type MobileStackPreviewModel = {
  presetId: MobileVisualPresetId
  label: string
  stackOrder: MobileStackSlotId[]
  stickyHeader: TradingWindowPreset['mobile']['stickyHeader']
  bottomSheetOrder: TradingWindowPreset['mobile']['bottomSheetOrder']
  thumbZone: TradingWindowPreset['mobile']['thumbZone']
  compactTicker: boolean
}

export const MOBILE_VISUAL_PRESETS: Record<MobileVisualPresetId, MobileStackPreviewModel> = {
  compact: {
    presetId: 'compact',
    label: 'Compact MTS',
    stackOrder: ['ticker', 'chart', 'book', 'order', 'history'],
    stickyHeader: 'ticker',
    bottomSheetOrder: 'half',
    thumbZone: 'balanced',
    compactTicker: true,
  },
  balanced: {
    presetId: 'balanced',
    label: 'Balanced retail',
    stackOrder: ['ticker', 'chart', 'book', 'order', 'history'],
    stickyHeader: 'ticker',
    bottomSheetOrder: 'half',
    thumbZone: 'balanced',
    compactTicker: false,
  },
  futures: {
    presetId: 'futures',
    label: 'Futures thumb',
    stackOrder: ['ticker', 'chart', 'order', 'book', 'history'],
    stickyHeader: 'chart-toolbar',
    bottomSheetOrder: 'full',
    thumbZone: 'right',
    compactTicker: false,
  },
  'mobile-mts': {
    presetId: 'mobile-mts',
    label: 'Mobile MTS',
    stackOrder: ['ticker', 'chart', 'order', 'book', 'history'],
    stickyHeader: 'ticker',
    bottomSheetOrder: 'full',
    thumbZone: 'balanced',
    compactTicker: true,
  },
}

export function isValidStackOrder(order: string[]): order is MobileStackSlotId[] {
  if (order.length !== 5) return false
  const set = new Set(order)
  return MOBILE_VISUAL_PRESETS.balanced.stackOrder.every((slot) => set.has(slot))
}

export function normalizeStackOrder(order: MobileStackSlotId[]): MobileStackSlotId[] {
  const base = MOBILE_VISUAL_PRESETS.balanced.stackOrder
  const seen = new Set<MobileStackSlotId>()
  const out: MobileStackSlotId[] = []
  for (const slot of order) {
    if (base.includes(slot) && !seen.has(slot)) {
      seen.add(slot)
      out.push(slot)
    }
  }
  for (const slot of base) {
    if (!seen.has(slot)) out.push(slot)
  }
  return out
}

export function applyMobileVisualPreset(
  preset: MobileVisualPresetId,
): Pick<TradingWindowPreset['mobile'], 'stackOrder' | 'stickyHeader' | 'bottomSheetOrder' | 'thumbZone' | 'compactTicker'> {
  const m = MOBILE_VISUAL_PRESETS[preset]
  return {
    stackOrder: [...m.stackOrder],
    stickyHeader: m.stickyHeader,
    bottomSheetOrder: m.bottomSheetOrder,
    thumbZone: m.thumbZone,
    compactTicker: m.compactTicker,
  }
}

export function inferMobileVisualPreset(
  stack: MobileStackSlotId[],
  mobile: TradingWindowPreset['mobile'],
): MobileVisualPresetId {
  const key = stack.join(',')
  for (const id of MOBILE_VISUAL_PRESET_IDS) {
    if (MOBILE_VISUAL_PRESETS[id].stackOrder.join(',') === key) {
      return id
    }
  }
  if (mobile.thumbZone === 'right' && mobile.bottomSheetOrder === 'full') return 'futures'
  if (mobile.compactTicker) return 'compact'
  return 'balanced'
}
