# UTE diagnostics-ui view-model wiring (PHASE35)

Additive wiring for **07-UTE** `PlatformDiagnosticsPanel` — header and row data via `@tetherget/diagnostics-ui`, without changing shell layout or live APIs.

## Package

- `packages/diagnostics-ui` — shared view-model helpers (`buildDiagnosticsCenterHeader`, `buildDiagnosticsTableRowsFromResult`, labels).
- Dependency: `@tetherget/diagnostics-ui` in `07-UTE/package.json` (built in `prebuild` / `pretest`).

## Adapter

| File | Role |
|------|------|
| `src/platform/diagnostics/diagnosticsUiAdapter.ts` | `buildUteDiagnosticsPanelViewModel`, `validateUteDiagnosticsUiWiring` |
| `src/platform/diagnostics/DiagnosticsUiRowsList.tsx` | Presentational list for `DiagnosticsTableRow[]` |
| `src/admin/selfTest/uteSelfTestCoreAdapter.ts` | Produces `UteSelfTestCoreBundle` (legacy + core) |

Flow:

1. `runUteSelfTestSuite()` → legacy `SelfTestReport`
2. `buildUteSelfTestCoreBundle(legacy)` → `core` (`SelfTestResult`)
3. `buildUteDiagnosticsPanelViewModel(bundle)`:
   - **Header:** `buildDiagnosticsCenterHeader(core)`
   - **Suite rows:** `buildDiagnosticsTableRowsFromResult(core)` (used in VM; suite count exposed on panel via `data-diagnostics-ui-suite-count`)
   - **Top checks:** `buildTopCheckRowsFromLegacy(legacy)` (first 6 checks)

## Panel

`src/platform/PlatformDiagnosticsPanel.tsx`:

- Keeps `data-testid="platform-diagnostics-panel"`, `data-ute-self-test-core-*`, mockOnly badge, scope/recent/layout blocks.
- **Header block:** `data-testid="diagnostics-ui-header"` — issue summary and overall from diagnostics-ui formatters.
- **Top checks:** `DiagnosticsUiRowsList` with `data-testid="diagnostics-ui-row-{id}"`.
- **Audit:** `platform_diagnostics_ui_view` on first panel view (`logPlatformDiagnosticsUiView`).

## Self-test

`runUteSelfTestSuite` appends check `diagnostics-ui-wiring` (PASS when `validateUteDiagnosticsUiWiring` succeeds on interim report before wiring checks).

## Constraints

- **mockOnly** — `header.mockOnly` must stay `true`.
- **No WebSocket**, external HTTP, live trading, or **05-SpeedOrder** changes.
- Append-only platform audit only.

## Related

- `docs/UTE_SELF_TEST_CORE_ADAPTER.md` — `@tetherget/self-test-core` thin adapter.
- `docs/UTE_PLATFORM_SHELL.md` — shell and diagnostics entry.
