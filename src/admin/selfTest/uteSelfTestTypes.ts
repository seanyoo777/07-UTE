export const UTE_SELF_TEST_SCHEMA_VERSION = '1.0.0' as const

export type SelfTestVerdict = 'PASS' | 'WARN' | 'FAIL'

export type SelfTestCategory =
  | 'smoke'
  | 'feature_flags'
  | 'audit'
  | 'admin'
  | 'trading'
  | 'security'
  | 'layout'

export type SelfTestCheck = {
  id: string
  category: SelfTestCategory
  label: string
  verdict: SelfTestVerdict
  detail?: string
}

export type SelfTestIssueCount = {
  pass: number
  warn: number
  fail: number
}

export type SelfTestReport = {
  schemaVersion: typeof UTE_SELF_TEST_SCHEMA_VERSION
  asOf: number
  /** Always true in 07-UTE default path — no live broker validation. */
  mockOnly: true
  issueCount: SelfTestIssueCount
  checks: SelfTestCheck[]
  /** Documented CLI smoke; not executed in browser. */
  smokeCommands: readonly string[]
}
