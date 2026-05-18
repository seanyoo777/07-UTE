import {
  buildSelfTestResult,
  resolveOverallVerdict,
  resolveSuiteStatusFromIssues,
  type SelfTestResult,
  type Verdict,
} from '@tetherget/self-test-core'
import { deriveSelfTestOverall } from '../../platform/deriveSelfTestOverall'
import type { SelfTestCheck, SelfTestReport, SelfTestVerdict } from './uteSelfTestTypes'

export const UTE_SELF_TEST_SUITE_ID = 'ute-mock-self-test'

export type UteSelfTestCoreBundle = {
  /** Existing UTE report shape — unchanged for UI and snapshots. */
  legacy: SelfTestReport
  /** Aggregated result from @tetherget/self-test-core. */
  core: SelfTestResult
}

function checkToIssue(check: SelfTestCheck) {
  return {
    id: check.id,
    message: check.detail ?? check.label,
    status: check.verdict as Verdict,
    suiteId: UTE_SELF_TEST_SUITE_ID,
  }
}

/**
 * Wrap a completed UTE mock report with {@link buildSelfTestResult}.
 * No network — pure mapping only.
 */
export function buildUteSelfTestCoreResult(report: SelfTestReport): SelfTestResult {
  const issues = report.checks.map(checkToIssue)
  const suiteStatus = resolveSuiteStatusFromIssues(issues)

  return buildSelfTestResult({
    suites: [
      {
        id: UTE_SELF_TEST_SUITE_ID,
        label: 'UTE mock self-test',
        status: suiteStatus,
        issues,
        passCount: report.issueCount.pass,
        warnCount: report.issueCount.warn,
        failCount: report.issueCount.fail,
      },
    ],
    mockOnly: report.mockOnly,
    lastCheckedAtMs: report.asOf,
  })
}

/** Legacy report + core aggregate for diagnostics panels. */
export function buildUteSelfTestCoreBundle(report: SelfTestReport): UteSelfTestCoreBundle {
  return {
    legacy: report,
    core: buildUteSelfTestCoreResult(report),
  }
}

/**
 * Validates adapter wiring — used by self-test suite and unit tests.
 * Pass an interim report **without** the `self-test-core-wiring` check.
 */
export function validateUteSelfTestCoreWiring(report: SelfTestReport): {
  ok: boolean
  message: string
} {
  const core = buildUteSelfTestCoreResult(report)
  const legacyOverall = deriveSelfTestOverall(report.issueCount)

  if (core.mockOnly !== true) {
    return { ok: false, message: 'core.mockOnly must be true' }
  }
  if (core.overall !== legacyOverall) {
    return {
      ok: false,
      message: `core.overall ${core.overall} !== legacy ${legacyOverall}`,
    }
  }
  if (core.suites.length !== 1 || core.suites[0]?.id !== UTE_SELF_TEST_SUITE_ID) {
    return { ok: false, message: 'expected single suite ute-mock-self-test' }
  }
  if (core.issueCount !== report.issueCount.fail) {
    return {
      ok: false,
      message: `core.issueCount ${core.issueCount} !== legacy fail ${report.issueCount.fail}`,
    }
  }
  if (core.warnCount !== report.issueCount.warn) {
    return {
      ok: false,
      message: `core.warnCount ${core.warnCount} !== legacy warn ${report.issueCount.warn}`,
    }
  }

  const expectedSuiteStatus = resolveOverallVerdict(
    report.checks.map((c) => c.verdict as Verdict),
  )
  if (core.suites[0]?.status !== expectedSuiteStatus) {
    return {
      ok: false,
      message: `suite.status ${core.suites[0]?.status} !== ${expectedSuiteStatus}`,
    }
  }

  return { ok: true, message: '@tetherget/self-test-core adapter wired' }
}

export function resolveUteOverallWithCore(checks: readonly SelfTestCheck[]): SelfTestVerdict {
  if (checks.length === 0) return 'PASS'
  return resolveOverallVerdict(checks.map((c) => c.verdict as Verdict))
}
