import { describe, expect, it } from 'vitest'
import { resolveWhitelabelPreset } from '../whitelabel/tenantPresetRegistry'
import { resolveTradingWindowBundle } from './resolveTradingWindowBundle'
import {
  buildHtsGridDataAttributes,
  buildHtsGridInlineStyle,
  htsGridSharePercent,
} from './tradingWindowHtsGridCss'
import { seedHtsLayoutPixelsFromGrid } from './seedHtsLayoutFromGrid'

describe('tradingWindowHtsGridCss', () => {
  it('builds grid data attributes and css vars', () => {
    const bundle = resolveTradingWindowBundle(resolveWhitelabelPreset('goldx'))
    const attrs = buildHtsGridDataAttributes(bundle.htsGrid)
    expect(attrs['data-ute-twp-grid-chart']).toBe('5')
    const style = buildHtsGridInlineStyle(bundle.htsGrid, { bookPx: 300, orderPx: 340 })
    expect(style['--ute-twp-flex-chart']).toBe('5')
    expect(style['--ute-twp-book-width']).toBe('300px')
  })

  it('seeds book/order px from weights', () => {
    const grid = { chart: 5, orderBook: 2, orderPanel: 2 }
    const { bookPx, orderPx } = seedHtsLayoutPixelsFromGrid(grid, 900)
    expect(bookPx).toBeGreaterThanOrEqual(220)
    expect(orderPx).toBeGreaterThanOrEqual(280)
    expect(htsGridSharePercent(grid, 'chart')).toBe(56)
  })
})
