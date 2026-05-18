# UTE — Universal Trading Exchange Architecture

**Project:** 07-UTE  
**Purpose:** A unified, multi-market trading **shell** and dashboard. All execution paths in this repository are **mock / demo only** — there is no live broker connectivity and no real order routing.

---

## Design goals

| Goal | How it is expressed in code |
|------|-----------------------------|
| Universal, reusable structure | UI and state depend on **`BrokerAdapter`** and shared domain types, not on a single asset class. |
| Multi-market | Each venue is a **`MarketId`** with its own **board** in global state and a dedicated adapter instance. |
| Preserve existing behavior | New work extends registries and adapters; **do not remove** established features (see `AGENTS.md`). |
| Future scale | Add markets by extending `MarketId`, `MARKETS` in `src/markets/registry.ts`, and `ADAPTERS` in `src/adapters/index.ts`. |
| UI/UX first | Layout primitives (`TradingLayout`, shells, sidebars) own responsive behavior; trading views compose them. |

---

## Layered model

1. **Presentation** — React components, shells (`AppShell`, **`UtePremiumTradingShell`**, `HtsLayout`), market views under `src/markets/views/`, panels (chart, order book, order form, history).
2. **Application state** — Zustand store (`src/store/tradingStore.ts`) holds per-market **boards** (active symbol, tickers, order book snapshot, orders, fills, positions).
3. **Domain** — Shared types in `src/core/domain/` (`trading.ts`, `order.ts`) and symbol contracts in `src/core/symbols/SymbolSpec.ts`.
4. **Integration boundary** — **`BrokerAdapter`** (`src/core/adapters/BrokerAdapter.ts`) is the only contract the store uses for connect, subscribe, and place/cancel orders.
5. **Market implementations** — Per-market files under `src/adapters/*.ts` implement **`BrokerAdapter`** with `kind: 'mock'`.
6. **External product bridges (mock-only)** — `src/bridges/` hosts **future-facing** adapters for **01 TetherGet-P2P**, 02 TGX-CEX, 03 OneAI, 04 MockInvest, and 05 SpeedOrder. They do **not** call real APIs, execute live orders, or move funds; they expose typed mock data and **probe** hooks consumed by `useBridgeDashboardStore` and the **BRG** integration panel in `HtsTopBar`. **TetherGet** additionally aligns with **`GET /api/admin/p2p/ute-surface`** via **`UteSurfacePayload`** in `src/bridges/tetherget/uteSurfaceTypes.ts` and **`tethergetSurfaceClient.ts`**: `fetchTethergetUteSurfaceFromApi` is a **stub** (no outbound HTTP); `fetchTethergetUteSurfaceWithMockFallback` returns **mock only**; `fetchTethergetUteSurfaceTryApiThenMockFallback` catches API disable/failure and returns the same fixture with **`meta.source: 'mock_fallback'`** for BRG visibility. **Security / Admin** mock posture types live under `src/bridges/shared/securityStatusTypes.ts` and surface in the same panel (see `docs/SECURITY_ADMIN_STRUCTURE.md`).
7. **Vendor-shaped export surfaces (mock)** — **`src/cex/`** models the **02 TGX-CEX** `src/cex` contract (`selectedSymbol`, `symbolUniverse`, market-data status, position/order snapshot, ticker snapshot). **`src/strategies/`** models the **03 OneAI** strategy research contract (`StrategySignal`, `StrategyResult`, `BacktestSummary`, `strategyRegistry`, `buildStrategyResearchDashboard`, aggregate metrics). **`src/mockinvest/`** models the **04 MockInvest** tournament contract (`TournamentRoom`, `RankingSnapshot`, `RewardPoolState`, `buildDefaultMockTournamentDashboardFixture`, `getActiveTournaments`, `getTopRankings`, `getRewardPools`, `getUpcomingEvents`). **`src/vendor/`** models the **05 SpeedOrder** `src/vendor` contract (`SPEED_ORDER_ENGINE_STATUS`, `speedOrderSymbolRegistry`, `ORDER_EXECUTION_POLICY`, `readSpeedOrderVendorSerializableSnapshot`). Bridges read these modules only; no network I/O. **`src/bridges/shared/integrationSnapshots.ts`** builds a combined **`UteIntegrationSnapshot`** (cex + oneai + mockinvest + vendor + **TetherGet ute-surface summary**) for the BRG “UTE integration” strip.
8. **Unified admin dashboard (read-only mock)** — **`src/admin/`** (`UnifiedAdminDashboard`, KPI, `AdminBridgeHealthTable`, `AdminSecurityStrip`, `AdminRiskAlertList`, `buildAdminRiskAlerts`, **`adminAccessTypes` / `adminAccessPolicy` / `adminAccessStore`**, **`adminAuditLog`**, **`adminNotificationTypes`**, **`adminSystemHealth`**, **`adminSnapshotExport`**, `AdminPermissionSummaryCard`, `AdminAuditLogPanel`, `AdminDangerZonePanel`, **`AdminNotificationCenter`**, **`AdminSystemHealthPanel`**). Reads **`useBridgeDashboardStore`**, **`UteIntegrationSnapshot`**, **`SecurityAdminStatusBundle`**; **mock RBAC**로 버튼 가드; **in-memory audit**; **Notification Center**·**System Health** 스냅샷; **스냅샷 보내기**는 마스킹 후 클립보드만. 최초 마운트 **bootstrap** `refresh`는 데이터 적재용; 이후 수동 새로고침은 **`canRefreshProbe`**. 라우팅: **`/admin`**, **`src/appNavigation.ts`**. 실 주문·송금·정산·설정 변경 UI 없음.

External products (TetherGet, TGX-CEX, OneAI, MockInvest, SpeedOrder) plug in at documented **integration slots** (see `IntegrationSlot` in `src/components/common/IntegrationSlot.tsx`) without rewriting core layers. **Bridge modules** complement those slots: they are the place to grow transport clients later while keeping UI and `BrokerAdapter` contracts stable.

---

## Key identifiers

- **`MarketId`** — Stable key for a logical market (e.g. `kr-stock`, `us-stock`, `crypto`). Defined in `src/markets/types.ts`.
- **`activeMarketId` + per-board `activeSymbol`** — The unified selection model: switching market updates which adapter and board receive subscriptions and orders.
- **`SymbolSpec`** — Cross-cutting metadata (tick/lot, session, PnL formula family, optional TradingView symbol). Adapters must align with this contract.

---

## Data flow (conceptual)

```text
User selects market/tab
    → setActiveMarket / setActiveSymbol (store)
    → useMarketSubscription (hook) resolves ADAPTERS[marketId]
    → adapter.subscribe(symbol, handlers)
    → handlers push ticker / book / fills into store
```

Order submission follows the same boundary: **`submitOrder` → adapter.placeOrder** — today always mock; a future live adapter would still implement the same interface.

---

## Non-goals (explicit)

- No real trading API keys, endpoints, or order IDs from production venues in this repo’s default path.
- No guarantee of regulatory compliance for any jurisdiction; treat as **simulation UI**.

---

## Related documents

- `docs/UTE_STRUCTURE_AUDIT.md` — 독립 플랫폼 구조 점검(폴더·라우팅·공유 후보·위험 요소).  
- `docs/MARKET_INTEGRATION.md` — Adding markets and adapters safely.  
- `docs/MULTI_MARKET_RULES.md` — Session, symbol, and PnL rules across markets.  
- `docs/ONEAI_BRIDGE.md`, `docs/TGX_VENDOR_SYNC.md` — Partner alignment.  
- `docs/MOBILE_TRADING_SYSTEM.md` — Responsive layout and touch-first patterns.  
- `docs/UNIVERSAL_TRADING_UI_CONTRACT.md` — 공통 거래 UI 상태·레이아웃·PWA 우선 정책 (기획 계약).  
- `docs/UTE_LAYOUT_FEATURE_FLAGS.md` — 레이아웃 preset·feature flag·graceful fallback (기획 2단계).  
- `docs/SECURITY_ADMIN_STRUCTURE.md` — Mock security/admin posture types and BRG strip.  
- `MASTER_MANUAL.md` — Operator-facing index including `src/bridges/` layout.

---

## Premium trading shell (phase 1)

UTE 메인 트레이딩 경로(`/`)는 **mock-only 통합 셸**을 한 겹 더 둡니다. 목적은 Linear/Vercel/HTS 톤의 **프리미엄 대시보드 레이아웃**(topbar + 시장 탭 + 데스크탑 사이드 mock 카드 + 본문 카드 프레임)이며, **주문·체결 로직·어댑터 계약은 변경하지 않습니다**.

| Piece | Location | Notes |
|-------|-----------|--------|
| Top bar | `src/shell/HtsTopBar.tsx` | 기존 BRG/ADM·상태 배지 유지; 시각적 border/glow만 보강 가능 |
| Shell layout | `src/shell/UtePremiumTradingShell.tsx` | `activeMarketId` / `setActiveMarket`만 연결; `children` = 기존 `ViewFor` → `UniversalMarketView` 트리 |
| 시장 탭 라벨 | `src/shell/utePremiumShellConfig.ts` | Crypto / US Stocks / Futures / FX / Index 표시명; 각 항목은 기존 `MarketId` 하나에 매핑 (FX→`kr-futures`, Index→`kr-stock` 등 **라벨 전용**) |
| Mock 사이드 패널 | `UtePremiumTradingShell` + `UteShellPlaceholderCard` | `useTradingStore`의 활성 보드 **스냅샷**만 표시 (bid/ask level 수, 포지션 수, Σ uPnL); 실시간 API 없음 |
| Chart / Order placeholder | 셸 내부 스트립 + 본문 | 실제 차트·주문 패널은 **기존** `HtsLayout` / `OrderPanel` 등에 그대로 존재; 셸은 안내용 placeholder 한 줄 추가 |

반응형: **lg 미만**에서는 좌측 사이드바를 숨기고 시장 탭은 **가로 스크롤**로 유지하여 모바일에서도 시장 전환이 가능합니다.

---

## Maintenance rule

When architecture, market list, adapters, or integration surfaces change, update this file and the other `docs/*.md` files together with any project-level manual, per `AGENTS.md` and `.cursorrules`.
