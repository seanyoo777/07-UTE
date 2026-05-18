import type { GlobalDiagnosticsSourceId } from './globalDiagnosticsTypes'

export type GlobalDiagnosticsSourceMeta = {
  id: GlobalDiagnosticsSourceId
  appLabel: string
  productName: string
}

export const GLOBAL_DIAGNOSTICS_SOURCE_META: Record<
  GlobalDiagnosticsSourceId,
  GlobalDiagnosticsSourceMeta
> = {
  '01-p2p': { id: '01-p2p', appLabel: '01 P2P', productName: 'TetherGet P2P' },
  '03-oneai': { id: '03-oneai', appLabel: '03 OneAI', productName: 'OneAI Strategy' },
  '10-gamehub': { id: '10-gamehub', appLabel: '10 GameHub', productName: 'GameHub Arena' },
  '11-streamhub': {
    id: '11-streamhub',
    appLabel: '11 StreamHub',
    productName: 'StreamHub Live',
  },
}
