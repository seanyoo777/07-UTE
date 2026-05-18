import { describe, expect, it } from 'vitest'
import {
  buildDefaultGlobalDiagnosticsScope,
  buildMockGlobalDiagnosticsBundle,
} from './buildMockGlobalDiagnostics'
import {
  buildGlobalDiagnosticsCenterViewModel,
  validateGlobalDiagnosticsUiWiring,
} from './globalDiagnosticsUiAdapter'

describe('globalDiagnosticsUiAdapter', () => {
  it('builds diagnostics-ui header and source rows', () => {
    const bundle = buildMockGlobalDiagnosticsBundle({
      scope: buildDefaultGlobalDiagnosticsScope('ute-demo-tenant'),
    })
    const vm = buildGlobalDiagnosticsCenterViewModel(bundle)

    expect(vm.header.mockOnly).toBe(true)
    expect(vm.sourceRows).toHaveLength(4)
    expect(vm.issueCountLabel).toContain('PASS')
    expect(validateGlobalDiagnosticsUiWiring(bundle).ok).toBe(true)
  })
})
