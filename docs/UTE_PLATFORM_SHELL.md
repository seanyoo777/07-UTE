# UTE Platform Shell (MVP)

Additive outer shell for **07-UTE** — wraps trading and `/admin` without changing order engines or live APIs.

## Structure

```
UtePlatformShell
├── PlatformHeader   (tenant label, mockOnly, notifications slot, Diagnostics, Self-Test Center)
├── PlatformSidebar  (feature-flag filtered nav)
├── workspace        (existing HtsTopBar + Premium shell + views, or UnifiedAdminDashboard)
└── PlatformDiagnosticsPanel (optional slide-in, mock self-test summary)
```

## Tenant & diagnostics scope

- Mock tenant: `src/platform/platformTenantStore.ts` (`tenantId`, e.g. `ute-demo-tenant`).
- Platform id: `DEFAULT_PLATFORM_ID` = `ute-07` in `src/platform/platformScope.ts`.
- Diagnostics snapshots are keyed by **`scopeKey = platformId:tenantId`** (in-memory only).

## Unified event feed

- Below notification slot when `chrome.showUnifiedEventFeed` is true.
- See **`docs/UTE_UNIFIED_EVENT_FEED.md`**.

## Workspace context router

- Rail above workspace main when `chrome.enableWorkspaceContextRouter` is true.
- See **`docs/UTE_WORKSPACE_CONTEXT_ROUTER.md`**.

## Tenant context bridge

- Links workspace scope to **12-TGX-TokenAdmin** validation snapshot (mock, read-only).
- See **`docs/UTE_TENANT_CONTEXT_BRIDGE.md`**.

## Notification slot (mock data)

- **UI:** `PlatformNotificationSlot` in `PlatformHeader`.
- **Data:** `buildPlatformMockNotificationFeed()` — same sources as Admin Notification Center (`buildMockAdminNotifications` + bridge/health snapshots). **No WebSocket or push server.**
- **Summary:** unread/critical/warning counts + headline (`summarizePlatformNotifications.ts`).
- **Feature flag:** `chrome.showNotificationSlot` — env `VITE_UTE_SHOW_NOTIFICATION_SLOT` (default `true`). Guard: `shouldShowNotificationSlot()`.

## Diagnostics panel (mock data)

- **Live run:** `runUteSelfTestSuite()` on panel open (bridge error count from mock dashboard).
- **View-model:** header and top-check rows via `@tetherget/diagnostics-ui` (`buildUteDiagnosticsPanelViewModel`) — see **`docs/UTE_DIAGNOSTICS_UI_WIRING.md`**.
- **Recent results:** `usePlatformDiagnosticsStore` keeps up to 8 snapshots per `scopeKey`; panel shows last 3 with PASS/WARN/FAIL counts.
- **Scope block:** displays `platformId`, `tenantId`, and `scopeKey` in the panel header area.
- **mockOnly** badge remains visible.

## Audit (append-only mock)

Platform events append to `useAdminAccessStore` audit log (no server):

| Action | When |
|--------|------|
| `platform_notification_view` | Notification slot first render |
| `platform_diagnostics_open` | Diagnostics panel first open |
| `platform_diagnostics_snapshot` | After recording a scoped self-test snapshot |
| `platform_diagnostics_ui_view` | Diagnostics panel first view (diagnostics-ui VM) |

## Menu visibility

- `src/platform/platformMenuGuards.ts` filters `PLATFORM_NAV_ITEMS` using layout flags.
- **Diagnostics** nav hidden when `emergencyDisable` or `showIntegrationSlots === false`.

## Constraints

- No real trading API, WebSocket, or order execution from this shell.
- **05-SpeedOrder** repo is not modified; SpeedOrder appears only via existing mock bridges.
- Do not remove HTS/Premium shell or trading/admin routes — platform layer is additive only.

## Code

| Piece | Path |
|-------|------|
| Shell | `src/platform/UtePlatformShell.tsx` |
| Notifications | `src/platform/PlatformNotificationSlot.tsx`, `usePlatformMockNotificationFeed.ts` |
| Diagnostics store | `src/platform/platformDiagnosticsStore.ts` |
| App wiring | `src/App.tsx` |
| Tests | `src/platform/*.test.ts`, `src/config/layoutUiGuards.test.ts` |

## Env

See `.env.example` — `VITE_UTE_SHOW_NOTIFICATION_SLOT` (boolean, default on when omitted).
