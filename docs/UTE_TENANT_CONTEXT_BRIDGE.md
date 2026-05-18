# UTE Tenant Context Bridge

Connects **07-UTE** workspace scope with **12-TGX-TokenAdmin** Tenant Config Validation (mock contract only).

## Data flow (mock)

```
platformTenantStore (tenantId, companyId)
  → useTenantContextBridge.hydrate()
  → runMockTenantConfigValidation()  // 12-TGX-TokenAdmin contract shape
  → localStorage `ute-tenant-validation:v1:{scopeKey}`
  → Diagnostics panel (read-only viewer)
  → Unified Event Feed (`tenant` source, PASS/WARN/FAIL)
  → Workspace Context Rail (FAIL/WARN badge)
```

No HTTP, WebSocket, DB write, or tenant provisioning.

## UI surfaces

| Surface | Behavior |
|---------|----------|
| `PlatformTenantContextStrip` | Header: tenantId · companyId · platformId · validation verdict |
| `DiagnosticsTenantValidationSection` | Snapshot viewer, last validation timestamp, scope mismatch block |
| `PlatformWorkspaceContextRail` | `validation FAIL` / `validation WARN` badge when applicable |
| `PlatformUnifiedEventFeed` | `tenant` source event with validation overall |
| Workspace panel **Tenant** | Sixth context lane (mock 12-TGX validation) |

## Scope mismatch diagnostic

When `workspaceScopeKey !== validation.scopeKey`, diagnostics show a **scope mismatch** block and audit logs `platform_scope_mismatch_detected`.

## Feature flag

- `chrome.enableTenantContextBridge` (default `true`)
- Env: `VITE_UTE_ENABLE_TENANT_CONTEXT_BRIDGE`
- Demo FAIL: `VITE_UTE_TENANT_VALIDATION_MOCK_VERDICT=FAIL` or `VITE_UTE_TENANT_VALIDATION_MOCK_FAIL=true`
- Emergency profile: `false`

## Audit (append-only)

| Action | When |
|--------|------|
| `platform_tenant_bridge_view` | First bridge hydrate |
| `platform_tenant_validation_read` | Validation snapshot read |
| `platform_scope_mismatch_detected` | Scope keys differ |

## Self-test

- `tenant-context-bridge-flag`
- `tenant-validation-mock-only`
- `tenant-validation-no-websocket`

## Code

| Piece | Path |
|-------|------|
| Validation runner | `src/platform/tenantContext/runMockTenantConfigValidation.ts` |
| Store | `src/platform/tenantContext/tenantContextBridgeStore.ts` |
| Hook | `src/platform/tenantContext/useTenantContextBridge.ts` |

See also: `docs/UTE_PLATFORM_SHELL.md`, `docs/UTE_UNIFIED_EVENT_FEED.md`
