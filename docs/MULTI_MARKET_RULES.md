# Multi-Market Rules

UTE supports several logical markets (`MarketId`) behind one **reusable trading structure**. This document captures **rules and invariants** so new markets stay compatible with charts, order tickets, PnL widgets, and future live adapters.

---

## Market vs asset class

- **`MarketId`** — Which **tab / adapter / regulatory bucket** the user is in (e.g. domestic equity vs crypto perpetual mock).  
- **`AssetClass` on `SymbolSpec`** — How **PnL**, **margin**, and **widgets** behave for an instrument.

The same asset class can appear in multiple markets in theory; keep **`marketId` on `SymbolSpec`** authoritative for routing to `ADAPTERS[marketId]`.

---

## Registry rules (`MarketDef`)

Each entry in `src/markets/registry.ts` should satisfy:

1. **`defaultSymbol`** must appear in that market’s `listSymbols()` result.  
2. **`quoteCurrency`** is the **display** currency for headers and labels where applicable.  
3. **`sessionHint`** drives coarse UI copy (`'24h' | 'regular' | 'futures'`); align with `SymbolSpec.sessionType` where possible.

---

## Symbol specification (`SymbolSpec`)

Non-negotiable practices:

| Field family | Rule |
|--------------|------|
| Numeric guards | Use `mergeSymbolSpec` so tick/lot/contract sizes stay finite and positive. |
| Rounding | UI formatting respects `priceDecimals` / `qtyDecimals`; engines round to `tickSize` / `lotSize`. |
| PnL | Choose `pnlFormulaType` (`linear`, `inverse`, `stock`, `futures_contract`, `binary`, …) to match the instrument; positions are **revalued** off active price in the store layer for mocks. |
| Charts | Optional `tvSymbol` maps to TradingView widget symbols when the chart component supports them. |

---

## Order model (`OrderRequest`)

- **`OrderMode`** (`standard`, `speed`, `hts`, `conditional`, `binary`) reserves UX modes **without** forking the store.  
- **Conditional / binary fields** exist for forward compatibility; mock adapters may ignore unsupported combinations but should return a clear **`OrderAck`** failure rather than silent corruption.  
- **`meta`** carries market-specific knobs; core UI must remain functional when `meta` is empty.

---

## Subscriptions and active symbol

- Subscriptions are **per `(marketId, symbol)`**.  
- Order book patches apply only when `book.symbol === board.activeSymbol` (see store logic) to avoid cross-talk.  
- Switching **market** swaps adapter and board; switching **symbol** within a market updates subscription and reference price.

---

## Cross-market UX consistency

- Reuse **`TradingLayout`** for the main workspace so mobile and desktop grids stay aligned.  
- History tabs (`fills`, `orders`, `cancelled`) consume the same row types from `trading.ts` for every market.

---

## SpeedOrder bridge (`src/vendor` + `src/bridges/speedorder`)

`src/vendor` provides the **05 SpeedOrder**-aligned mock exports: `SPEED_ORDER_ENGINE_STATUS`, `speedOrderSymbolRegistry`, `ORDER_EXECUTION_POLICY`, `readSpeedOrderVendorSerializableSnapshot()`.  
`src/bridges/speedorder/speedorderMockBridge.ts` reads that surface for **`probeSpeedorderMockBridge`** and BRG **`speedorderPanel`**. Registry rows are derived from **`MARKETS`** in `src/markets/registry.ts` so defaults stay aligned with `MarketId` / `defaultSymbol` — without a second live config path.

---

## TGX CEX mock surface (`src/cex` + `src/bridges/tgx`)

`src/cex` exposes the **02 TGX-CEX**-aligned mock contract: **`selectedSymbol`**, **`symbolUniverse`**, **`getMarketDataFeedStatus`**, **`getPositionOrderSnapshot`**, **`getTickerSnapshot`**.  
`src/bridges/tgx/tgxMockBridge.ts` consumes it for **`probeTgxMockBridge`** and BRG **`tgxPanel`**.

---

## MockInvest tournament surface (`src/mockinvest` + `src/bridges/mockinvest`)

`src/mockinvest` exposes the **04 MockInvest**-aligned mock contract: **`TournamentRoom`**, **`ParticipantStanding`**, **`RankingSnapshot`**, **`RewardDistribution`**, **`RewardPoolState`**, **`EventLifecycleState`**, **`MockTournamentDashboard`**, plus **`buildDefaultMockTournamentDashboardFixture`**, **`getActiveTournaments`**, **`getTopRankings`**, **`getRewardPools`**, **`getUpcomingEvents`**.  
`src/bridges/mockinvest/mockinvestMockBridge.ts` consumes it for **`probeMockinvestMockBridge`** and BRG **`mockinvestPanel`**. Tournament UX stays **orthogonal** to `BrokerAdapter` / live execution; numbers are **mock-only** (no real prize settlement).

---

## TetherGet-P2P bridge (01, mock)

UTE’s **`MarketId`** model covers **exchange-style** screens; **P2P / escrow / referrals** are intentionally modeled in `src/bridges/tetherget/tethergetMockBridge.ts` so TetherGet-shaped payloads do not leak into `BrokerAdapter` unless a future product decision introduces a dedicated adapter behind the same boundary rules.

---

## Mock / demo only

All rules above apply to **simulation**. No rule in this document requires connecting to a real exchange. Live venues would still honor the same types to avoid **N × UI** forks.

---

## Related documents

- `docs/MARKET_INTEGRATION.md` — Steps to add a market.  
- `docs/UTE_ARCHITECTURE.md` — Layering overview.  
- `docs/MOBILE_TRADING_SYSTEM.md` — Responsive behavior across markets.  
- `MASTER_MANUAL.md` — Bridge integration panel (BRG).  
- `docs/SECURITY_ADMIN_STRUCTURE.md` — Mock security/admin bundle shown under BRG.
