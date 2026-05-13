import { safeNumber } from './safe'

export function roundToTick(price: number, tickSize: number): number {
  const p = safeNumber(price, 0)
  const t = tickSize > 0 ? tickSize : 0.01
  return Math.round(p / t) * t
}

export function roundToLot(qty: number, lotSize: number): number {
  const q = safeNumber(qty, 0)
  const l = lotSize > 0 ? lotSize : 1
  return Math.max(0, Math.round(q / l) * l)
}

export function decimals(value: number, n: number): string {
  const v = safeNumber(value, 0)
  const d = Math.max(0, Math.min(10, n | 0))
  return v.toFixed(d)
}
