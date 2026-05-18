import type { TradingWindowHtsGrid, TradingWindowProfileId } from './tradingWindowPresetTypes'

export const HTS_GRID_BY_PROFILE: Record<TradingWindowProfileId, TradingWindowHtsGrid> = {
  'private-bank': { chart: 5, orderBook: 2, orderPanel: 2 },
  'broker-hts': { chart: 4, orderBook: 2, orderPanel: 2 },
  'global-futures': { chart: 3, orderBook: 2, orderPanel: 3 },
  'institutional-desk': { chart: 4, orderBook: 3, orderPanel: 2 },
  'mobile-mts': { chart: 4, orderBook: 2, orderPanel: 2 },
}

export function getHtsGridForProfile(profileId: TradingWindowProfileId): TradingWindowHtsGrid {
  return { ...HTS_GRID_BY_PROFILE[profileId] }
}

export function clampHtsGridWeight(n: number, min = 1, max = 8): number {
  if (!Number.isFinite(n)) return min
  return Math.max(min, Math.min(max, Math.round(n)))
}
