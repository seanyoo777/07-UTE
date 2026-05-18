import type { SelfTestResult } from '@tetherget/self-test-core'
import {
  buildDiagnosticsCenterHeader,
  buildDiagnosticsTableRowsFromResult,
  formatIssueCountSummary,
  formatLastCheckedLabel,
  type DiagnosticsCenterHeaderVm,
  type DiagnosticsTableRow,
} from '@tetherget/diagnostics-ui'
import type { SelfTestReport } from '../../admin/selfTest/uteSelfTestTypes'
import type { UteSelfTestCoreBundle } from '../../admin/selfTest/uteSelfTestCoreAdapter'

export type UteDiagnosticsPanelViewModel = {
  header: DiagnosticsCenterHeaderVm
  suiteRows: DiagnosticsTableRow[]
  topCheckRows: DiagnosticsTableRow[]
  issueCountLabel: string
  lastCheckedLabel: string
}

export function buildTopCheckRowsFromLegacy(
  report: SelfTestReport,
  limit = 6,
): DiagnosticsTableRow[] {
  return report.checks.slice(0, limit).map((c) => ({
    id: c.id,
    label: c.label,
    status: c.verdict,
    issueCount: c.verdict === 'FAIL' ? 1 : c.verdict === 'WARN' ? 1 : 0,
    description: c.detail,
  }))
}

/**
 * View-model for PlatformDiagnosticsPanel — header/rows via @tetherget/diagnostics-ui.
 */
export function buildUteDiagnosticsPanelViewModel(
  bundle: UteSelfTestCoreBundle,
  options?: { topCheckLimit?: number },
): UteDiagnosticsPanelViewModel {
  const { legacy, core } = bundle
  const header = buildDiagnosticsCenterHeader(core)
  const suiteRows = buildDiagnosticsTableRowsFromResult(core)
  const topCheckRows = buildTopCheckRowsFromLegacy(legacy, options?.topCheckLimit ?? 6)

  return {
    header,
    suiteRows,
    topCheckRows,
    issueCountLabel: formatIssueCountSummary(header.pass, header.warn, header.fail),
    lastCheckedLabel: formatLastCheckedLabel(header.lastCheckedAtMs),
  }
}

export function validateUteDiagnosticsUiWiring(
  report: SelfTestReport,
  core: SelfTestResult,
): { ok: boolean; message: string } {
  const vm = buildUteDiagnosticsPanelViewModel({ legacy: report, core })

  if (!vm.header.mockOnly) {
    return { ok: false, message: 'header.mockOnly must be true' }
  }
  if (vm.header.overall !== core.overall) {
    return { ok: false, message: 'header.overall !== core.overall' }
  }
  if (vm.suiteRows.length < 1) {
    return { ok: false, message: 'expected suiteRows from buildDiagnosticsTableRowsFromResult' }
  }
  if (vm.topCheckRows.length < 1) {
    return { ok: false, message: 'expected topCheckRows from legacy checks' }
  }
  if (!vm.issueCountLabel.includes('PASS')) {
    return { ok: false, message: 'issueCountLabel not formatted' }
  }
  if (vm.suiteRows[0]?.id !== core.suites[0]?.id) {
    return { ok: false, message: 'suite row id mismatch' }
  }

  return { ok: true, message: '@tetherget/diagnostics-ui view-model wired' }
}
