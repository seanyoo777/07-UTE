import type { SelfTestVerdict } from '../../admin/selfTest/uteSelfTestTypes'
import type { SelfTestResult } from '@tetherget/self-test-core'
import type { PlatformDiagnosticsScope } from '../platformScope'

export const GLOBAL_DIAGNOSTICS_SOURCE_IDS = [
  '01-p2p',
  '03-oneai',
  '10-gamehub',
  '11-streamhub',
] as const

export type GlobalDiagnosticsSourceId = (typeof GLOBAL_DIAGNOSTICS_SOURCE_IDS)[number]

export type GlobalDiagnosticsSourceCard = {
  id: GlobalDiagnosticsSourceId
  /** Display label e.g. "01 P2P" */
  appLabel: string
  productName: string
  overall: SelfTestVerdict
  pass: number
  warn: number
  fail: number
  lastCheckedAtMs: number
  mockOnly: true
  headline: string
}

export type GlobalDiagnosticsSnapshot = {
  id: string
  scope: PlatformDiagnosticsScope
  asOf: number
  mockOnly: true
  overall: SelfTestVerdict
  issueCount: { pass: number; warn: number; fail: number }
  sourceCount: number
  highlights: string[]
}

export type GlobalDiagnosticsBundle = {
  scope: PlatformDiagnosticsScope
  tenantDisplayName: string
  companyId: string
  sourceCards: GlobalDiagnosticsSourceCard[]
  core: SelfTestResult
  mockOnly: true
}
