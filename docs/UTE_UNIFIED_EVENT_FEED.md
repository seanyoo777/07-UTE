# UTE Unified Event Feed Layer

Additive platform layer under **Notification slot** — mock/demo only.

## Purpose

Merge cross-product signals into one **unified event summary** for the Platform Header:

| Source | Mock origin |
|--------|-------------|
| `oneai` | OneAI BRG panel (`snapshots.oneai`) |
| `escrow` | TetherGet ute-surface escrow counts |
| `diagnostics` | Platform diagnostics self-test snapshots |
| `streamhub` | System health market-data lane (no WebSocket) |
| `admin` | Admin health + audit tail action |

## UI

- `PlatformUnifiedEventFeed` — below `PlatformNotificationSlot` in `PlatformHeader`
- Severity badges: `critical` / `warning` / `info`
- Source chips: `oneai`, `escrow`, `diag`, `stream`, `admin`
- **mockOnly** label on feed card
- Preview: up to 3 newest events

## Persistence

- **localStorage** key: `ute-unified-events:v1:{scopeKey}`
- **Max 10** events per `scopeKey` (`platformId:tenantId`, default `ute-07:ute-demo-tenant`)
- In-memory store: `useUnifiedEventStore` — hydrate on scope change

## Feature flag

- `chrome.showUnifiedEventFeed` (default `true`)
- Env: `VITE_UTE_SHOW_UNIFIED_EVENT_FEED`
- Guard: `shouldShowUnifiedEventFeed()`
- Emergency profile: `showUnifiedEventFeed: false`

## Diagnostics link

When `PlatformDiagnosticsPanel` records a snapshot, it calls `appendFromDiagnostics()` — unified feed gets a `diagnostics` event with `diagnosticsSnapshotId`.

## Audit (append-only mock)

| Action | When |
|--------|------|
| `platform_unified_feed_view` | Feed first render |
| `platform_unified_event_append` | New event id appended to store |

## Self-test

`runUteSelfTestSuite` checks:

- `unified-event-feed-flag`
- `unified-event-mock-only`
- `unified-event-storage` (optional `unifiedEventCount`)
- `unified-event-no-websocket`

## Workspace context router

When `chrome.enableWorkspaceContextRouter` is enabled, feed source chips and event rows navigate to the matching workspace panel (highlight). See **`docs/UTE_WORKSPACE_CONTEXT_ROUTER.md`**.

## Constraints

- No WebSocket, no live trading API, no external HTTP from this layer
- **05-SpeedOrder** repo not modified
- Does not remove Notification slot or Diagnostics panel

## Code

| Piece | Path |
|-------|------|
| Types | `src/platform/unifiedEventTypes.ts` |
| List/storage | `unifiedEventList.ts`, `unifiedEventStorage.ts` |
| Mock build | `buildMockUnifiedEvents.ts` |
| Store | `unifiedEventStore.ts` |
| UI | `PlatformUnifiedEventFeed.tsx` |
| Hook | `usePlatformUnifiedEventFeed.ts` |

See also: `docs/UTE_PLATFORM_SHELL.md`
