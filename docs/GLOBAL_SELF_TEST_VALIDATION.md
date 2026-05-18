# Global Self-Test & Validation Rule

**Applies to:** All TetherGet MVP platform repos (including **07-UTE**).  
**Mode:** mock / demo first — no live execution, settlement, or on-chain processing.

---

## Core principles

1. **Self-testable structure** — New features ship with a way to verify behavior without live brokers or WebSockets.
2. **Admin post-change validation** — After admin/state changes, an automated or one-click re-check must be possible (mock).
3. **Mock diagnostics panel** — A persistent diagnostics surface (admin and/or in-app) stays available in demo builds.
4. **PASS / WARN / FAIL** — Every check reports one of three verdicts (no ambiguous “green/red only”).
5. **Telemetry chrome** — Show **issue count**, **last checked**, and a **mock only** badge on diagnostics UI.
6. **Append-only audit (mock)** — Audit trails are in-memory append-only; no silent edits/deletes in UI.
7. **build / lint / test / smoke** — CI or documented scripts: `npm run test`, `npm run lint`, `npm run build` (and optional smoke).
8. **No WebSocket required** — Validation must pass in offline/mock mode.
9. **Feature flags & fallback** — Layout/feature-flag and emergency/read-only fallbacks are included in self-test suites.
10. **Additive only** — Extend via new panels/checks; do not remove existing user-facing features without approval.

---

## Prohibited in validation paths

- Real trade execution or order routing to production brokers  
- Real settlement, transfers, or prize payout  
- Real on-chain transactions  
- Production destructive actions (purge DB, force push, etc.)  
- Uncontrolled realtime loops (tight `setInterval` probes without backoff/guard)

---

## Common platform surfaces

Every platform should maintain equivalents of:

| Surface | Purpose (07-UTE mapping) |
|---------|-------------------------|
| **Self-Test Center** | `AdminSelfTestCenterPanel` + `runUteSelfTestSuite()` — one-click mock suite |
| **Diagnostics Panel** | `AdminSystemHealthPanel`, `AdminBridgeHealthTable`, `AdminRiskAlertList`, BRG panel |
| **Audit Trail** | `adminAuditLog` + `AdminAuditLogPanel` (append-only mock) |
| **Feature Flag Validation** | `resolveEffectiveLayoutFlags` checks in self-test suite |
| **Smoke Test** | Documented: `npm run test` · `lint` · `build` (CI/local; not run inside browser) |

---

## 07-UTE implementation anchors

| Item | Location |
|------|----------|
| Self-test types & runner | `src/admin/selfTest/uteSelfTestTypes.ts`, `runUteSelfTestSuite.ts` |
| Self-Test Center UI | `src/admin/AdminSelfTestCenterPanel.tsx` |
| System diagnostics | `src/admin/adminSystemHealth.ts`, `AdminSystemHealthPanel.tsx` |
| Audit | `src/admin/adminAuditLog.ts`, `useAdminAccessStore.log` |
| Layout flags | `src/config/layoutFeatureFlags.ts`, `layoutUiGuards.ts` |
| Env template | `.env.example` (public); `.env.local` (gitignored) |

---

## When to update

- New admin capabilities → add self-test check + audit action if user-visible.  
- New feature flags → extend `runUteSelfTestSuite` and `UTE_LAYOUT_FEATURE_FLAGS.md`.  
- Architecture changes → update `MASTER_MANUAL.md`, `AGENTS.md`, and this file.
