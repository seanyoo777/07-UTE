import { describe, expect, it } from 'vitest'
import { scopeFromScopeKey } from './parseScopeKey'

describe('scopeFromScopeKey', () => {
  it('parses platformId:tenantId', () => {
    const scope = scopeFromScopeKey('ute-07:demo-tenant')
    expect(scope.platformId).toBe('ute-07')
    expect(scope.tenantId).toBe('demo-tenant')
    expect(scope.scopeKey).toBe('ute-07:demo-tenant')
  })
})
