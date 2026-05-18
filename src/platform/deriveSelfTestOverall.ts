import type { SelfTestIssueCount, SelfTestVerdict } from '../admin/selfTest/uteSelfTestTypes'

export function deriveSelfTestOverall(issueCount: SelfTestIssueCount): SelfTestVerdict {
  if (issueCount.fail > 0) return 'FAIL'
  if (issueCount.warn > 0) return 'WARN'
  return 'PASS'
}
