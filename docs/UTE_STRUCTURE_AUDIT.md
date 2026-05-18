# UTE Structure Audit — Phase 1 (07-UTE)

**Date:** 2026-05-13  
**Scope:** Repository `07-UTE` only. UTE is an **independent** platform; TGX-CEX / SpeedOrder are **reference contracts** and **mock surfaces**, not vendored source copies.

**Principles checked:** `AGENTS.md`, `.cursorrules`, `MASTER_MANUAL.md`, `docs/*.md` — no feature removal, mock-first, no live trading DB/API in this audit pass.

---

## 1. Current structure summary

| Area | Path | Role |
|------|------|------|
| Entry | `src/main.tsx`, `src/App.tsx` | React mount; **trading vs admin** shell via `useAppNavigation` |
| Navigation | `src/appNavigation.ts` | `pushState` / `popstate`: `/` = trading, `/admin` = unified admin |
| Markets | `src/markets/types.ts`, `registry.ts`, `views/*` | `MarketId` union; per-market thin views → **`UniversalMarketView`** |
| Trading state | `src/store/tradingStore.ts`, `boot.ts` | Per-market **boards** (symbol list, tickers, book, orders, positions) |
| Adapters | `src/adapters/*.ts`, `index.ts` | **`BrokerAdapter`** mock implementations per market |
| Core | `src/core/domain/*`, `BrokerAdapter.ts`, `engine/*`, `symbols/*`, `utils/*`, `fx/*` | Domain types, mock engines, PnL/FX helpers |
| UI — trading | `src/components/chart/*`, `orderbook/*`, `order/*`, `ticker/*`, `dock/*`, `history/*`, `layouts/*` | HTS-style panels; **`HtsLayout`** (lg+) + **`TradingLayout`** (mobile); 계약 요약 `docs/UNIVERSAL_TRADING_UI_CONTRACT.md` |
| Shell | `src/shell/HtsTopBar.tsx`, **`UtePremiumTradingShell.tsx`**, `utePremiumShellConfig.ts`, `MarketTabs.tsx` (레거시/AppShell), `components/shell/UteShellPlaceholderCard.tsx` | BRG/ADM, premium 시장 탭·사이드 mock 패널; 레이아웃 flag 계약 `docs/UTE_LAYOUT_FEATURE_FLAGS.md` |
| Config | `src/config/categoryConfig.ts`, `proLayout.ts` | Per-`MarketId` UI hints, layout limits |
| CEX-shaped mock | `src/cex/*` | **UTE-owned** types + mock feed aligned with **02 TGX-CEX contract** (naming only) |
| Vendor-shaped mock | `src/vendor/*` | **UTE-owned** mock aligned with **05 SpeedOrder contract** — UTE edits **this repo’s** `src/vendor` only; do **not** change the external 05 product repo |
| Strategies / tournaments | `src/strategies/*`, `src/mockinvest/*` | 03 / 04 mock surfaces |
| Bridges | `src/bridges/*` | BRG probes; **read** `cex` / `vendor` / etc.; no network |
| Admin | `src/admin/*` | RBAC mock, audit log, notifications, health, masked export |

**Router library:** None (`react-router` not in dependencies). Routing is **history API + zustand view**.

---

## 2. Routing structure

- **Trading (default):** `pathname` `/` → `App` renders `HtsTopBar` + **`UtePremiumTradingShell`** (시장 탭 전 구간 + lg+ 사이드바 mock 요약) + `ViewFor(marketId)` lazy market views. **`MarketTabs`**는 `AppShell` 등 보조 셸에서만 사용(메인 트레이딩은 셸 탭으로 통합).
- **Admin:** `pathname` `/admin` → `UnifiedAdminDashboard` (no `HtsTopBar`; own header).
- **Sync:** `useAppNavigation.syncFromWindow()` on mount + `popstate` (browser back/forward).

---

## 3. Major file lists (by concern)

### Trading window (universal)

- `src/markets/views/UniversalMarketView.tsx` — composition root for all markets  
- `src/layouts/HtsLayout.tsx`, `TradingLayout.tsx`  
- `src/components/order/OrderPanel.tsx`, `orderbook/OrderBookPanel.tsx`, `dock/BottomDock.tsx`, `history/HistoryPanel.tsx`

### Chart / quote (시세)

- `src/components/chart/TradingViewChart.tsx`, `ChartArea.tsx` (if present)  
- `src/components/ticker/TickerBar.tsx`  
- `src/core/engine/mockMarketDataEngine.ts`, `mockMatchingEngine.ts`  
- `src/hooks/useMarketSubscription.ts`

### Wallet (UTE context)

- **No standalone “UTE wallet” screen** in `src/` tree. **Wallet-shaped** data appears under **TetherGet bridge** / `ute-surface`: `src/bridges/tetherget/uteSurfaceTypes.ts` (`UteSurfaceWalletStatus`), `tethergetMockBridge.ts`, BRG extras.

### Admin

- `src/admin/UnifiedAdminDashboard.tsx` and siblings (`adminAccess*`, `adminAuditLog`, `adminNotificationTypes`, `adminSystemHealth`, `adminSnapshotExport`, panels)

### Platform / product config

- `src/config/categoryConfig.ts` — category/market UX flags  
- `src/markets/registry.ts` — `MARKETS` registry  
- `src/components/common/IntegrationSlot.tsx` — slot metadata (`02-TGX-CEX`, `05-SpeedOrder`, … labels)

---

## 4. TGX-shareable **candidates** (concept or package boundary)

These are **good candidates** for a future shared **package** or copied **interface** (not literal copy-paste from 02 repo):

| Candidate | UTE location today | Notes |
|-----------|-------------------|--------|
| Chart shell | `components/chart/TradingViewChart.tsx` | Widget loader + `SymbolSpec.tvSymbol`; external TV script URL is a **separate policy** topic |
| Market feed types | `src/cex/types.ts` | Already documented as aligned with 02 contract — **UTE-owned** file |
| Notification pattern | `src/admin/adminNotificationTypes.ts` | Admin-only; pattern could generalize |
| Wallet display type | `uteSurfaceTypes.ts` (`UteSurfaceWalletStatus`) | P2P admin surface, not retail wallet app |
| Common UI | `PanelShell`, `IntegrationSlot`, `ErrorBoundary`, layout primitives | Reusable across products |
| Platform config | `categoryConfig.ts`, `SymbolSpec.ts`, `MarketId` | Strong UTE boundary; share as **types + defaults** only |

---

## 5. UTE-specific **keep** (must remain in UTE)

- **UTE routes:** `appNavigation.ts` (`/`, `/admin`)  
- **UTE admin:** entire `src/admin/`  
- **UTE trading shell:** `UniversalMarketView`, `HtsLayout`, store + adapters per `MarketId`  
- **UTE product matrix:** `markets/registry.ts`, `adapters/index.ts`  
- **UTE PnL / FX display:** `core/fx/*`, `components/common/PnlDisplay.tsx`  
- **UTE mock data:** `core/engine/*`, `adapters/*`, `cex/mockCexSurface.ts`, `vendor/mockVendorSurface.ts`, etc.

---

## 6. Risk: tangled imports / duplicate types / confusion

| Risk | Evidence / impact | Severity |
|------|-------------------|----------|
| **Contract name vs ownership** | Comments reference “02 TGX-CEX”, “05-SpeedOrder”; easy to assume cross-repo imports | Medium — clarify in docs (this file + `UTE_ARCHITECTURE.md`) |
| **`IntegrationSlot` source labels** | `UniversalMarketView` wraps real UI in slots labeled `05-SpeedOrder` — **documentation / roadmap** coupling, not a runtime import to 05 repo | Low |
| **External chart script** | `TradingViewChart` loads `https://s3.tradingview.com/tv.js` — not “UTE API”, but **third-party network** | Medium for compliance / air-gapped demos |
| **React console warnings** (observed in dev) | Duplicate key `crypto`; `<button>` inside `<button>` hydration warning | Medium UX — fix in a **dedicated** UI bug pass (not part of this audit’s code changes) |
| **Duplicate “notification” concepts** | `adminNotificationTypes` vs `buildAdminRiskAlerts` vs BRG — overlapping **observability** strings | Low — dedupe in a later phase |
| **No `src/vendor` path alias to external repo** | Grep shows no `@tgx` / monorepo path — **good** | — |

**TGX code copy:** No imports from outside `07-UTE` tree detected in `src/` (grep for path-style imports).

---

## 7. AGENTS.md / .cursorrules / docs alignment

- **AGENTS.md** states multi-market, TGX integration layer, mock-first — consistent with repo; **independence** nuance is stronger in `UTE_ARCHITECTURE.md` / this audit.  
- **.cursorrules** — delete forbidden, build/lint, mock, doc updates on structural change: **satisfied** for this audit (documentation-only addition).  
- **MASTER_MANUAL.md** — updated to reference this audit (see repo).  
- **`docs/UTE_ARCHITECTURE.md`** — already describes bridges, admin, cex/vendor contracts; use together with this audit.

---

## 8. Files created / touched (this audit step)

| Action | Path |
|--------|------|
| Created | `docs/UTE_STRUCTURE_AUDIT.md` (this file) |
| Updated | `MASTER_MANUAL.md` (Documentation map — link to this audit) |

---

## 9. Next steps (suggested)

1. **Fix React warnings** (duplicate `key`, nested `<button>`) in a small targeted PR — no layout redesign.  
2. **Explicit “contract packages” doc table:** which `src/cex` / `src/vendor` fields are frozen vs UTE-extended.  
3. **Optional:** extract `IntegrationSlot` product codes to a single `integrationSources.ts` to avoid string drift.  
4. **TradingView:** feature-flag or placeholder mode for fully offline demos.

---

## 10. Verification

Run locally:

```bash
npm run build
npm run lint
```

(CI should remain green after doc-only + `MASTER_MANUAL` one-line change.)
