# OneAI Bridge

UTE treats **OneAI** as an **adjacent intelligence layer**: signals and overlays that inform the trader’s context **without** replacing the `BrokerAdapter` contract or executing real orders on behalf of OneAI.

---

## Current implementation (mock)

- **UI:** `src/components/status/OneAiBadge.tsx` — lightweight bias/confidence mock (interval refresh).
- **Bridge:** `src/bridges/oneai/oneaiMockBridge.ts` — 뉴스·알림·**`src/strategies`** 전략/백테스트 mock을 읽어 **`probeOneaiMockBridge`** → BRG **`oneaiPanel`**.
- **Scope:** Read-only. No live OneAI API, **no automatic live order placement**.

---

## `src/strategies` export surface (03 contract, mock)

UTE는 03번 OneAI의 **전략·시그널·백테스트** 연구 계약을 **`src/strategies/`**에 mock으로 둡니다. `src/bridges/oneai`가 이 surface만 import합니다.

| Export | Role |
|--------|------|
| **`StrategySignal`** (type) | 전략 출력 시그널 (marketId, symbol, bias, strength, ts). |
| **`StrategyResult`** (type) | 전략 성과 요약 (mock sharpe / hit rate 등). |
| **`BacktestSummary`** (type) | 백테스트 기간·트레이드 수·winrate·mock PnL·max DD. |
| **`strategyRegistry`** | 등록된 전략 목록 (id, name, version). |
| **`buildStrategyResearchDashboard()`** | registry + 최근 시그널 + backtests + results + **aggregate** 묶음. |
| **`getAggregateMockStrategyMetrics()`** | 집계 mock winrate, total PnL, risk level, 시그널 수 등. |
| **`listRecentStrategySignals(limit?)`** | 최근 시그널 목록 (정렬·슬라이스). |

엔트리: `src/strategies/index.ts`.

---

## BRG (`oneaiPanel`)

`BridgeAdapterSnapshot.oneaiPanel` (`OneaiBrgPanelSnapshot` in `src/bridges/shared/bridgeTypes.ts`) exposes:

- 전략 개수 (`strategyCount`)
- 최근 24h 시그널 개수 (`recentSignalCount`)
- aggregate mock winrate / pnl (문자열 라벨)
- **risk level** (`low` | `med` | `high`, mock 산출)

---

## 통합 dashboard (`UteIntegrationSnapshot`)

`src/bridges/shared/integrationSnapshots.ts`의 **`oneai`** 블록에 registry/backtest 개수, aggregate winrate·pnl·risk를 넣어 **TGX cex + OneAI + MockInvest + SpeedOrder vendor + TetherGet ute-surface** 한 화면에서 요약합니다 (`UteIntegrationSnapshot.tetherget`, `headline`에 P2P/escrow 스니펫).

---

## Bridge contract (recommended)

When a real OneAI service is introduced, keep these boundaries:

| Concern | Owner | Notes |
|---------|--------|--------|
| Market + symbol context | UTE store | `MarketId`, `activeSymbol`, optional timeframe from chart state. |
| Strategy / signal payloads | Replace **`src/strategies` mock** with typed client or workspace package — **same export names** where possible. |
| Signal fetch | Thin client module | e.g. fetch behind `buildStrategyResearchDashboard` — no broker secrets in UI. |
| Rendering | `OneAiBadge` / BRG | Swap mock generators for client calls; preserve loading/error UI. |
| Execution | **Out of scope** | Any “auto trade” remains a separate, explicitly gated feature — **not** default in UTE mock mode. |

---

## Multi-market compatibility

- `StrategySignal` includes **`marketId`** — the same symbol string can refer to different instruments across markets.
- Remount or reset hooks when `marketId` changes for badge UI (`OneAiBadge`).

---

## Integration slot alignment

`IntegrationSlot` lists **`03-OneAI`** as a source for future embedded modules. OneAI-specific panels should mount inside those slots so the **core chart/order stack** stays unchanged.

---

## Compliance and expectations

- OneAI output is **informational**, not investment advice, unless a licensed workflow says otherwise.
- **Mock/demo only:** default UTE builds must not require OneAI infrastructure to run.

---

## Related documents

- `docs/UTE_ARCHITECTURE.md` — Layers including `src/strategies`.  
- `docs/MARKET_INTEGRATION.md` — Bridges + contract table.  
- `docs/MULTI_MARKET_RULES.md` — Session and symbol rules.  
- `MASTER_MANUAL.md` — BRG panel and paths.
