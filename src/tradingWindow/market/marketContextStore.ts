import { create } from 'zustand'
import type { MarketId } from '../../markets/types'
import type { MarketContextPresetId } from './marketContextPresetTypes'
import { resolveDefaultMarketContextId } from './resolveMarketContextPreset'

type MarketContextState = {
  /** Admin / Preview Center session selection (overrides route market when set). */
  previewContextId: MarketContextPresetId | null
  revision: number
  setPreviewContextId: (id: MarketContextPresetId) => void
  clearPreviewContext: () => void
  getEffectiveContextId: (marketId?: MarketId) => MarketContextPresetId
}

export const useMarketContextStore = create<MarketContextState>()((set, get) => ({
  previewContextId: null,
  revision: 0,
  setPreviewContextId: (id) =>
    set({ previewContextId: id, revision: get().revision + 1 }),
  clearPreviewContext: () => {
    if (!get().previewContextId) return
    set({ previewContextId: null, revision: get().revision + 1 })
  },
  getEffectiveContextId: (marketId) => {
    const preview = get().previewContextId
    if (preview) return preview
    if (marketId) return resolveDefaultMarketContextId(marketId)
    return 'swing'
  },
}))
