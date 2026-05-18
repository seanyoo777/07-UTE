# UTE Cross-App Risk Graph (mock)

Mock **risk visualization** for partner apps in **07-UTE** — derived from Global Diagnostics, Incident Review, and Proposal Queue. No monitoring transport, no autonomous actions.

## CrossAppRiskSnapshot (per app node)

| Field | Notes |
|-------|--------|
| `appId` | `01-p2p` \| `03-oneai` \| `10-gamehub` \| `11-streamhub` \| `ute-07` |
| `appLabel` | Display label |
| `severity` | `info` \| `warning` \| `critical` (from diagnostics health) |
| `riskScoreMock` | 0–99 deterministic mock score |
| `activeIssues` | Open incidents + active proposals for app |
| `diagnosticsHealth` | `PASS` \| `WARN` \| `FAIL` from global diagnostics cards |
| `proposalPressure` | `low` \| `medium` \| `high` |
| `incidentPressure` | `low` \| `medium` \| `high` |
| `trend` | `up` \| `down` \| `stable` (mock indicator) |
| `mockOnly` | Always `true` |

## CrossAppRiskGraphSnapshot (board aggregate)

- `passWarnFailMap` — count of apps by diagnostics health
- `proposalPressureSummary` — draft / pending / approved counts
- `incidentTrendSummary` — open / critical / warning counts
- `relatedGlobalDiagnosticsId` — latest global snapshot id
- `relatedIncidentIds` / `relatedProposalIds` — session refs

## Risk Graph Board

- **Component:** `CrossAppRiskGraphBoard` on `/admin`
- **Flag:** `chrome.enableRiskGraph` (`VITE_UTE_ENABLE_RISK_GRAPH`, default `true`)
- **UI:** PASS/WARN/FAIL map, proposal/incident summaries, per-app cards with trend chips

## Integration

| Source | Usage |
|--------|--------|
| **Global Diagnostics** | Per-app `diagnosticsHealth`; `relatedGlobalDiagnosticsId` |
| **Incident Review** | `incidentPressure`, `incidentTrendSummary`, `relatedIncidentIds` |
| **Proposal Queue** | `proposalPressure`, `proposalPressureSummary`, `relatedProposalIds` |

Built at render time via `buildCrossAppRiskGraph()` — no separate persistence layer.

## Audit

| Action | When |
|--------|------|
| `risk_graph_view` | First board view per mount |

## Self-test

- `risk-graph-flag`
- `risk-graph-schema`
- `risk-graph-mock-only`
- `risk-graph-no-websocket`

## Constraints

- **No monitoring API / WebSocket / polling**
- **No auto remediation** — visualization only
- Emergency profile disables risk graph

## Related

- `docs/UTE_GLOBAL_DIAGNOSTICS_CENTER.md`
- `docs/UTE_INCIDENT_REVIEW.md`
- `docs/UTE_PROPOSAL_QUEUE.md`
