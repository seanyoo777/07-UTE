import { describe, expect, it } from 'vitest'
import { mapSourceToAppId } from './mapSourceToAppId'

describe('mapSourceToAppId', () => {
  it('maps unified sources to cross-app ids', () => {
    expect(mapSourceToAppId('oneai')).toBe('03-oneai')
    expect(mapSourceToAppId('escrow')).toBe('01-p2p')
    expect(mapSourceToAppId('global-diagnostics')).toBe('ute-07')
  })
})
