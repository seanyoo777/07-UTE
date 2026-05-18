# UTE — `@tetherget/self-test-core` adapter (Phase 35)

**Status:** additive thin adapter · mock-only · no app runner refactor

---

## Purpose

Map existing `runUteSelfTestSuite()` / `SelfTestReport` to the shared
`buildSelfTestResult` shape so 07-UTE aligns with Global Operations Core without
removing local checks, categories, or Platform Shell UI.

---

## Files

| File | Role |
|------|------|
| `src/admin/selfTest/uteSelfTestCoreAdapter.ts` | `buildUteSelfTestCoreResult`, `buildUteSelfTestCoreBundle`, `validateUteSelfTestCoreWiring` |
| `src/admin/selfTest/runUteSelfTestSuite.ts` | Appends check `self-test-core-wiring` (PASS when adapter matches legacy) |
| `src/platform/PlatformDiagnosticsPanel.tsx` | Uses bundle; exposes `data-ute-self-test-core-*` on panel root |

---

## Usage

```ts
import { runUteSelfTestSuite } from './runUteSelfTestSuite'
import { buildUteSelfTestCoreBundle } from './uteSelfTestCoreAdapter'

const legacy = runUteSelfTestSuite({ bridgeErrorCount: 0 })
const { legacy: report, core } = buildUteSelfTestCoreBundle(legacy)
// report — existing UI / snapshots
// core   — SelfTestResult for shared ops / future diagnostics-ui
```

---

## Invariants

- `core.mockOnly === true`
- `core.overall === deriveSelfTestOverall(report.issueCount)`
- `core.issueCount === report.issueCount.fail` (core FAIL tally)
- `core.warnCount === report.issueCount.warn`
- Single suite id: `ute-mock-self-test`

---

## Forbidden

- WebSocket, outbound API, live broker, real trade/settlement
- Changes to 05-SpeedOrder or other apps from this adapter

---

## Verification

```bash
cd 07-UTE
npm test
npm run lint
npm run build
```

Package: `npm test` in `packages/self-test-core`.

---

*See `docs/GLOBAL_OPERATIONS_CORE.md` and `PHASE35_REPORT.md`.*
