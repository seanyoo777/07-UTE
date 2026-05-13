# Market Integration Guide

This document describes how **new markets** and **new broker backends** attach to UTE while keeping a **single reusable trading structure** and **mock-first** policy.

---

## Principles

1. **UI and store talk only to `BrokerAdapter`** — Never import venue-specific SDKs from React components; keep them inside adapter modules.
2. **One registry per concern** — Markets are listed in `src/markets/registry.ts`; adapter instances are wired in `src/adapters/index.ts`.
3. **Mock before live** — Default `ADAPTERS` map must remain mock-capable so CI, demos, and design reviews never require real credentials.
4. **No real execution in the default product** — Live adapters (if ever added) are a **swap** of the map value, not a fork of the store (see comment in `src/adapters/index.ts`).

---

## Checklist: adding a new `MarketId`

1. **`src/markets/types.ts`**  
   - Extend the `MarketId` union.  
   - Document the distinction between **market** (venue / regulatory bucket) and **asset class** (handled on `SymbolSpec`).

2. **`src/markets/registry.ts`**  
   - Append a `MarketDef` entry: `id`, labels, `quoteCurrency`, `defaultSymbol` (must exist in the adapter’s `listSymbols()`), `sessionHint`.

3. **`src/adapters/<newMarket>.ts`**  
   - Export a `BrokerAdapter` with `kind: 'mock'` until a live implementation is approved and isolated.  
   - Implement `listSymbols`, `getSymbolSpec`, `subscribe`, `placeOrder`, `cancelOrder`, and account snapshots consistently with existing mocks.

4. **`src/adapters/index.ts`**  
   - Register: `ADAPTERS['your-market-id'] = yourMockAdapter`.

5. **Views and navigation**  
   - Add a view under `src/markets/views/` and wire tabs/sidebar to the new `MarketId` without duplicating order-book or order-panel internals.

6. **Boot / initial boards**  
   - Ensure `src/store/boot.ts` (or equivalent) seeds a `MarketBoard` for the new id so the store shape stays complete.

7. **Documentation**  
   - Update `docs/UTE_ARCHITECTURE.md`, `docs/MULTI_MARKET_RULES.md`, and this file.

---

## `BrokerAdapter` responsibilities

The interface in `src/core/adapters/BrokerAdapter.ts` requires:

| Area | Responsibility |
|------|----------------|
| Lifecycle | `connect` / `disconnect` / `isConnected` |
| Instruments | `listSymbols`, `getSymbolSpec` |
| Streaming | `subscribe(symbol, handlers)` with ticker, optional order book, trades |
| Orders | `placeOrder`, `cancelOrder`, `getOpenOrders` |
| Positions | `getPositions` |

Handlers must emit types compatible with `src/core/domain/trading.ts` so the store and history panels stay market-agnostic.

---

## Compatibility matrix (target ecosystem)

| System | Role relative to UTE |
|--------|----------------------|
| **TetherGet-P2P** | P2P / escrow / wallet-shaped mock contracts; see `src/bridges/tetherget/` and `docs/SECURITY_ADMIN_STRUCTURE.md` (cross-cutting admin mock). |
| **TGX-CEX** | Reference CEX flows and validation; vendor-shaped data can feed adapter implementations behind the same interface. |
| **OneAI** | Decision-support and signals; see `docs/ONEAI_BRIDGE.md`. |
| **MockInvest** | Tournament / ranking / reward mock; see **`src/mockinvest/`** + `src/bridges/mockinvest/` and BRG `mockinvestPanel` (no real prize settlement). |
| **SpeedOrder** | Fast-order UX patterns; UTE’s `TradingLayout` documents alignment with SpeedOrder-style grids. |

---

## External bridges (`src/bridges/`)

UTE keeps **in-app trading** on `BrokerAdapter` + `ADAPTERS`. Cross-repo products are prepared separately:

| Path | Role |
|------|------|
| `src/bridges/tetherget/` | **01 TetherGet-P2P**-shaped **mock** aligned with **`GET /api/admin/p2p/ute-surface`**: `uteSurfaceTypes.ts` (`UteSurfacePayload`, `schemaVersion`), `tethergetSurfaceClient.ts` (`fetchTethergetUteSurfaceMock`, stub `fetchTethergetUteSurfaceFromApi`, mock-first `fetchTethergetUteSurfaceWithMockFallback`, try-then-fallback `fetchTethergetUteSurfaceTryApiThenMockFallback`), `tethergetMockBridge.ts`, `probeTethergetMockBridge`. |
| `src/bridges/tgx/` | 02 TGX-CEX | `src/cex` mock surface를 읽어 `probeTgxMockBridge`·BRG `tgxPanel`에 반영. |
| `src/bridges/oneai/` | 03 OneAI | **`src/strategies`** mock surface + 뉴스/알림 mock; `probeOneaiMockBridge`·BRG `oneaiPanel`. |
| `src/bridges/mockinvest/` | 04 MockInvest | **`src/mockinvest`** tournament mock surface + BRG `mockinvestPanel` (`mockinvestMockBridge.ts`, `probeMockinvestMockBridge`). |
| `src/bridges/speedorder/` | 05 SpeedOrder | `src/vendor` mock surface를 읽어 `probeSpeedorderMockBridge`·BRG `speedorderPanel`에 반영. |
| `src/bridges/shared/` | — | **`bridgeTypes.ts`**, **`bridgeMeta.ts`**, snapshots, **`bridgeProbeRunner.ts`**, **`useBridgeDashboardStore`**, **`integrationSnapshots.ts`**, **`securityStatusTypes.ts`**, **`securityMockBundle.ts`**. |
| `src/admin/` | 통합 관리자 (1차) | **`UnifiedAdminDashboard`** — BRG·`UteIntegrationSnapshot`·보안 번들 기반 **읽기 전용** KPI·테이블·리스크 알림 (`/admin`, 상단 **ADM**, BRG 링크). 실 API·실행 액션 없음. |
| `src/cex/` | 02 (contract) | TGX-CEX 정렬 mock export: `selectedSymbol`, `symbolUniverse`, `getMarketDataFeedStatus`, `getPositionOrderSnapshot`, `getTickerSnapshot`. |
| `src/strategies/` | 03 (contract) | OneAI 정렬 mock export: `StrategySignal`, `StrategyResult`, `BacktestSummary`, `strategyRegistry`, `buildStrategyResearchDashboard`, `getAggregateMockStrategyMetrics`, `listRecentStrategySignals`. |
| `src/mockinvest/` | 04 (contract) | MockInvest 정렬 mock export: `MockTournamentDashboard`, `TournamentRoom`, `ParticipantStanding`, `RankingSnapshot`, `RewardDistribution`, `RewardPoolState`, `EventLifecycleState`, `buildDefaultMockTournamentDashboardFixture`, `getActiveTournaments`, `getTopRankings`, `getRewardPools`, `getUpcomingEvents`. |
| `src/vendor/` | 05 (contract) | SpeedOrder 정렬 mock export: `SPEED_ORDER_ENGINE_STATUS`, `speedOrderSymbolRegistry`, `ORDER_EXECUTION_POLICY`, `readSpeedOrderVendorSerializableSnapshot`. |

**Rules:** no real HTTP/WebSocket to production; no live order execution; no real transfers, settlement, or reward payouts; probes are local-only. See `MASTER_MANUAL.md` for UI entry (BRG panel, **ADM**, `/admin`) and `docs/SECURITY_ADMIN_STRUCTURE.md` for mock security/admin fields.

---

## Testing integration without live markets

- Run the app in default configuration: all adapters should report `kind: 'mock'`.  
- Verify tab switch: each `MarketId` loads symbols, updates tickers, and accepts mock orders without network calls to real exchanges.

---

## Governance

- Do **not** remove existing markets or adapters without product sign-off (`AGENTS.md`).  
- Keep **build and lint** green after registry changes.
