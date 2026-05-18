# Universal Trading UI — State & Layout Contract (Planning)

**Project:** 07-UTE (Universal Trading Exchange)  
**Phase:** 기획 1단계 — UI 상태·레이아웃 **계약**만 정리 (구현 강제 아님).  
**Date:** 2026-05-13

---

## Scope & non-goals (절대 금지)

| 금지 항목 | 설명 |
|-----------|------|
| 실거래 API | 브로커·거래소 REST/WebSocket 연동, API 키, 실계좌 식별자를 **이 문서의 전제로 두지 않음**. |
| 주문 엔진 | 체결·매칭·라우팅 엔진 **신규 구현**은 본 계약 범위 밖. UI는 기존 `BrokerAdapter` / mock 경로만 가정. |
| WebSocket | 실시간 전송 계층 **구현**은 본 계약 범위 밖. “실시간 **표현**”은 mock 스트림·배지·상태 텍스트로 정의. |
| 자동매매 | 알고리즘 주문·봇·백그라운드 시그널 기반 **자동 주문 실행** 기능의 **구현** 금지. UI의 “시스템 트레이딩” 등 배지·스트립은 **mock 표시 전용**이며 전략 엔진·라이브 라우팅과 연결하지 않음. |

---

## 1. 공통 호가창(Order book) 구조

**데이터 계약(개념):** `OrderBookSnapshot` — `symbol`, `bids[]`, `asks[]`, 선택적 `timestamp` (`src/core/domain/trading.ts`).

**UI 구조(공통):**

- **두 컬럼:** 매수(bid) / 매도(ask) 또는 중앙 스프레드 고정형 중 하나를 **시장별 스킨**으로 선택 가능하되, **레벨 리스트 + 가격 + 잔량**은 모든 `MarketId`에서 동일한 정보 밀도를 목표로 함.
- **활성 심볼 동기:** 호가창은 항상 **현재 보드의 `activeSymbol`**과 동일 심볼을 표시. 심볼 변경 시 스냅샷이 비어 있으면 “연결/구독 중” 톤의 placeholder (mock 허용).
- **색·토큰:** bid = `so-bid`, ask = `so-ask` 계열; 접근성상 **색만으로 구분하지 않음** (라벨·정렬 방향).
- **스크롤:** 깊은 호가는 세로 스크롤; `min-h-0` / `min-w-0`로 부모 flex 그리드 안에서 잘리지 않게 할 것 (`docs/MOBILE_TRADING_SYSTEM.md`와 정합).

**구현 참조:** `OrderBookPanel`, `HtsLayout` / `TradingLayout`의 `orderBook` 슬롯.

---

## 2. 자산군(시장)별 차이 — `MarketId` 기준

UTE는 **자산군**과 **시장**을 분리한다 (`src/markets/types.ts`). UI 차이의 **단일 출처**는 `getCategoryConfig(marketId)` (`src/config/categoryConfig.ts`)이다.

| MarketId | 제품 라벨(예시) | 호가·틱 | 주문 타입 노출 | 기타 UI 토글 |
|----------|-----------------|----------|------------------|--------------|
| `kr-stock` | 국내주식 | KRW quote, 정규장 세션 | limit, market | 공매도 경고 등 |
| `us-stock` | 미국주식 | USD quote, 교차 세션 | limit, market | SL/TP 노출 |
| `crypto` | 코인 | 24h, USDT-M mock 톤 | limit, market, stop, stop_limit | 레버리지, **Hedge**, 선물 마진 |
| `global-futures` | 해외선물 | 글로벌 세션 | limit, market, stop, stop_limit | 레버리지, SL/TP, 마진 |
| `kr-futures` | 국내선물 | KRX 선물 세션 | limit, market, stop, stop_limit | 레버리지, SL/TP, 마진 |

**기획 원칙:** 컴포넌트 분기 최소화 — **같은 패널**, `CategoryConfig`로만 분기. 신규 시장 = `MarketId` + registry + adapter + config 한 세트.

**요청하신 4개 자산군과 매핑:** 국내주식 → `kr-stock`, 미국주식 → `us-stock`, 코인 → `crypto`, 해외선물 → `global-futures`. **국내 선물(`kr-futures`)**은 동일 계약으로 포함하며, 탭 라벨만 제품명으로 조정 가능.

---

## 3. 모바일 / PC 레이아웃

**이중 레이아웃 정책:**

| 뷰포트 | 레이아웃 컴포넌트 | 구조 요약 |
|--------|-------------------|-----------|
| `< lg` (모바일) | `TradingLayout` | 세로 스택: **ticker → chart → order book → order panel → history** |
| `lg+` (데스크탑) | `HtsLayout` (또는 동등 Pro 그리드) | **sidebar | chart | orderBook | orderPanel** + 하단 **dock** (포지션·미체결·체결·주문내역) |

**공통:** `min-h-0` / `min-w-0`로 스크롤 영역 고정; 차트 최소 높이 보장; 모바일에서도 호가·주문창은 **1급 패널** (숨기지 않음).

**셸:** `UtePremiumTradingShell`은 시장 탭·사이드 mock 카드만 추가하며, 위 그리드 계약을 **대체하지 않음** (`docs/UTE_ARCHITECTURE.md`).

---

## 4. USD / KRW 병행 표시 정책

**원칙:**

- **Quote 통화 우선:** 각 시장의 `MarketDef.quoteCurrency` 및 `CategoryConfig`의 표시 통화를 **가격·호가·주문 입력의 1차 단위**로 한다 (`src/markets/types.ts` `MarketDef`).
- **참고 환율:** 원화 환산 **보조 표시**는 mock 고정 환율 허용 (예: 상단바 `MOCK_USD_KRW_RATE`, “mock” 라벨). 실시간 환율 API는 본 계약에서 **요구하지 않음**.
- **병행 표기 형식:** `주요가격 (USD)` + `≈ ₩참고` 또는 한 줄 요약; **법적 고지 없는 시뮬레이션** 문구 유지.

---

## 5. 실시간 상태 Badge

**의미:** “실시간”은 **데이터 신선도**가 아니라 **어댑터·세션·구독 상태**를 사용자에게 알리는 UI 상태다.

| 배지/영역 | 상태 축 | 소스(개념) |
|-----------|---------|------------|
| 어댑터 연결 | idle / connecting / ready / error | `boards[marketId].status` |
| 시장 세션 | 정규장 / 야간 / 24h 등 | `CategoryConfig.sessionLabel` + `MarketStateBadge` |
| OneAI | 신호 요약 (온/오프) | `hasOneAiSignal` + `OneAiBadge` |
| 시스템 트레이딩 | mock 상태 스트립(표시만) | `hasSystemTrading` — **§ Scope 자동매매 금지**와 정합 |
| BRG / ADM | 통합 패널·관리자 진입 | 셸 상단 고정 (기능 범위는 mock) |

**금지:** WebSocket “연결됨”을 실거래소와 혼동시키는 카피; 실계정 연동 암시 문구; 배지가 **자동 주문**을 암시하는 카피.

---

## 6. 주문창(Order panel) 상태

**폼 상태(개념 계약):**

- **시장 컨텍스트:** `activeMarketId`, `activeSymbol`, `lastPrice` (보드에서 읽기).
- **주문 타입:** `CategoryConfig.orderTypes`에 포함된 타입만 노출; 기본값 `defaultOrderType`.
- **주문 모드:** `defaultOrderMode` (향후 라이브 어댑터와 동일 시그니처 유지).
- **매수/매도 라벨:** `sides` (주식형 “매수/매도” vs 코인형 “Long/Short” 등).
- **제출:** UI는 **`submitOrder(marketId, req)`** 만 호출; 성공/거절은 `OrderAck` 및 로컬 주문 행으로 표현 (mock).

**비활성·숨김:** `showLeverageSelector`, `showHedgeToggle`, `showStopLossTakeProfit`, `showFuturesMargin` 등 config 플래그로 **표시만** 제어 (엔진 분기 추가 금지).

---

## 7. HTS 스타일 정책

- **밀도:** 데스크탑 기준 13px 본문, 좁은 컬럼 고정폭 호가·주문 (`TradingLayout` 그리드 컬럼 폭 참고).
- **크롬:** 다크 네이비/슬레이트 베이스, 카드형 패널, `border-so-border` / 은은한 `so-accent` 글로우.
- **조절 가능 영역:** `HtsLayout` + `ResizeHandle` + `PRO_LAYOUT_LIMITS` + `usePersistedProLayout` — 사용자 폭/도크 높이 **localStorage** 영속.
- **하단 Dock:** 포지션·미체결·체결·주문내역 탭 — HTS 업무 흐름과 정렬.

---

## 8. 테마 / 화이트라벨 정책

- **디자인 토큰:** `src/index.css` `@theme` — `so-bg`, `so-surface`, `so-accent`, `so-bid` / `so-ask` 등. 컴포넌트는 **직접 hex 남발 지양**, 토큰 또는 `CategoryConfig.accentColor` 한정.
- **시장별 강조:** `MarketDef.accentVar` (선택) + `CategoryConfig.accentColor` — 탭·배지·로고 타일에 사용.
- **화이트라벨:** (기획) 브랜드 패키지 = CSS 변수 오버라이드 + 로고 자산 + `accentColor` 맵; **코어 레이아웃 HTML 구조는 고정**.

---

## 9. Feature flag 정책

**현황:** 저장소 내 전역 feature-flag 모듈은 **필수 아님**. 기획 단계에서의 정책만 규정한다.

| 원칙 | 설명 |
|------|------|
| 기본값 | mock/demo에서 **기능 ON**이 기본 (운영 가드가 아닌 **노출 가드**). |
| 출처 우선순위 | (향후) `import.meta.env.VITE_*` → 런타임 config JSON → `CategoryConfig` 하드 기본. |
| UI 전용 플래그 | 예: “원화 환산 보조 숨김”, “OneAI 배지 숨김”, “뉴스 티커 숨김” — **표시만**; 주문 시그니처 변경 금지. |
| 문서화 | 플래그 추가 시 본 파일 **§9 표**에 이름·기본값·영향 컴포넌트를 한 줄로 기록. 레이아웃 전용 preset·chrome·emergency는 **`docs/UTE_LAYOUT_FEATURE_FLAGS.md`**; **구현:** `src/config/layoutFeatureFlags.ts` (`resolveEffectiveLayoutFlags`). |

---

## 10. OneAI 연동 가능성

- **UI 게이트:** `CategoryConfig.hasOneAiSignal` — false인 시장에서는 `OneAiBadge` 비노출.
- **데이터:** 시장·심볼 컨텍스트를 props로 전달; **읽기 전용** 신호 스트립 (mock fixture / bridge 스냅샷).
- **확장:** `docs/ONEAI_BRIDGE.md` 및 `src/bridges`의 OneAI-shaped mock과 정합; **실시간 추론 서버** 연결은 본 문서 범위 밖.
- **충돌 방지:** 모바일에서 배지가 주문 버튼을 가리지 않도록 z-index·터치 영역 분리 (`MOBILE_TRADING_SYSTEM.md`).

---

## 11. PWA 우선 정책

**목표:** 트레이딩 셸을 **웹앱 수준**으로 취급한다 — 홈 화면 추가·전체 화면·세이프 에어리어·오프라인에서도 **내비게이션·mock 데모**가 깨지지 않게 설계한다.

| 영역 | 정책 |
|------|------|
| 뷰포트·크롬 | `viewport-fit=cover`, `theme-color` 등 메타로 PWA/모바일 브라우저 크롬과 notch 대응 (`index.html` 방향과 정합). |
| 설치 가능성 | (향후) Web App Manifest + 서비스 워커는 **정적 자산·셸 캐시** 중심; **주문·자동매매·실거래 동기화**는 SW에서 수행하지 않음. |
| 오프라인 | mock 어댑터·로컬 상태만으로 **읽기·탐색** 우선; “오프라인” 배지로 데이터 스테일 명시. |
| 백그라운드 | 주기적 백그라운드 동기·푸시로 **실거래/자동매매**를 구현하지 않음 (본 문서 Scope 금지). |
| 성능 | 코드 스플릿·lazy market view 유지; PWA 도입 시에도 **첫 거래 화면 TTI**를 레이아웃 계약과 동일 우선순위로 둠. |
| 관측 | PWA 관련 기능 추가 시 `§9`에 플래그로 “PWA 설치 프롬프트 노출” 등 UI 가드만 기록. |

**현황 메모:** 저장소에 `vite-plugin-pwa` 등은 **필수 아님** — 본 절은 **제품·UI 계약**이며, 구현은 단계적 도입.

---

## Related documents

- `docs/UTE_ARCHITECTURE.md` — 레이어·셸.  
- `docs/UTE_STRUCTURE_AUDIT.md` — 폴더·라우팅.  
- `docs/MOBILE_TRADING_SYSTEM.md` — `TradingLayout` 계약; PWA·터치 정책은 `UNIVERSAL_TRADING_UI_CONTRACT.md` §11과 함께 본다.  
- `docs/UTE_LAYOUT_FEATURE_FLAGS.md` — `layoutPreset`·레이아웃 feature flag·role·emergency.  
- `docs/MULTI_MARKET_RULES.md` — 세션·심볼·PnL.  
- `docs/ONEAI_BRIDGE.md` — OneAI 파일 포인터.  
- `AGENTS.md` — mock-first, 무실거래.

---

## Maintenance

시장 추가, `CategoryConfig` 변경, 레이아웃 슬롯 변경, **PWA/manifest** 도입 시 **본 문서와** `UTE_ARCHITECTURE.md` / `MOBILE_TRADING_SYSTEM.md`를 함께 갱신한다.
