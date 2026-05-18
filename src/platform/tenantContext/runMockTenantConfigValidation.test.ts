import { describe, expect, it } from 'vitest'
import { detectScopeMismatch } from './detectScopeMismatch'
import { runMockTenantConfigValidation } from './runMockTenantConfigValidation'

describe('runMockTenantConfigValidation', () => {
  it('PASS when workspace scope matches tenant/platform', () => {
    const snap = runMockTenantConfigValidation({
      tenantId: 'tenant-a',
      companyId: 'co-a',
      platformId: 'ute-07',
      workspaceScopeKey: 'ute-07:tenant-a',
    })
    expect(snap.overall).toBe('PASS')
    expect(snap.mockOnly).toBe(true)
    expect(snap.source).toBe('12-TGX-TokenAdmin')
  })

  it('FAIL when workspace scope mismatches', () => {
    const snap = runMockTenantConfigValidation({
      tenantId: 'tenant-a',
      companyId: 'co-a',
      platformId: 'ute-07',
      workspaceScopeKey: 'ute-07:wrong-tenant',
    })
    expect(snap.overall).toBe('FAIL')
    const scopeCheck = snap.checks.find((c) => c.id === 'scope-key')
    expect(scopeCheck?.verdict).toBe('FAIL')
  })
})

describe('detectScopeMismatch', () => {
  it('returns diagnostic when keys differ', () => {
    const d = detectScopeMismatch({
      workspaceScopeKey: 'ute-07:a',
      expectedScopeKey: 'ute-07:b',
      tenantId: 'a',
      companyId: 'co',
      platformId: 'ute-07',
    })
    expect(d?.message).toContain('≠')
  })
})
