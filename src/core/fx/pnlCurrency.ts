import type { MarketId } from '../../markets/types'

/** 국내주식·국내선물: 손익·표시 통화 원화 유지 */
export function isDomesticKrwPnlMarket(marketId: MarketId): boolean {
  return marketId === 'kr-stock' || marketId === 'kr-futures'
}

/**
 * 미국주식·해외선물·코인(USDT): 손익 기준 USD(코인은 USDT를 USD 등가로 표시) + 당일환율 mock 원화 병기
 */
export function isOverseasUsdPnlMarket(marketId: MarketId): boolean {
  return marketId === 'us-stock' || marketId === 'global-futures' || marketId === 'crypto'
}
