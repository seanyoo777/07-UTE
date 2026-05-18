# MASTER_MANUAL — 07 UTE (Universal Trading Exchange)

This manual is the **human-facing index** for the repository. It complements `AGENTS.md` (agent rules) and `docs/*.md` (architecture detail).

---

## Product stance

- **07-UTE** is a unified **mock / demo** trading shell: multi-market dashboard, HTS-style layout, no live broker connectivity in the default path.
- **Do not** connect real trading APIs, **do not** execute real orders, **do not** execute real transfers or settlement, **do not** execute real tournament rewards or prize payouts from this codebase’s defaults, and **do not** remove existing user-facing features without explicit approval (`AGENTS.md`, `.cursorrules`).
- **Environment:** use **`.env.example`** as the committed template only; put machine-specific values in **`.env.local`** (gitignored) — **never commit** `.env.local` or `.env.*.local`.
- **Local dev:** `npm run dev` → **http://localhost:5107** (`vite.config.ts`, `strictPort: true`, project `07` — no port fallback).
- **Self-test / validation:** follow **`docs/GLOBAL_SELF_TEST_VALIDATION.md`** — `/admin` includes **Self-Test Center** (PASS/WARN/FAIL, mock only) plus System Health & append-only audit.

---

## Where to look in code

| Area | Path |
|------|------|
| App entry + `/admin` shell | `src/main.tsx`, `src/App.tsx`, `src/appNavigation.ts` |
| **Platform shell** (tenant header · sidebar · workspace) | `src/platform/UtePlatformShell.tsx` — see `docs/UTE_PLATFORM_SHELL.md` |
| HTS top bar + **BRG** + **ADM** | `src/shell/HtsTopBar.tsx` |
| 통합 관리자 대시보드 (mock 읽기 전용) | `src/admin/` (`UnifiedAdminDashboard.tsx`, …) |
| Mock admin RBAC · 감사·알림·헬스·export 마스킹 | `src/admin/adminAccess*.ts`, `adminAuditLog.ts`, `adminNotificationTypes.ts`, `adminSystemHealth.ts`, `adminSnapshotExport.ts` |
| Per-market trading UI | `src/markets/views/*` |
| In-app market adapters (**BrokerAdapter**) | `src/adapters/*`, `src/adapters/index.ts` |
| Trading store | `src/store/tradingStore.ts`, `src/store/boot.ts` |
| Domain types | `src/core/domain/*`, `src/core/symbols/SymbolSpec.ts` |
| TGX CEX mock surface (02 contract) | `src/cex/*` |
| SpeedOrder vendor mock surface (05 contract) | `src/vendor/*` |
| OneAI strategy research mock surface (03 contract) | `src/strategies/*` |
| MockInvest tournament mock surface (04 contract) | `src/mockinvest/*` |
| Integration slot markers | `src/components/common/IntegrationSlot.tsx` |

---

## External product bridges (`src/bridges/`)

UTE separates **(A) on-screen trading** via `BrokerAdapter` from **(B) optional cross-product** integrations. Folder **(B)** is under `src/bridges/`:

| Folder | Partner | Mock responsibilities |
|--------|---------|-------------------------|
| `src/bridges/tetherget/` | **01 TetherGet-P2P** | `ute-surface` schema (`UteSurfacePayload`, `uteSurfaceTypes.ts`), **`tethergetSurfaceClient.ts`** (mock fetch + API stub + fallback helpers), legacy row helpers + `probeTethergetMockBridge` (`tethergetMockBridge.ts`). |
| `src/bridges/tgx/` | 02 TGX-CEX | **`src/cex`** 읽기 + BRG `tgxPanel` (`tgxMockBridge.ts`, `probeTgxMockBridge`). |
| `src/bridges/oneai/` | 03 OneAI | **`src/strategies`** + 뉴스/알림 mock + BRG `oneaiPanel` (`oneaiMockBridge.ts`, `probeOneaiMockBridge`). |
| `src/bridges/mockinvest/` | 04 MockInvest | **`src/mockinvest`** 읽기 + BRG `mockinvestPanel` (`mockinvestMockBridge.ts`, `probeMockinvestMockBridge`). |
| `src/bridges/speedorder/` | 05 SpeedOrder | **`src/vendor`** 읽기 + BRG `speedorderPanel` (`speedorderMockBridge.ts`, `probeSpeedorderMockBridge`). |
| `src/bridges/shared/` | — | **`bridgeTypes.ts`**, **`bridgeMeta.ts`**, snapshots, **`bridgeProbeRunner.ts`**, **`useBridgeDashboardStore`**, **`integrationSnapshots.ts`**, **`securityStatusTypes.ts`**, **`securityMockBundle.ts`**. |

**Barrel import:** `import { useBridgeDashboardStore, BRIDGE_ORDER } from './bridges'` from `src/`.

### Integration dashboard (mock admin)

- **UI:** `src/components/bridge/BridgeIntegrationPanel.tsx`  
- **Unified admin (mock):** `src/admin/UnifiedAdminDashboard.tsx` — KPI·Bridge·Risk·RBAC·**System Health**·**Notification Center**·Audit·위험 구역·Security. **`adminSnapshotExport.ts`**로 **마스킹 후** 클립보드 보내기(`schemaVersion`). 감사: `notification_view`, `health_view`, `export_snapshot_masked` 등. **`adminAccessStore.ts`** (`INITIAL_MOCK_ADMIN_ROLE`, 기본 **`readonly`**). **`/admin`** · **ADM** · BRG **「관리자 대시보드」**.  
- **Entry:** Top bar **BRG** button toggles the panel (`useBridgeDashboardStore` `panelOpen`).  
- **States:** Each bridge card can show **`disabled` / `error` / `mock` / `connected`**. In this repository, **`dataSource` remains `mock`**; **`connected`** means “mock probe succeeded / session ready”, **not** a live vendor socket.  
- **TetherGet card:** `schemaVersion`, P2P/escrow/dispute/referral counts, wallet/admin risk, **`summaryLine`**, and ute-surface **`fallbackState`** (`mock` vs `mock_fallback` when the API path is disabled or fails).  
- **TGX card:** `src/cex` 기반 — **selectedSymbol**, **symbolUniverse** 개수, **marketData** 상태, **position/order** 개수, **ticker** 한 줄.  
- **OneAI card:** `src/strategies` 기반 — **전략 개수**, **24h 시그널 개수**, **aggregate mock winrate / pnl**, **risk level**.  
- **SpeedOrder card:** `src/vendor` 기반 — **engine** 상태, **registry** 행 수, **market sync** 라인·상태, **ORDER_EXECUTION_POLICY** 표시.  
- **MockInvest card:** `src/mockinvest` 기반 — **active tournaments**, **참가자 합계**, **top ranking 행 수**, **reward pools** 요약, **lifecycle** 한 줄.  
- **UTE integration strip:** `buildMockUteIntegrationSnapshot()` — **cex + OneAI + MockInvest tournaments + SpeedOrder vendor + TetherGet ute-surface** (xl: 5열, 성공적인 BRG refresh 후).  
- **Last probe time:** `lastProbeRunAt` in the store updates after a successful full **Refresh** (local probes only).  
- **Security / Admin (mock):** read-only strip under the cards; types in `securityStatusTypes.ts`, values from `buildMockSecurityAdminBundle()`.  
- **Controls:** Per-bridge **disable** checkbox (demo), **Refresh** runs local probes only (no network).

---

## Documentation map

- `docs/UTE_ARCHITECTURE.md` — Layers including bridges.  
- `docs/UTE_STRUCTURE_AUDIT.md` — **07-UTE 독립 플랫폼 구조 점검(1단계)** — 폴더·라우팅·TGX/공유 후보·위험 요소.  
- `docs/MARKET_INTEGRATION.md` — Markets + bridge table.  
- `docs/ONEAI_BRIDGE.md`, `docs/TGX_VENDOR_SYNC.md` — Partner notes + file pointers.  
- `docs/MULTI_MARKET_RULES.md` — Rules + MockInvest / SpeedOrder / TetherGet bridge notes.  
- `docs/MOBILE_TRADING_SYSTEM.md` — Responsive layout.  
- `docs/UNIVERSAL_TRADING_UI_CONTRACT.md` — **기획 1단계:** 공통 호가·레이아웃·USD/KRW·배지·주문창·HTS/화이트라벨·feature flag·OneAI·**PWA 우선**·(자동매매·실거래·WS 구현 금지) UI 계약.  
- `docs/GLOBAL_SELF_TEST_VALIDATION.md` — 공통 self-test·diagnostics·audit·smoke 원칙.  
- `docs/UTE_LAYOUT_FEATURE_FLAGS.md` — 레이아웃 feature flag 계약·구현; env 목록은 **`.env.example`** (공개 템플릿). **`.env.local` / `.env.*.local`은 커밋 금지** (`.gitignore`).  
- `docs/UTE_PLATFORM_SHELL.md` — 공통 Platform Shell MVP (tenant chrome, diagnostics entry, mockOnly).
- `docs/UTE_DIAGNOSTICS_UI_WIRING.md` — PlatformDiagnosticsPanel `@tetherget/diagnostics-ui` view-model (PHASE35).  
- `docs/UTE_GLOBAL_DIAGNOSTICS_CENTER.md` — Cross-app Global Diagnostics Center mock draft on `/admin` (PHASE36).  
- `docs/UTE_INCIDENT_REVIEW.md` — AI Incident Review mock board (triage, no auto-remediation, PHASE37).  
- `docs/UTE_PROPOSAL_QUEUE.md` — AI Proposal Queue mock (status-only review, PHASE38).  
- `docs/UTE_RISK_GRAPH.md` — Cross-App Risk Graph mock (PHASE39).  
- `docs/UTE_OPERATIONS_TIMELINE.md` — Global Operations Timeline mock (PHASE40).  
- `docs/UTE_WHITELABEL_THEME.md` — White-label theme preset engine (mock tenants, localStorage switcher).  
- `docs/UTE_UNIFIED_EVENT_FEED.md` — Unified Event Feed (mock sources, localStorage max 10, feature flag).  
- `docs/UTE_WORKSPACE_CONTEXT_ROUTER.md` — Workspace context router (feed → panel highlight, tenant scope).  
- `docs/UTE_TENANT_CONTEXT_BRIDGE.md` — 12-TGX-TokenAdmin validation bridge (read-only, scope mismatch).  
- `docs/SECURITY_ADMIN_STRUCTURE.md` — Mock security/admin bundle + unified admin dashboard.  

---

## When to update this manual

Update **`MASTER_MANUAL.md`** and relevant **`docs/*.md`** whenever:

- `src/bridges/` layout or contracts change  
- `src/admin/` unified dashboard or navigation changes  
- New integration UI is added  
- `MarketId` / registry / `BrokerAdapter` boundaries change  

Per `AGENTS.md` and `.cursorrules`.

---

## Build / quality

```bash
npm run build
npm run lint
```

Keep both green after structural changes.
