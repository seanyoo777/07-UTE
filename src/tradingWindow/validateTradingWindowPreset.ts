import {
  MOBILE_STACK_SLOT_IDS,
  TRADING_WINDOW_PROFILE_IDS,
  TRADING_WINDOW_SCHEMA_VERSION,
  type TradingWindowPreset,
} from './tradingWindowPresetTypes'

export function validateTradingWindowPreset(preset: TradingWindowPreset): {
  ok: boolean
  message: string
} {
  if (preset.schemaVersion !== TRADING_WINDOW_SCHEMA_VERSION) {
    return { ok: false, message: 'schemaVersion mismatch' }
  }
  if (preset.mockOnly !== true) {
    return { ok: false, message: 'mockOnly must be true' }
  }
  if (!TRADING_WINDOW_PROFILE_IDS.includes(preset.profileId)) {
    return { ok: false, message: 'invalid profileId' }
  }
  if (!preset.label?.trim()) {
    return { ok: false, message: 'label required' }
  }
  const levels = preset.orderBook.levelCount
  if (levels !== 10 && levels !== 15 && levels !== 20) {
    return { ok: false, message: 'orderBook.levelCount invalid' }
  }
  for (const slot of preset.mobile.stackOrder) {
    if (!MOBILE_STACK_SLOT_IDS.includes(slot)) {
      return { ok: false, message: `invalid mobile stack slot: ${slot}` }
    }
  }
  return { ok: true, message: 'trading window preset valid' }
}
