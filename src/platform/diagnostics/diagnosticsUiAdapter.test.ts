import { describe, expect, it } from 'vitest'
import { runUteSelfTestSuite } from '../../admin/selfTest/runUteSelfTestSuite'
import { buildUteSelfTestCoreBundle } from '../../admin/selfTest/uteSelfTestCoreAdapter'
import {
  buildUteDiagnosticsPanelViewModel,
  validateUteDiagnosticsUiWiring,
} from './diagnosticsUiAdapter'

describe('diagnosticsUiAdapter', () => {
  it('builds header and rows from core bundle', () => {
    const report = runUteSelfTestSuite({ bridgeErrorCount: 0, auditEntryCount: 1 })
    const checks = report.checks.filter(
      (c) => c.id !== 'self-test-core-wiring' && c.id !== 'diagnostics-ui-wiring',
    )
    const interim = {
      ...report,
      checks,
      issueCount: {
        pass: checks.filter((c) => c.verdict === 'PASS').length,
        warn: checks.filter((c) => c.verdict === 'WARN').length,
        fail: checks.filter((c) => c.verdict === 'FAIL').length,
      },
    }
    const bundle = buildUteSelfTestCoreBundle(interim)
    const vm = buildUteDiagnosticsPanelViewModel(bundle)

    expect(vm.header.mockOnly).toBe(true)
    expect(vm.suiteRows.length).toBeGreaterThanOrEqual(1)
    expect(vm.topCheckRows.length).toBeGreaterThanOrEqual(1)
    expect(vm.issueCountLabel).toContain('PASS')
    expect(validateUteDiagnosticsUiWiring(interim, bundle.core).ok).toBe(true)
  })
})
