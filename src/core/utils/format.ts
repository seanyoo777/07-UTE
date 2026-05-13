import { decimals } from './rounding'
import { safeNumber } from './safe'

export function formatPrice(value: number, priceDecimals: number): string {
  return decimals(value, priceDecimals)
}

export function formatQty(value: number, qtyDecimals: number): string {
  return decimals(value, qtyDecimals)
}

export function formatPct(value: number, fractionDigits = 2): string {
  const v = safeNumber(value, 0)
  const sign = v > 0 ? '+' : ''
  return `${sign}${v.toFixed(fractionDigits)}%`
}

export function formatSignedMoney(value: number, fractionDigits = 2): string {
  const v = safeNumber(value, 0)
  const sign = v > 0 ? '+' : ''
  return `${sign}${v.toLocaleString('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}`
}

export function formatTimeOfDay(timestamp: number): string {
  const d = new Date(safeNumber(timestamp, Date.now()))
  return d.toLocaleTimeString('ko-KR', { hour12: false })
}
