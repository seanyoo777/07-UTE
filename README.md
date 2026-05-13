# 07 Universal Trading Exchange (UTX)

국내주식 / 미국주식 / 국내선물 / 해외선물 / 코인 / 바이너리옵션을 **하나의 HTS UX 안에 통합**하는 최종 플랫폼.

## 통합 로드맵 (5번 → 2번 → 7번)

7번은 **최종 통합 플랫폼**입니다. 거래 엔진/패널은 다음 순서로 옮겨 옵니다.

```
┌──────────────────┐    검증     ┌──────────────────┐    통합   ┌──────────────────┐
│ 05-SpeedOrder    │ ─────────►  │ 02-TGX-CEX       │ ────────► │ 07-Universal-… (7) │
│ (거래창 원본)     │             │ (실거래 UX 검증) │           │ (최종 플랫폼)      │
└──────────────────┘             └──────────────────┘           └──────────────────┘
```

| 단계 | 산출물                                  | 위치       |
| ---- | --------------------------------------- | ---------- |
| ①    | 거래창·주문엔진·호가창·포지션 패널 원형 | **05번**   |
| ②    | 멀티자산 HTS UX·라이브 데이터 검증      | **02번**   |
| ③    | 6개 시장 통합 + 화이트라벨 + 모바일 대응 | **7번**    |

현재 7번의 거래창 자리는 모두 [`IntegrationSlot`](src/components/common/IntegrationSlot.tsx) 으로 래핑되어 있어, 5번에서 만든 모듈을 그대로 차일드로 갈아끼우기만 하면 됩니다.

---

## 7번 현재 상태 (뼈대 + mock)

- ✅ 전체 HTS 레이아웃 (리사이즈 가능 5 영역)
- ✅ 좌측 통합 마켓 메뉴 (6개 시장)
- ✅ 중앙 차트 영역 (TradingView 위젯 임시 사용 — 통합 슬롯)
- ✅ 우측 거래창 placeholder (mock 동작 — 통합 슬롯)
- ✅ 하단 dock (포지션/미체결/체결/주문내역 — 통합 슬롯)
- ✅ 상단 바 (OneAI / 뉴스 / 시스템트레이딩 / 시장상태 / 사용자상태 / 어댑터연결)
- ✅ 2026형 다크 HTS 디자인
- 🚧 거래 엔진 = mock only. **실거래 API 연결 금지.**

## 기술 스택

- React 19 · Vite 8 · Tailwind CSS 4 · Zustand 5 · TypeScript 6

## 개발 원칙

- **거래 핵심은 5번 → 2번 → 7번 순서로만 이동.** 7번에서 거래 로직을 새로 만들지 않는다.
- 가볍게 · 모듈형 · 확장형
- 화이트라벨 가능 (`--color-so-*` 토큰 단일 진입점)
- 모바일 대응 (탭 가로 스크롤, 세로 스택 레이아웃)
- 다중 자산 대응 (`SymbolSpec.assetClass` × `MarketId`)

## 폴더 구조

```
src/
├── shell/                       # 상단 / 셸
│   ├── AppShell.tsx · TopBar.tsx                (레거시 단순 셸)
│   ├── HtsTopBar.tsx                            (2026 HTS 상태바)
│   └── MarketTabs.tsx                           (모바일 전용)
│
├── markets/                     # 시장 등록·뷰
│   ├── types.ts · registry.ts
│   └── views/
│       ├── UniversalMarketView.tsx              (HTS · 모바일 분기)
│       ├── KrStockView · UsStockView · KrFuturesView
│       ├── GlobalFuturesView · CryptoView · BinaryOptionView
│
├── core/                        # 시장 비종속 코어
│   ├── domain/                  (OrderRequest, trading 타입)
│   ├── symbols/SymbolSpec.ts
│   ├── adapters/                (BrokerAdapter 계약 + createMockAdapter)
│   ├── engine/                  (mock 시장 데이터 / 매칭 엔진)
│   └── utils/
│
├── adapters/                    # 6개 시장 mock 어댑터 + 매핑
├── store/                       # zustand 통합 트레이딩 스토어
├── hooks/                       # useMarketSubscription / usePersistedProLayout
├── config/                      # proLayout · categoryConfig
├── layouts/                     # TradingLayout (모바일) / HtsLayout (데스크탑)
│
└── components/
    ├── common/
    │   ├── ErrorBoundary.tsx
    │   ├── PanelShell.tsx
    │   └── IntegrationSlot.tsx                  ← 5번 통합 자리 마커
    ├── chart/
    │   ├── ChartArea.tsx                        (placeholder)
    │   └── TradingViewChart.tsx                 (임시 차트)
    ├── orderbook/OrderBookPanel.tsx             (임시 호가)
    ├── order/OrderPanel.tsx                     (임시 주문 — 5번에서 교체)
    ├── dock/BottomDock.tsx                      (임시 dock — 5번에서 교체)
    ├── sidebar/MarketSidebar.tsx                (통합 마켓 메뉴)
    ├── ticker/TickerBar.tsx                     (모바일 전용)
    ├── history/HistoryPanel.tsx                 (모바일 전용)
    ├── layout/ResizeHandle.tsx
    └── status/
        ├── OneAiBadge.tsx
        ├── NewsTicker.tsx
        ├── SystemTradingStatus.tsx
        ├── MarketStateBadge.tsx
        └── UserStatusBadge.tsx                  ← 사용자 상태
```

## 통합 슬롯 사용법

```tsx
// 현재 (placeholder mock)
<IntegrationSlot
  source="05-SpeedOrder"
  module="SpeedOrderPanel + StopMit"
  state="planned"
  note="현재 카테고리 config 기반 mock. 5번 거래 엔진 통합 예정"
>
  <OrderPanel marketId={marketId} spec={activeSpec} lastPrice={board.lastPrice} />
</IntegrationSlot>

// 통합 완료 후
<IntegrationSlot
  source="05-SpeedOrder"
  module="SpeedOrderPanel + StopMit"
  state="integrated"
>
  <SpeedOrderPanel /* 5번에서 가져온 컴포넌트 */ />
</IntegrationSlot>
```

`state="integrated"` 가 되면 코너 배지가 녹색으로 바뀝니다.

## 실행

```bash
npm install
npm run dev      # 개발 서버
npm run build    # tsc -b && vite build
npm run lint     # eslint
```

## 시장 추가 절차

1. `src/markets/types.ts` 의 `MarketId` union에 새 항목 추가
2. `src/markets/registry.ts` `MARKETS` 배열에 메타 추가
3. `src/config/categoryConfig.ts` 에 카테고리별 UI/주문 config 추가
4. `src/adapters/<newMarket>.ts` 생성 → `createMockAdapter(...)` 호출
5. `src/adapters/index.ts` `ADAPTERS` 맵에 어댑터 등록
6. `src/markets/views/<NewMarket>View.tsx` 생성 → `<UniversalMarketView marketId="..." />` 래핑
7. `src/App.tsx`의 `ViewFor`에 케이스 추가

## 다음 단계 (체크리스트)

- [ ] 5번 SpeedOrder의 `SpeedOrderPanel` → 7번 `OrderPanel` 자리에 통합
- [ ] 5번 SpeedOrder의 `OrderBookPanel` → 7번 `OrderBookPanel` 자리에 통합
- [ ] 5번 SpeedOrder의 `ChartArea` (DOM 합성) → 7번 차트 자리에 통합
- [ ] 5번 SpeedOrder의 `PositionPanel` + `TradeHistoryPanel` → 7번 `BottomDock` 자리에 통합
- [ ] 5번 SpeedOrder의 `tradingStore` → 7번 store 에 슬라이스로 합성 (네이밍 충돌 회피)
- [ ] 02-TGX-CEX 검증된 `ResizeHandle` / `CexScaledSurface` 패턴 흡수
- [ ] 03-OneAI 신호 실데이터 연결 (현재 mock)
- [ ] 라이브 어댑터 (KIS / Binance / IB) PoC — 환경변수 토글
