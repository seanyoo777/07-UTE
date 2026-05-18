import { describe, expect, it } from 'vitest'
import { runUteSelfTestSuite } from './runUteSelfTestSuite'

describe('runUteSelfTestSuite', () => {
  it('returns mock-only report with PASS/WARN/FAIL counts', () => {
    const report = runUteSelfTestSuite({ bridgeErrorCount: 0, auditEntryCount: 1 })
    expect(report.mockOnly).toBe(true)
    expect(report.checks.length).toBeGreaterThan(5)
    const total =
      report.issueCount.pass + report.issueCount.warn + report.issueCount.fail
    expect(total).toBe(report.checks.length)
    expect(report.smokeCommands).toContain('npm run test')
  })

  it('flags bridge errors as WARN or FAIL', () => {
    const ok = runUteSelfTestSuite({ bridgeErrorCount: 0 })
    const bad = runUteSelfTestSuite({ bridgeErrorCount: 5 })
    const okProbe = ok.checks.find((c) => c.id === 'admin-bridge-probe')
    const badProbe = bad.checks.find((c) => c.id === 'admin-bridge-probe')
    expect(okProbe?.verdict).toBe('PASS')
    expect(badProbe?.verdict).toBe('FAIL')
  })

  it('validates emergency layout fallback', () => {
    const report = runUteSelfTestSuite()
    const emergency = report.checks.find((c) => c.id === 'layout-emergency-profile')
    expect(emergency?.verdict).toBe('PASS')
  })

  it('includes unified event feed checks', () => {
    const report = runUteSelfTestSuite({ unifiedEventCount: 2 })
    expect(report.checks.find((c) => c.id === 'unified-event-feed-flag')?.verdict).toBe('PASS')
    expect(report.checks.find((c) => c.id === 'unified-event-storage')?.verdict).toBe('PASS')
    expect(report.checks.find((c) => c.id === 'unified-event-no-websocket')?.verdict).toBe('PASS')
  })

  it('includes workspace context router checks', () => {
    const report = runUteSelfTestSuite()
    expect(report.checks.find((c) => c.id === 'workspace-context-router-flag')?.verdict).toBe('PASS')
    expect(report.checks.find((c) => c.id === 'workspace-context-no-websocket')?.verdict).toBe('PASS')
  })

  it('includes tenant context bridge checks', () => {
    const report = runUteSelfTestSuite()
    expect(report.checks.find((c) => c.id === 'tenant-context-bridge-flag')?.verdict).toBe('PASS')
    expect(report.checks.find((c) => c.id === 'tenant-validation-mock-only')?.verdict).toBe('PASS')
  })

  it('includes global diagnostics center checks', () => {
    const report = runUteSelfTestSuite()
    expect(report.checks.find((c) => c.id === 'global-diagnostics-center-flag')?.verdict).toBe('PASS')
    expect(report.checks.find((c) => c.id === 'global-diagnostics-ui-wiring')?.verdict).toBe('PASS')
    expect(report.checks.find((c) => c.id === 'global-diagnostics-no-websocket')?.verdict).toBe('PASS')
  })

  it('includes incident review checks', () => {
    const report = runUteSelfTestSuite()
    expect(report.checks.find((c) => c.id === 'incident-review-schema')?.verdict).toBe('PASS')
    expect(report.checks.find((c) => c.id === 'incident-review-mock-only')?.verdict).toBe('PASS')
    expect(report.checks.find((c) => c.id === 'incident-review-no-websocket')?.verdict).toBe('PASS')
  })

  it('includes proposal queue checks', () => {
    const report = runUteSelfTestSuite()
    expect(report.checks.find((c) => c.id === 'proposal-queue-schema')?.verdict).toBe('PASS')
    expect(report.checks.find((c) => c.id === 'proposal-queue-mock-only')?.verdict).toBe('PASS')
    expect(report.checks.find((c) => c.id === 'proposal-queue-no-websocket')?.verdict).toBe('PASS')
  })

  it('includes risk graph checks', () => {
    const report = runUteSelfTestSuite()
    expect(report.checks.find((c) => c.id === 'risk-graph-schema')?.verdict).toBe('PASS')
    expect(report.checks.find((c) => c.id === 'risk-graph-mock-only')?.verdict).toBe('PASS')
    expect(report.checks.find((c) => c.id === 'risk-graph-no-websocket')?.verdict).toBe('PASS')
  })

  it('includes operations timeline checks', () => {
    const report = runUteSelfTestSuite()
    expect(report.checks.find((c) => c.id === 'operations-timeline-schema')?.verdict).toBe('PASS')
    expect(report.checks.find((c) => c.id === 'operations-timeline-mock-only')?.verdict).toBe('PASS')
    expect(report.checks.find((c) => c.id === 'operations-timeline-no-websocket')?.verdict).toBe('PASS')
  })
})
