/**
 * 05 SpeedOrder `src/vendor` export surface (mock).
 *
 * 연결 후보:
 * - `SPEED_ORDER_ENGINE_STATUS`
 * - `speedOrderSymbolRegistry`
 * - `ORDER_EXECUTION_POLICY`
 * - `readSpeedOrderVendorSerializableSnapshot`
 */
export type {
  SpeedOrderEngineStatusValue,
  SpeedOrderRegistryRow,
  SpeedOrderVendorSerializableSnapshot,
} from './types'

export { ORDER_EXECUTION_POLICY } from './types'

export {
  readSpeedOrderVendorSerializableSnapshot,
  SPEED_ORDER_ENGINE_STATUS,
  speedOrderSymbolRegistry,
} from './mockVendorSurface'
