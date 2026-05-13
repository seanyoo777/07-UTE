import type { MarketDef, MarketId } from './types'

export const MARKETS: MarketDef[] = [
  {
    id: 'kr-stock',
    label: '국내주식',
    shortLabel: 'KR',
    quoteCurrency: 'KRW',
    defaultSymbol: '005930',
    sessionHint: 'regular',
  },
  {
    id: 'us-stock',
    label: '미국주식',
    shortLabel: 'US',
    quoteCurrency: 'USD',
    defaultSymbol: 'AAPL',
    sessionHint: 'regular',
  },
  {
    id: 'kr-futures',
    label: '국내선물',
    shortLabel: 'KRF',
    quoteCurrency: 'KRW',
    defaultSymbol: 'KOSPI200',
    sessionHint: 'futures',
  },
  {
    id: 'global-futures',
    label: '해외선물',
    shortLabel: 'GF',
    quoteCurrency: 'USD',
    defaultSymbol: 'NQ',
    sessionHint: 'futures',
  },
  {
    id: 'crypto',
    label: '코인',
    shortLabel: 'CRY',
    quoteCurrency: 'USDT',
    defaultSymbol: 'BTCUSDT',
    sessionHint: '24h',
  },
]

export const MARKETS_BY_ID: Record<MarketId, MarketDef> = MARKETS.reduce(
  (acc, m) => {
    acc[m.id] = m
    return acc
  },
  {} as Record<MarketId, MarketDef>,
)

export function getMarketDef(id: MarketId): MarketDef {
  return MARKETS_BY_ID[id]
}
