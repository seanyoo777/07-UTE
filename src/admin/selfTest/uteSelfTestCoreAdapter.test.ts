import { describe, expect, it } from 'vitest'
import { runUteSelfTestSuite } from './runUteSelfTestSuite'
import {
  UTE_SELF_TEST_SUITE_ID,
  buildUteSelfTestCoreBundle,
  buildUteSelfTestCoreResult,
  validateUteSelfTestCoreWiring,
} from './uteSelfTestCoreAdapter'
import { deriveSelfTestOverall } from '../../platform/deriveSelfTestOverall'

describe('uteSelfTestCoreAdapter', () => {
  it('builds core result with mockOnly and matching overall', () => {
    const report = runUteSelfTestSuite({ bridgeErrorCount: 0, auditEntryCount: 1 })
    const core = buildUteSelfTestCoreResult(report)

    expect(core.mockOnly).toBe(true)
    expect(core.suites[0]?.id).toBe(UTE_SELF_TEST_SUITE_ID)
    expect(core.overall).toBe(deriveSelfTestOverall(report.issueCount))
    expect(core.issueCount).toBe(report.issueCount.fail)
    expect(core.warnCount).toBe(report.issueCount.warn)
    expect(core.passCount).toBe(report.issueCount.pass)
  })

  it('bundle exposes legacy and core together', () => {
    const report = runUteSelfTestSuite()
    const bundle = buildUteSelfTestCoreBundle(report)
    expect(bundle.legacy).toBe(report)
    expect(bundle.core.overall).toBe(deriveSelfTestOverall(report.issueCount))
  })

  it('validateUteSelfTestCoreWiring passes for default suite (without wiring check)', () => {
    const full = runUteSelfTestSuite({ bridgeErrorCount: 0, auditEntryCount: 1 })
    const checks = full.checks.filter((c) => c.id !== 'self-test-core-wiring')
    let pass = 0
    let warn = 0
    let fail = 0
    for (const c of checks) {
      if (c.verdict === 'PASS') pass++
      else if (c.verdict === 'WARN') warn++
      else fail++
    }
    const interim = { ...full, checks, issueCount: { pass, warn, fail } }
    expect(validateUteSelfTestCoreWiring(interim).ok).toBe(true)
  })

  it('runUteSelfTestSuite includes self-test-core-wiring check', () => {
    const report = runUteSelfTestSuite({ bridgeErrorCount: 0, auditEntryCount: 1 })
    const wiringCheck = report.checks.find((c) => c.id === 'self-test-core-wiring')
    expect(wiringCheck?.verdict).toBe('PASS')
  })

  it('runUteSelfTestSuite includes diagnostics-ui-wiring check', () => {
    const report = runUteSelfTestSuite({ bridgeErrorCount: 0, auditEntryCount: 1 })
    const wiringCheck = report.checks.find((c) => c.id === 'diagnostics-ui-wiring')
    expect(wiringCheck?.verdict).toBe('PASS')
  })
})
