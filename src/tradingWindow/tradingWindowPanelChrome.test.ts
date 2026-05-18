import { describe, expect, it } from 'vitest'
import { resolveWhitelabelPreset } from '../whitelabel/tenantPresetRegistry'
import { resolveTradingWindowBundle } from './resolveTradingWindowBundle'
import {
  resolveDockTabStyleChrome,
  resolveOrderBookDensityChrome,
  resolveOrderFormChromeMode,
} from './tradingWindowPanelChrome'

describe('tradingWindowPanelChrome', () => {
  it('maps tenant profiles to panel chrome modes', () => {
    const goldx = resolveTradingWindowBundle(resolveWhitelabelPreset('goldx'))
    expect(resolveOrderBookDensityChrome(goldx.preset)).toBe('standard')
    expect(resolveOrderFormChromeMode(goldx.preset)).toBe('premium')
    expect(goldx.classNames.positionPanel).toContain('ute-twp-panel-position')
    expect(goldx.classNames.dockPanel).toContain('ute-twp-dock-tabs-elevated')

    const futures = resolveTradingWindowBundle(resolveWhitelabelPreset('prime-futures'))
    expect(resolveOrderBookDensityChrome(futures.preset)).toBe('futures-emphasis')
    expect(resolveOrderFormChromeMode(futures.preset)).toBe('fast')
    expect(resolveDockTabStyleChrome(futures.preset)).toBe('compact')
  })

  it('exposes panel chrome data attributes', () => {
    const bundle = resolveTradingWindowBundle(resolveWhitelabelPreset('bluetrade'))
    expect(bundle.dataAttributes['data-ute-twp-panel-form-mode']).toBe('standard')
    expect(bundle.dataAttributes['data-ute-twp-panel-dock-tabs']).toBe('elevated')
  })
})
