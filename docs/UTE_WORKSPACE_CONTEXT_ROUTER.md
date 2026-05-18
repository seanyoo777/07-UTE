# UTE Workspace Context Router

Additive mock navigation from **Unified Event Feed** → **workspace context panels** (no routing API, no WebSocket).

## Behavior

1. **Workspace context rail** — `PlatformWorkspaceContextRail` at top of platform workspace (`UtePlatformShell`).
2. Five panels: `oneai`, `escrow`, `streamhub`, `admin`, `diagnostics` (aligned with unified event sources).
3. **Click unified feed** source chip or event row → `navigateTo(source, eventId)` → active panel **highlight** (ring + background).
4. **Tenant scope** — navigation only when `scopeKey === platformId:tenantId`; mismatch rejected.
5. **Diagnostics** — selecting `diagnostics` context opens `PlatformDiagnosticsPanel` (mock side effect).
6. **mockOnly** — routes carry `mockOnly: true`; audit detail notes mock.

## Feature flag

- `chrome.enableWorkspaceContextRouter` (default `true`)
- Env: `VITE_UTE_ENABLE_WORKSPACE_CONTEXT_ROUTER`
- Guard: `shouldEnableWorkspaceContextRouter()`
- Emergency profile: `false`

## State

- `useWorkspaceContextStore` — in-memory `activeContext`, `activeEventId`, `lastRoute`
- `useWorkspaceContextRouter()` — syncs tenant scope, wraps navigate + audit

## Audit (append-only)

| Action | When |
|--------|------|
| `platform_workspace_context_navigate` | Successful `navigateTo` |

## Self-test

`runUteSelfTestSuite` checks:

- `workspace-context-router-flag`
- `workspace-context-mock-only`
- `workspace-context-tenant-scope`
- `workspace-context-no-websocket`

## Constraints

- No WebSocket, live trading API, or external HTTP
- Does not remove Unified Event Feed, Platform Shell, or Diagnostics
- **05-SpeedOrder** not modified

## Code

| Piece | Path |
|-------|------|
| Store | `src/platform/workspaceContextStore.ts` |
| Hook | `src/platform/useWorkspaceContextRouter.ts` |
| Rail UI | `src/platform/PlatformWorkspaceContextRail.tsx` |
| Feed wiring | `src/platform/PlatformUnifiedEventFeed.tsx` |
| Shell | `src/platform/UtePlatformShell.tsx` |

See also: `docs/UTE_UNIFIED_EVENT_FEED.md`, `docs/UTE_PLATFORM_SHELL.md`
