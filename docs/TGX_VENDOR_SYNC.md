# TGX-CEX Vendor Sync

**TGX-CEX** is the designated place to **validate** exchange-style flows, fee models, and instrument metadata before they surface in the universal shell (07-UTE). This document defines how vendor-level concepts map onto UTE’s **preserved, adapter-centric architecture** — without implying **live** execution in UTE’s default build.

---

## Positioning

```text
TetherGet (01)  →  P2P / escrow / wallet mock contracts (UTE bridges)
SpeedOrder (05)  →  builds fast-order UX components
TGX-CEX (02)     →  validates CEX semantics & payloads
UTE (07)         →  hosts unified multi-market dashboard (mock default)
```

`IntegrationSlot` (`src/components/common/IntegrationSlot.tsx`) encodes this narrative: modules are expected to graduate from **SpeedOrder**, be checked in **TGX-CEX**, then land in **UTE** behind the same slot API.

---

## What “sync” means here

**Sync** = **conceptual and structural alignment**, not a running ETL pipeline in this repository:

| TGX / CEX concept | UTE home |
|-------------------|----------|
| Instrument id + display name | `SymbolSpec.symbol`, `SymbolSpec.displayName` |
| Price / qty increments | `tickSize`, `lotSize`, decimals |
| Quote / margin currency | `quoteCurrency`, `marginCurrency` |
| Contract multiplier | `contractSize`, `tickValue` |
| Session (24h vs session) | `SymbolSpec.sessionType` + `MarketDef.sessionHint` for badges |
| Order side / type | `OrderRequest` in `src/core/domain/order.ts` |

When TGX-CEX adds a field UTE needs for display or risk hints, prefer **extending `SymbolSpec` or `OrderRequest.meta`** rather than branching the store.

---

## Adapter strategy

- Today: **`ADAPTERS`** in `src/adapters/index.ts` maps each `MarketId` to a **mock** `BrokerAdapter`.
- Future: a **TGX-shaped live adapter** (if approved) should still implement **`BrokerAdapter`** with `kind: 'live'` and be selected only via explicit configuration — never as the silent default for open-source or demo builds.

### TGX bridge folder (mock-only)

- **Code:** `src/bridges/tgx/tgxMockBridge.ts` — imports **`src/cex`** (`selectedSymbol`, `symbolUniverse`, `getMarketDataFeedStatus`, `getPositionOrderSnapshot`, `getTickerSnapshot`).  
- **Exports:** `tgxMockListSymbols`, `tgxMockGetQuote`, `tgxMockListPositions`, `tgxMockListOrders`, `probeTgxMockBridge` (레거시 헬퍼는 cex 기반으로 정렬).  
- **CEX surface:** `src/cex/index.ts` — 02번 `src/cex` export 후보와 동일한 이름·역할을 mock으로 제공.  
- **Intent:** When TGX-CEX validates REST/WebSocket payloads, mirror those shapes in `src/cex` first; UTE’s in-screen trading still flows through `BrokerAdapter` in `src/adapters/`.

---

## Vendor-specific extensions

Use **`OrderRequest.meta`** for keys that do not belong in the universal shape (account routing, post-only flags, reduce-only, etc.). The UI should not depend on vendor keys; adapters translate them.

---

## MockInvest and SpeedOrder

- **MockInvest:** Use for **portfolio / education** scenarios; UTE mocks can mirror balances or tags via `meta` for UI demos.  
- **SpeedOrder:** Use for **latency-sensitive order UX**; keep parity with `OrderMode` including `'speed'` in `order.ts` for forward compatibility.

---

## Safety rules

- **No real trading execution** in UTE’s mock-first product path.  
- Do not embed production API secrets in UTE source.  
- Any “vendor sync” code path must be **feature-flagged** and **off** in default builds.

---

## Related documents

- `docs/MARKET_INTEGRATION.md` — Wiring a new adapter.  
- `docs/MULTI_MARKET_RULES.md` — Normalizing sessions and PnL across venues.  
- `docs/UTE_ARCHITECTURE.md` — Core layering.  
- `MASTER_MANUAL.md` — Bridge dashboard overview.  
- `docs/SECURITY_ADMIN_STRUCTURE.md` — Mock security/admin posture (BRG).
