import type { BridgeId } from './bridgeTypes'

export const BRIDGE_DISPLAY: Record<
  BridgeId,
  { displayName: string; productCode: string }
> = {
  tetherget: { displayName: 'TetherGet-P2P', productCode: '01-TetherGet' },
  tgx: { displayName: 'TGX-CEX', productCode: '02-TGX-CEX' },
  oneai: { displayName: 'OneAI', productCode: '03-OneAI' },
  mockinvest: { displayName: 'MockInvest', productCode: '04-MockInvest' },
  speedorder: { displayName: 'SpeedOrder', productCode: '05-SpeedOrder' },
}
