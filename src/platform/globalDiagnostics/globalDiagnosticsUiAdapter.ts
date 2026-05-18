import {
  buildDiagnosticsCenterHeader,
  buildDiagnosticsTableRowsFromResult,
  formatIssueCountSummary,
  formatLastCheckedLabel,
  type DiagnosticsCenterHeaderVm,
  type DiagnosticsTableRow,
} from '@tetherget/diagnostics-ui'
import type { GlobalDiagnosticsBundle } from './globalDiagnosticsTypes'

export type GlobalDiagnosticsCenterViewModel = {
  header: DiagnosticsCenterHeaderVm
  sourceRows: DiagnosticsTableRow[]
  issueCountLabel: string
  lastCheckedLabel: string
}

export function buildGlobalDiagnosticsCenterViewModel(
  bundle: GlobalDiagnosticsBundle,
): GlobalDiagnosticsCenterViewModel {
  const header = buildDiagnosticsCenterHeader(bundle.core, {
    title: 'Global Diagnostics Center',
  })
  const sourceRows = buildDiagnosticsTableRowsFromResult(bundle.core)

  return {
    header,
    sourceRows,
    issueCountLabel: formatIssueCountSummary(header.pass, header.warn, header.fail),
    lastCheckedLabel: formatLastCheckedLabel(header.lastCheckedAtMs),
  }
}

export function validateGlobalDiagnosticsUiWiring(
  bundle: GlobalDiagnosticsBundle,
): { ok: boolean; message: string } {
  const vm = buildGlobalDiagnosticsCenterViewModel(bundle)

  if (!vm.header.mockOnly) {
    return { ok: false, message: 'header.mockOnly must be true' }
  }
  if (vm.header.overall !== bundle.core.overall) {
    return { ok: false, message: 'header.overall !== core.overall' }
  }
  if (vm.sourceRows.length !== bundle.sourceCards.length) {
    return { ok: false, message: 'sourceRows length mismatch' }
  }
  if (!vm.issueCountLabel.includes('PASS')) {
    return { ok: false, message: 'issueCountLabel not formatted' }
  }

  return { ok: true, message: 'Global diagnostics-ui VM wired (mock cross-app)' }
}
