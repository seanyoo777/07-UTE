# UTE Global Operations Timeline (mock)

Chronological **operations review** layer in **07-UTE** — merges diagnostics, incidents, proposals, and risk graph into one mock timeline. No remediation, no transport.

## OperationsTimelineSnapshot

| Field | Notes |
|-------|--------|
| `schemaVersion` | `1.0.0` |
| `scope` | `PlatformDiagnosticsScope` |
| `generatedAtMs` | Build timestamp |
| `mockOnly` | Always `true` |
| `events` | Unified rows sorted newest-first |
| `diagnosticsMarkers` | Global + per-app diagnostics |
| `incidentMarkers` | From incident review store |
| `proposalMarkers` | From proposal queue store |
| `riskGraphMarkers` | From risk graph aggregate |
| `passWarnFailCount` | Diagnostics health map |
| `proposalPressureSummary` | Text summary |
| `incidentTrendSummary` | Text summary |

### OperationsTimelineEvent (unified row)

- `kind`: `diagnostics` \| `incident` \| `proposal` \| `risk_graph`
- `at`, `label`, `detail`, `refId`
- Optional `verdict` (PASS/WARN/FAIL), `severity`

## Operations Timeline Board

- **Component:** `OperationsTimelineBoard` on `/admin`
- **Flag:** `chrome.enableOperationsTimeline` (`VITE_UTE_ENABLE_OPERATIONS_TIMELINE`, default `true`)
- **UI:** PASS/WARN/FAIL map, proposal/incident summaries, unified timeline list (max 20 rows)

## Integration

```
buildOperationsTimeline({
  globalBundle     → diagnosticsMarkers (+ global snapshot)
  incidents        → incidentMarkers
  proposals        → proposalMarkers
  riskGraph        → riskGraphMarkers + passWarnFail + pressure summaries
})
```

Built at render from in-memory stores — same session data as Incident Review, Proposal Queue, Risk Graph, and Global Diagnostics.

## Audit

| Action | When |
|--------|------|
| `operations_timeline_view` | First board view per mount |

## Self-test

- `operations-timeline-flag`
- `operations-timeline-schema`
- `operations-timeline-mock-only`
- `operations-timeline-no-websocket`

## Constraints

- **No auto remediation**
- **No WebSocket / external API / monitoring transport**
- Emergency profile disables timeline

## Related

- `docs/UTE_GLOBAL_DIAGNOSTICS_CENTER.md`
- `docs/UTE_INCIDENT_REVIEW.md`
- `docs/UTE_PROPOSAL_QUEUE.md`
- `docs/UTE_RISK_GRAPH.md`
