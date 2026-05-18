# UTE AI Proposal Queue (mock)

Mock **AI operations proposal** workflow in **07-UTE** — review and status changes only. Aligns with TetherTeam AI operations principles (human-in-the-loop, no autonomous execution). See also `docs/UTE_INCIDENT_REVIEW.md` and `docs/UTE_GLOBAL_DIAGNOSTICS_CENTER.md`.

## ProposalSnapshot

| Field | Notes |
|-------|--------|
| `schemaVersion` | `1.0.0` |
| `id` | `proposal-{prefix}-{seq}` |
| `category` | `operations` \| `security` \| `integration` \| `diagnostics` |
| `severity` | `info` \| `warning` \| `critical` |
| `proposalType` | `config_review` \| `monitoring` \| `escalation` \| `runbook` |
| `source` | unified / `global-diagnostics` / `operator` |
| `scope` | `PlatformDiagnosticsScope` |
| `createdAt` | ms |
| `status` | `draft` \| `pending_review` \| `approved` \| `rejected` \| `deferred` |
| `mockAiSummary` | Shown when `enableProposalAiSummary` |
| `mockImpactSummary` | Mock impact text |
| `operatorNote` | Editable in board |
| `relatedIncidentIds` | From incident draft |
| `relatedGlobalDiagnosticsSnapshotId` | Optional global diag ref |
| `relatedDiagnosticsSnapshotId` | Optional platform diag ref |
| `mockOnly` | Always `true` |

## Proposal Queue Board

- **Component:** `ProposalQueueBoard` on `/admin`
- **Flags:** `chrome.enableProposalQueue`, `chrome.enableProposalAiSummary`
- **UI:** severity chips, status pills, AI summary block (optional), operator actions (status only)

## Integration

| Source | Action |
|--------|--------|
| **Incident Review** | Button **Create proposal draft** → `buildProposalFromIncident` |
| **Global Diagnostics** | Button on WARN/FAIL aggregate → `buildProposalFromGlobalDiagnostics` |

Store: `useProposalQueueStore` (in-memory, max **12** per `scopeKey`).

## Audit (append-only)

| Action | When |
|--------|------|
| `proposal.created` | Draft created from incident or global snapshot |
| `proposal.reviewed` | Status `draft` → `pending_review` |
| `proposal.status_changed` | Any other status transition |

## Self-test

- `proposal-queue-flag`
- `proposal-queue-schema`
- `proposal-queue-mock-only`
- `proposal-queue-no-websocket`

## Constraints

- **No autonomous execution** — approve/reject does not change production systems
- **No auto remediation**
- **No WebSocket / external API**
- Emergency profile disables proposal queue + AI summary blocks

## Code map

| Piece | Path |
|-------|------|
| Types | `src/platform/proposalQueue/proposalQueueTypes.ts` |
| Builders | `buildProposalSnapshot.ts` |
| Store | `proposalQueueStore.ts` |
| Board | `ProposalQueueBoard.tsx` |
| Audit | `proposalQueueAudit.ts` |
