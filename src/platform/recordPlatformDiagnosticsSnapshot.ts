import type { SelfTestReport } from '../admin/selfTest/uteSelfTestTypes'
import type { PlatformDiagnosticsScope } from './platformScope'
import type { PlatformDiagnosticsSnapshot } from './platformDiagnosticsTypes'
import { deriveSelfTestOverall } from './deriveSelfTestOverall'

let snapshotSeq = 0

export function recordPlatformDiagnosticsSnapshot(
  scope: PlatformDiagnosticsScope,
  report: SelfTestReport,
): PlatformDiagnosticsSnapshot {
  snapshotSeq += 1
  const overall = deriveSelfTestOverall(report.issueCount)
  const highlights = report.checks.slice(0, 4).map((c) => `${c.label} · ${c.verdict}`)
  return {
    id: `diag-${scope.scopeKey}-${snapshotSeq}`,
    scope,
    asOf: report.asOf,
    mockOnly: true,
    overall,
    issueCount: { ...report.issueCount },
    highlights,
  }
}
