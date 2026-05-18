# UTE AI Incident Review (mock)

Mock **review / triage** layer for operational issues in **07-UTE**. No automated remediation, no external AI API, no WebSocket.

## IncidentReviewSnapshot

| Field | Type | Notes |
|-------|------|--------|
| `schemaVersion` | `1.0.0` | Self-test validated |
| `id` | string | `incident-{source}-{seq}` |
| `source` | unified source \| `global-diagnostics` | Originating feed |
| `severity` | `info` \| `warning` \| `critical` | From unified event or derived |
| `scope` | `PlatformDiagnosticsScope` | `platformId:tenantId` |
| `createdAt` | number | ms |
| `mockOnly` | `true` | Always |
| `resolutionStatus` | `open` \| `reviewed` \| `mock_resolved` | Operator mock actions |
| `triageVerdict` | `PASS` \| `WARN` \| `FAIL` | Display + diagnostics-ui labels |
| `relatedDiagnosticsSnapshotId` | optional | Platform self-test snapshot |
| `relatedGlobalDiagnosticsSnapshotId` | optional | Global diagnostics snapshot |
| `relatedEventIds` | string[] | Unified feed event ids |
| `title` / `body` | string | Summary copy |
| `mockAiRecommendation` | string | Shown when `enableIncidentAiSummary` |
| `mockRootCauseSummary` | string | Mock only — not live RCA |
| `mockOperatorNote` | string | Editable in board |

## Incident Review Board

- **Component:** `IncidentReviewBoard` on `/admin`
- **Flag:** `chrome.enableIncidentReview` (`VITE_UTE_ENABLE_INCIDENT_REVIEW`, default `true`)
- **AI blocks:** `chrome.enableIncidentAiSummary` (`VITE_UTE_ENABLE_INCIDENT_AI_SUMMARY`)
- **Actions:** Mark reviewed · Mock resolve (audit only — **no system changes**)

## Diagnostics integration

| Trigger | Path |
|---------|------|
| Unified feed | `useUnifiedEventStore.append` → `ingestFromUnifiedEvent` when severity warning/critical or diagnostics + snapshot id |
| Platform diagnostics | Via unified `appendFromDiagnostics` event (links `diagnosticsSnapshotId`) |
| Global diagnostics | `GlobalDiagnosticsCenterPanel` → `ingestFromGlobalDiagnostics` when overall WARN/FAIL |

Store: `useIncidentReviewStore` — in-memory, max **12** per `scopeKey`.

## Audit (append-only)

| Action | When |
|--------|------|
| `incident.reviewed` | Operator clicks Mark reviewed |
| `incident.mock_resolved` | Operator clicks Mock resolve |

## Self-test

- `incident-review-flag`
- `incident-review-schema`
- `incident-review-mock-only`
- `incident-review-no-websocket`

## Constraints

- **No auto remediation** — buttons update mock status + audit only
- **No WebSocket / polling / external API**
- Platform Shell UI unchanged (board lives on admin dashboard)
- Emergency profile disables incident review + AI summary

## Related

- `docs/UTE_UNIFIED_EVENT_FEED.md`
- `docs/UTE_DIAGNOSTICS_UI_WIRING.md`
- `docs/UTE_GLOBAL_DIAGNOSTICS_CENTER.md`
