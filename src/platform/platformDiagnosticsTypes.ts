import type { SelfTestIssueCount, SelfTestVerdict } from '../admin/selfTest/uteSelfTestTypes'
import type { PlatformDiagnosticsScope } from './platformScope'

export type PlatformDiagnosticsSnapshot = {
  id: string
  scope: PlatformDiagnosticsScope
  asOf: number
  mockOnly: true
  overall: SelfTestVerdict
  issueCount: SelfTestIssueCount
  /** Short labels for recent list UI */
  highlights: string[]
}
