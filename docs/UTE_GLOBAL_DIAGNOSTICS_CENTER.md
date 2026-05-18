# UTE Global Diagnostics Center (mock draft)

Cross-app **operational status** draft inside **07-UTE** — aggregates mock PASS/WARN/FAIL for partner apps without real transport.

## Scope

| Source ID | Label | Product |
|-----------|-------|---------|
| `01-p2p` | 01 P2P | TetherGet P2P |
| `03-oneai` | 03 OneAI | OneAI Strategy |
| `10-gamehub` | 10 GameHub | GameHub Arena |
| `11-streamhub` | 11 StreamHub | StreamHub Live |

No HTTP, WebSocket, or polling to other repos. Verdicts are **deterministic mock** from `bridgeErrorCount` (UTE mock bridge dashboard) plus fixed per-source thresholds.

## Aggregation structure

```
buildMockGlobalDiagnosticsBundle()
  ├── sourceCards[]     — per-app PASS/WARN/FAIL + headline
  └── core (SelfTestResult)  — @tetherget/self-test-core buildSelfTestResult(4 suites)
        └── globalDiagnosticsUiAdapter
              ├── buildDiagnosticsCenterHeader(core)
              └── buildDiagnosticsTableRowsFromResult(core)
```

**Cross-app issue summary** (UI): counts how many **apps** are PASS / WARN / FAIL (not summed probe integers).

**UTE local scope**: `platformId:tenantId` from `usePlatformTenantStore` + `DEFAULT_PLATFORM_ID`.

## Mock snapshot structure

`GlobalDiagnosticsSnapshot`:

| Field | Meaning |
|-------|---------|
| `id` | `global-diag-{scopeKey}-{asOf}` |
| `scope` | `PlatformDiagnosticsScope` |
| `asOf` | `core.lastCheckedAtMs` |
| `overall` | `core.overall` (aggregated suite verdict) |
| `issueCount` | Apps in PASS / WARN / FAIL |
| `sourceCount` | `4` |
| `highlights` | e.g. `01 P2P:PASS · …` |

Stored in **`useGlobalDiagnosticsStore`** (in-memory, max 6 per `scopeKey`). Not written to `localStorage` (unlike unified event feed).

## UI

- **Panel:** `GlobalDiagnosticsCenterPanel` on `/admin` when `chrome.enableGlobalDiagnosticsCenter` is true.
- **data-testid:** `global-diagnostics-center-panel`, `global-diagnostics-source-{id}`, `global-diagnostics-ui-header`, etc.
- Platform shell slide-in diagnostics **unchanged**.

## Feature flag

| Flag | Default | Env |
|------|---------|-----|
| `chrome.enableGlobalDiagnosticsCenter` | `true` | `VITE_UTE_ENABLE_GLOBAL_DIAGNOSTICS_CENTER` |

Emergency profile sets this to **`false`**.

Guard: `shouldEnableGlobalDiagnosticsCenter()` in `src/config/layoutUiGuards.ts`.

## Audit (append-only mock)

| Action | When |
|--------|------|
| `global_diagnostics_view` | First panel view per mount |
| `global_diagnostics_snapshot` | First aggregated snapshot record per mount |

Via `globalDiagnosticsAudit.ts` → `useAdminAccessStore`.

## Self-test

`runUteSelfTestSuite` checks:

- `global-diagnostics-center-flag`
- `global-diagnostics-mock-only`
- `global-diagnostics-no-websocket`
- `global-diagnostics-ui-wiring`

## Constraints

- **mockOnly** always `true`
- No cross-app API, WebSocket, or **05-SpeedOrder** changes
- Additive only — existing Platform Shell / Unified Event Feed / Workspace Router / Tenant Bridge preserved

## Code map

| Piece | Path |
|-------|------|
| Types / sources | `src/platform/globalDiagnostics/globalDiagnosticsTypes.ts`, `globalDiagnosticsSourceMeta.ts` |
| Mock builder | `buildMockGlobalDiagnostics.ts` |
| VM adapter | `globalDiagnosticsUiAdapter.ts` |
| Store | `globalDiagnosticsStore.ts` |
| Panel | `GlobalDiagnosticsCenterPanel.tsx` |
| Admin wiring | `src/admin/UnifiedAdminDashboard.tsx` |

## Related

- `docs/UTE_DIAGNOSTICS_UI_WIRING.md` — platform slide-in diagnostics VM
- `docs/UTE_PLATFORM_SHELL.md` — shell entry
- `docs/GLOBAL_SELF_TEST_VALIDATION.md` — PASS/WARN/FAIL contract
