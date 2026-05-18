import { describe, expect, it } from 'vitest'
import { buildAdminSystemHealthSnapshot } from '../admin/adminSystemHealth'
import { buildMockSecurityAdminBundle } from '../bridges/shared/securityMockBundle'
import { initialSnapshots } from '../bridges/shared/bridgeProbeRunner'
import { buildPlatformDiagnosticsScope } from './platformScope'
import { buildMockUnifiedEvents } from './buildMockUnifiedEvents'
import type { PlatformDiagnosticsSnapshot } from './platformDiagnosticsTypes'
import { runMockTenantConfigValidation } from './tenantContext/runMockTenantConfigValidation'
import { UNIFIED_EVENT_SOURCES } from './unifiedEventTypes'

describe('buildMockUnifiedEvents', () => {
  it('includes all source lanes when mock panels present', () => {
    const scope = buildPlatformDiagnosticsScope('tenant-test')
    const snapshots = initialSnapshots()
    snapshots.oneai = {
      ...snapshots.oneai,
      oneaiPanel: {
        strategyCount: 3,
        recentSignalCount: 5,
        aggregateWinrate: '55% (mock)',
        aggregatePnl: '+100 USD (mock)',
        riskLevel: 'medium',
      },
    }
    snapshots.tetherget = {
      ...snapshots.tetherget,
      tethergetPanel: {
        schemaVersion: '1',
        p2pCount: 2,
        escrowLockedCount: 1,
        disputeCount: 0,
        referralPending: 0,
        walletRisk: 'low',
        adminRisk: 'low',
        fallbackState: 'mock',
        summaryLine: 'mock escrow line',
      },
    }
    const securityAdmin = buildMockSecurityAdminBundle()
    const health = buildAdminSystemHealthSnapshot({
      snapshots,
      securityAdmin,
      integration: null,
      lastProbeRunAt: null,
      asOf: Date.now(),
    })
    const latestDiagnostics: PlatformDiagnosticsSnapshot = {
      id: 'diag-test-1',
      scope,
      asOf: Date.now(),
      mockOnly: true,
      overall: 'PASS',
      issueCount: { pass: 10, warn: 0, fail: 0 },
      highlights: ['layout-defaults · PASS'],
    }
    const tenantValidation = runMockTenantConfigValidation({
      tenantId: 'tenant-test',
      companyId: 'co-test',
      platformId: scope.platformId,
      workspaceScopeKey: scope.scopeKey,
    })
    const events = buildMockUnifiedEvents({
      scope,
      snapshots,
      health,
      latestDiagnostics,
      auditTailAction: 'view_admin',
      tenantValidation,
    })
    const sources = new Set(events.map((e) => e.source))
    for (const src of UNIFIED_EVENT_SOURCES) {
      expect(sources.has(src)).toBe(true)
    }
    expect(events.every((e) => e.mockOnly === true)).toBe(true)
  })
})
