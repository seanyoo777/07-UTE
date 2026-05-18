# UTE Layout Feature Flags — Contract (Planning Phase 2)

**Project:** 07-UTE (Universal Trading Exchange)  
**Phase:** 기획 2단계 — **레이아웃·가시성**만 feature flag로 제어하는 계약.  
**Date:** 2026-05-13  
**Implementation (phase 3):** `src/config/layoutFeatureFlags.ts` — `DEFAULT_LAYOUT_FLAGS`, `resolveEffectiveLayoutFlags()`, env-only (no localStorage / server).  
**Implementation (phase 4):** `useEffectiveLayoutFlags()` → `UniversalMarketView` / `OrderPanel` UI guards — `src/config/layoutUiGuards.ts`, `src/components/layout/LayoutModeBanner.tsx`.

**상위 계약:** `docs/UNIVERSAL_TRADING_UI_CONTRACT.md` (UI 상태·PWA), `docs/MOBILE_TRADING_SYSTEM.md` (`TradingLayout`).

---

## Scope & non-goals (절대 금지)

| 금지 항목 | 설명 |
|-----------|------|
| 실거래 API | 플래그로 “라이브 브로커”를 켜도 **본 저장소 기본 경로**는 mock `BrokerAdapter` 유지. |
| 자동매매 | 플래그·프리셋으로 백그라운드 주문·봇 UI를 **구현·활성화**하지 않음. |
| WebSocket | 플래그가 실시간 전송 계층을 도입하지 않음. |
| 사용자 데이터 저장 | 플래그·프리셋·역할의 **서버 영속·계정별 프로필 DB** 구현 금지. (허용: `localStorage` 레이아웃 폭 등 **기기 로컬** UI 상태 — `PRO_LAYOUT_STORAGE_KEY`와 동일 계열.) |

**불변 원칙:**

- 레이아웃 변경은 **UI 레벨만** (어떤 셸·그리드·패널·위젯을 그릴지).
- **`submitOrder` / `BrokerAdapter` / mock 엔진** 시그니처·동작은 플래그로 변경하지 않음.
- 플래그 **OFF** 또는 미해석 시 **graceful fallback** — 기본 `hts` + 뷰포트 기반 `TradingLayout` (`UniversalMarketView` 현행과 동일).

---

## 1. `layoutPreset` 종류

`layoutPreset`은 **한 번에 하나** 활성화되는 레이아웃 모드 식별자다. 구현 시 권장 타입:

```ts
type LayoutPreset = 'hts' | 'simple' | 'mobile' | 'compact' | 'tournament'
```

| Preset | 의도 | 주 레이아웃 컴포넌트 | 비고 |
|--------|------|----------------------|------|
| **`hts`** | 데스크탑 HTS 밀도 (기본) | `lg+` → `HtsLayout`; `< lg` → `TradingLayout` | `UniversalMarketView` **현행 기본값**과 동일 |
| **`simple`** | 차트·주문 중심, 보조 패널 축소 | `TradingLayout` 또는 `HtsLayout` with reduced chrome | 사이드 dock·일부 IntegrationSlot 배지 숨김 |
| **`mobile`** | 터치·세로 스택 강제 | `TradingLayout` only (`HtsLayout` hidden) | `UtePremiumTradingShell` 시장 탭은 유지 가능 |
| **`compact`** | 좁은 폭·노트북 | `HtsLayout` + `PRO_LAYOUT_DEFAULTS` 축소 또는 `compact` 플래그로 컬럼 폭 상한 | `usePersistedProLayout` / `PRO_LAYOUT_LIMITS`와 정합 |
| **`tournament`** | MockInvest·랭킹·이벤트 UX | `TradingLayout` 변형 + tournament 위젯 슬롯 | **거래 그리드는 유지**; 상·하단에 tournament 카드만 추가 (주문 로직 무변경) |

**해석 우선순위 (권장):**

1. `emergencyDisable` (§8) → 강제 `simple` 또는 `hts` safe mode  
2. 명시 `layoutPreset` (env / runtime config)  
3. 뷰포트: `< lg` 이고 preset이 `hts`만 지정된 경우 → 내부적으로 `mobile` 스택 적용 (breakpoint fallback)  
4. 기본값: **`hts`**

**셸 정합:**

| 레이어 | 파일 | Preset 영향 |
|--------|------|-------------|
| 앱 셸 | `UtePremiumTradingShell` | 시장 탭·사이드 mock 카드 `visibility` (§6) |
| 시장 뷰 | `UniversalMarketView` | `HtsLayout` vs `TradingLayout` 분기 |
| Pro 그리드 | `HtsLayout`, `ResizeHandle`, `proLayout.ts` | `compact` 시 기본·상한 폭 |

---

## 2. Feature flag 구조

플래그는 **레이아웃·가시성·통합 위젯** 전용이다. 거래 도메인 플래그와 분리한다.

### 2.1 권장 스키마 (개념)

```ts
type UteLayoutFeatureFlags = {
  /** §1 — 단일 활성 프리셋 */
  layoutPreset: LayoutPreset

  /** §6 — 크롬 가시성 */
  chrome: {
    showPremiumShell: boolean
    showHtsTopBar: boolean
    showMarketDeck: boolean
    showSidebar: boolean
    showBottomDock: boolean
    showIntegrationSlots: boolean
  }

  /** §5 — 파트너·허브 위젯 (표시만) */
  integrations: {
    oneAi: boolean
    gameHub: boolean
    mockInvest: boolean
    tgxCexStrip: boolean
    speedOrderChrome: boolean
  }

  /** §7 */
  readOnly: boolean

  /** §8 — true 시 아래 effectiveFlags로 덮어씀 */
  emergencyDisable: boolean
}
```

### 2.2 출처 우선순위

| 순위 | 출처 | 용도 |
|------|------|------|
| 1 | `emergencyDisable` (운영·mock 킬스위치) | 전역 safe layout |
| 2 | `import.meta.env.VITE_UTE_LAYOUT_*` | 빌드·데모 프로필 |
| 3 | (향후) 런타임 `layoutFlags.json` mock | 화이트라벨·A/B |
| 4 | `CategoryConfig`의 `hasOneAiSignal` 등 | **시장별** 위젯 게이트 (플래그 AND) |
| 5 | 하드코드 기본 (`DEFAULT_LAYOUT_FLAGS`) | graceful fallback |

### 2.3 `effectiveFlags` 계산

```
effective = merge(DEFAULT, env, runtime)
if emergencyDisable → apply EMERGENCY_PROFILE
effective.integrations.oneAi &&= categoryConfig.hasOneAiSignal
if readOnly → disable order panel inputs (UI only); submit still mock-blocked by copy
```

**구현 (phase 3):** `resolveEffectiveLayoutFlags(input?)` in `src/config/layoutFeatureFlags.ts`.

- `input.env: {}` → defaults only (unit tests).  
- `input` omitted → `import.meta.env` Vite keys.  
- Returns `EffectiveLayoutFlags` including `forceMobileStack` (`mobile` preset, or `hts` + `viewportIsMobile: true`).  
- CategoryConfig AND for OneAI — **not yet** in resolver; UI callsite or future `applyCategoryGates()`.

### Phase 4 — UI guards (implemented)

| Flag | UI behavior |
|------|-------------|
| `readOnly` | `OrderPanel` inputs/submit disabled + in-panel notice; `getLayoutModeBannerCopy` strip |
| `emergencyDisable` | `IntegrationSlot` badges skipped (`SlotWrap`); `BottomDock` → `LayoutDockPlaceholder` on desktop |
| defaults (`env: {}`) | Same chrome as before phase 4 |

**Files:** `src/hooks/useEffectiveLayoutFlags.ts`, `src/markets/views/UniversalMarketView.tsx`, `src/components/order/OrderPanel.tsx`, `src/config/layoutUiGuards.ts`.

### Phase 5 — Premium shell chrome (implemented)

| `chrome.*` | UI |
|------------|-----|
| `showPremiumShell` | `App.tsx` — `UtePremiumTradingShell` vs direct `ViewFor` in `main` |
| `showHtsTopBar` | `App.tsx` — `HtsTopBar` conditional |
| `showMarketDeck` | `UtePremiumTradingShell` — market tabs + workspace card chrome |
| `showSidebar` | Shell left rail + `HtsLayout` `showSidebar` / `MarketSidebar` |
| `showBottomDock` | `HtsLayout` `showDock` + dock slot / `LayoutDockPlaceholder` |
| `showIntegrationSlots` ∧ `integrations.speedOrderChrome` | `shouldShowIntegrationSlot` → `SlotWrap` |

**Files:** `src/App.tsx`, `src/shell/UtePremiumTradingShell.tsx`, `src/layouts/HtsLayout.tsx`, `src/config/layoutUiGuards.ts`.

### Phase 6 — `.env.example` documentation (implemented)

**Copy template:** repository root [`.env.example`](../.env.example) → local `.env.local` (gitignored).  
**Resolver:** `src/config/layoutFeatureFlags.ts` — unset keys use `DEFAULT_LAYOUT_FLAGS`.

#### Environment variable reference

| Key | Type | Default (omit key) | Recommended (mock demo) | Affects |
|-----|------|--------------------|-------------------------|---------|
| `VITE_UTE_LAYOUT_PRESET` | enum | `hts` | `hts` | §1 preset; unknown → `hts` |
| `VITE_UTE_EMERGENCY_DISABLE` | bool | `false` | `false` | §8 safe profile (`simple`, integrations off, dock off) |
| `VITE_UTE_READ_ONLY` | bool | `false` | `false` | Order panel UI guard §7 |
| `VITE_UTE_READONLY` | bool | — | — | Alias of `VITE_UTE_READ_ONLY` |
| `VITE_UTE_SHOW_PREMIUM_SHELL` | bool | `true` | `true` | `UtePremiumTradingShell` vs bare `ViewFor` |
| `VITE_UTE_SHOW_HTS_TOPBAR` | bool | `true` | `true` | `HtsTopBar` |
| `VITE_UTE_SHOW_MARKET_DECK` | bool | `true` | `true` | Premium shell market tabs + workspace chrome |
| `VITE_UTE_SHOW_SIDEBAR` | bool | `true` | `true` | Shell rail + `HtsLayout` market sidebar |
| `VITE_UTE_SHOW_BOTTOM_DOCK` | bool | `true` | `true` | `HtsLayout` bottom dock |
| `VITE_UTE_SHOW_INTEGRATION_SLOTS` | bool | `true` | `true` | Master switch for `IntegrationSlot` badges |
| `VITE_UTE_ONEAI_CHROME` | bool | `true` | `true` | OneAI-shaped chrome (with master switch) |
| `VITE_UTE_MOCKINVEST_CHROME` | bool | `true` | `true` | MockInvest / tournament chrome |
| `VITE_UTE_GAMEHUB_CHROME` | bool | `false` | `false` | GameHub slot (future) |
| `VITE_UTE_TGX_CEX_STRIP` | bool | `true` | `true` | TGX-CEX-shaped strip / slots |
| `VITE_UTE_SPEEDORDER_CHROME` | bool | `true` | `true` | SpeedOrder `SlotWrap` badges |

**Boolean parsing:** `true` / `1` / `yes` / `on` → true; `false` / `0` / `no` / `off` → false.

#### Recommended demo profiles (examples only)

| Profile | Keys to set |
|---------|-------------|
| **Normal demo** | *(omit all — defaults)* |
| **Safe mode** | `VITE_UTE_EMERGENCY_DISABLE=true` |
| **Read-only kiosk** | `VITE_UTE_READ_ONLY=true` |
| **Minimal chrome** | `VITE_UTE_SHOW_PREMIUM_SHELL=false`, `VITE_UTE_SHOW_HTS_TOPBAR=false` |

#### Security

- **No secrets** in `.env.example` or layout env — no API keys, broker tokens, or user DB URLs.
- Layout flags are **build-time / dev-server** (`import.meta.env`); they do not enable live trading.
- Do not commit `.env.local` with real credentials; use `.env.example` as the public template only.

### Phase 7 — `.gitignore` for local env (implemented)

Repository [`.gitignore`](../.gitignore) explicitly ignores:

- `.env.local`
- `.env.*.local`
- `.env.development.local`
- `.env.production.local`

(Additionally, `*.local` covers other `*.local` artifacts.) **Never commit** local override files — even if they only contain layout flags today, they are the designated place for future secrets.

| File | Git | Purpose |
|------|-----|---------|
| `.env.example` | **Committed** | Public template; comments only; no real keys |
| `.env.local` | **Ignored** | Developer machine overrides |
| `.env.development.local` / `.env.production.local` | **Ignored** | Vite mode-specific local overrides |

If a local env file was committed before this rule: remove it from the index (`git rm --cached …`), rotate any exposed credentials, and keep secrets only in ignored files or a vault.

**문서화:** 새 플래그 추가 시 위 표 + `.env.example` + `LayoutFlagsEnvRecord` in `layoutFeatureFlags.ts`를 함께 갱신.

---

## 3. Role 기반 레이아웃 정책

**범위 분리:**

| 영역 | Role 소스 | 레이아웃 영향 |
|------|-----------|----------------|
| **Admin** (`/admin`) | `adminAccessTypes` · `adminAccessPolicy` · `useAdminAccessStore` | 관리자 대시보드 패널·버튼 가드 (기존 mock RBAC). 트레이딩 `layoutPreset`과 **독립**. |
| **Trading shell** (향후) | `TradingLayoutRole` (기획) — e.g. `viewer` \| `trader` \| `operator` | `readOnly`, dock 편집, resize 허용 여부 |

**정책:**

- **viewer:** `readOnly: true`, 주문 패널 입력 비활성, 호가·차트·히스토리는 조회(mock).
- **trader (mock demo):** full chrome; preset은 사용자(또는 env) 선택 가능 — **서버에 저장하지 않음**.
- **operator:** `compact` 또는 `hts` + BRG/ADM 노출 유지; 여전히 **실주문·자동매매 없음**.

Role → flags 매핑은 **순수 함수** `resolveLayoutFlagsForRole(role): UteLayoutFeatureFlags` 로 두고, UI 컴포넌트는 `effectiveFlags`만 구독한다.

---

## 4. 모바일 / PWA 우선 정책

`docs/UNIVERSAL_TRADING_UI_CONTRACT.md` **§11**과 정합:

| 조건 | 동작 |
|------|------|
| 뷰포트 `< lg` | `layoutPreset === 'hts'` 이더라도 **본문**은 `TradingLayout` 스택 (현행 `UniversalMarketView`). |
| `layoutPreset === 'mobile'` | `HtsLayout` 래퍼 **미렌더**; `UtePremiumTradingShell` 시장 탭만 선택적으로 유지. |
| PWA 설치·standalone | `theme-color`, `viewport-fit=cover` 유지; 플래그는 **추가 네트워크·백그라운드 동기**를 켜지 않음. |
| 오프라인 | preset·flags는 **빌드/로컬 기본값**으로 해석; “오프라인” 배지는 adapter `status` UI만. |

**우선순위:** 모바일 사용성 > 데스크탑 밀도 — `compact`가 터치 타겟을 깨면 자동으로 `mobile` fallback.

---

## 5. OneAI / GameHub / MockInvest 연동 플래그

모두 **`integrations.*` + `CategoryConfig` AND** 게이트. 데이터는 bridge·mock surface만 (`src/bridges`, `src/strategies`, `src/mockinvest`).

| Flag | UI 대상 | 데이터 (mock) |
|------|---------|----------------|
| `integrations.oneAi` | `OneAiBadge`, 전략 스트립 | `src/strategies`, OneAI bridge |
| `integrations.mockInvest` | BRG 패널 tournament 블록, `tournament` preset 슬롯 | `src/mockinvest`, `mockinvestMockBridge` |
| `integrations.gameHub` | (향후) GameHub 카드·탭 | 기획 슬롯 — **미구현 시 OFF + 빈 fallback** |
| `integrations.tgxCexStrip` | CEX-shaped 요약·`IntegrationSlot` label `02-TGX-CEX` | `src/cex/types` |
| `integrations.speedOrderChrome` | Chart/Book/Order `IntegrationSlot` 배지 | `src/vendor` |

**OFF 시:** 해당 위젯 **미마운트** 또는 placeholder 한 줄 — 레이아웃 그리드는 **빈 슬롯 collapse** (`min-h` 유지로 점프 방지).

---

## 6. Sidebar / Topbar / Widget visibility 정책

| Chrome | 컴포넌트 | Flag | OFF fallback |
|--------|----------|------|----------------|
| Top bar | `HtsTopBar` | `chrome.showHtsTopBar` | 최소 1줄 status strip (mock) 또는 shell만 |
| Premium shell | `UtePremiumTradingShell` | `chrome.showPremiumShell` | `children`만 full-bleed (`App` 직결) |
| Market deck | 셸 내 시장 탭 | `chrome.showMarketDeck` | `MarketSidebar` / 모바일 탭 중 하나는 **반드시** 시장 전환 제공 |
| HTS sidebar | `MarketSidebar` in `HtsLayout` | `chrome.showSidebar` | 시장 전환은 market deck 또는 ticker 영역 |
| Bottom dock | `BottomDock` | `chrome.showBottomDock` | `HistoryPanel`을 스택 하단으로 흡수 (`simple`) |
| Integration badges | `IntegrationSlot` | `chrome.showIntegrationSlots` | 패널 내용만 표시, 배지 숨김 |

**Widget** = 차트, 호가, 주문, ticker, dock 탭. **핵심 4종**(ticker·chart·book·order)은 preset `simple`에서도 **제거하지 않음** — 축소·접기만 허용.

---

## 7. Read-only 모드 정책

| 항목 | 정책 |
|------|------|
| 트리거 | `readOnly: true` (env `VITE_UTE_READ_ONLY`, role `viewer`, emergency profile) |
| UI | `OrderPanel` 입력·제출 버튼 `disabled`; 시각적 “Demo · read-only” 띠 |
| Store | **`submitOrder` 호출 차단은 UI에서만** — store 메서드 시그니처 유지 (테스트·mock 데모 일관성) |
| 호가·차트 | 조회·스크롤 유지 (mock tick) |
| Admin | 기존 `/admin` read-only mock과 별개; trading read-only는 **트레이딩 경로만** |

---

## 8. Emergency disable 정책

**목적:** 장애·규제 데모·과도한 chrome 시 **즉시 safe UI**.

| 항목 | 값 |
|------|-----|
| 트리거 | `emergencyDisable: true` (env `VITE_UTE_EMERGENCY_DISABLE`, 운영 mock 스위치) |
| 강제 preset | `simple` (또는 `hts` without integrations) |
| 강제 OFF | `integrations.*` 전부, `showIntegrationSlots`, GameHub, OneAI, MockInvest chrome |
| 유지 | 시장 전환, mock 차트·호가·read-only 주문창, adapter status 배지 |
| 복구 | 플래그 false → 이전 effectiveFlags 재계산 (세션 메모리만; **서버 저장 없음**) |

---

## 9. Append-only audit 연결 가능성

**현황:** `src/admin/adminAuditLog.ts` — in-memory **append-only** mock (`createAdminAuditLogEntry`, `AdminAuditAction`).

**향후 연결 (계약만):**

| 이벤트 (예) | action | resource |
|-------------|--------|----------|
| preset 변경 (mock) | `layout_preset_change` | `trading/layout` |
| emergency ON | `layout_emergency_disable` | `trading/layout` |
| read-only 진입 | `layout_read_only` | `trading/order-panel` |

- **append-only:** 기존 행 수정·삭제 UI 없음 (관리자 감사 패널과 동일 패턴).
- **저장:** Phase 2 구현 전까지 **메모리만** — § Scope “사용자 데이터 저장 구현 금지”와 정합.
- Trading layout audit은 **admin audit 스토어와 공유 가능**하나, trading 경로는 **쓰기 최소화**(관측 로그만).

---

## 10. 다국어 (i18n) 레이아웃 고려사항

| 주제 | 정책 |
|------|------|
| 문자열 | 플래그·preset 이름은 **코드 식별자 영문**; UI 라벨은 i18n 키 (`market.tabs.crypto` 등). |
| 길이 | `shellLabel`·배지·탭: `min-w` + truncate; DE/EN 장문 시 market deck **가로 스크롤** 유지. |
| RTL | (향후) `dir=rtl` 시 sidebar 좌우 반전 — Phase 2에서는 **LTR 기본** 문서화만. |
| 숫자 | 호가·PnL은 `font-mono` + locale 숫자 포맷; 레이아웃 컬럼 폭은 `compact`에서 숫자 필드 우선. |
| 날짜 | 세션 배지(`sessionLabel`)는 i18n 문자열; 고정 폭 배지 피하기. |

플래그 문서·env 주석은 **영문 키** 유지; 제품 카피만 번역 파일로 분리.

---

## 11. TGX-CEX와 공통화 가능한 부분

UTE는 **02 TGX-CEX 소스 복사 없이** 계약·타입 정렬만 한다 (`src/cex/types.ts`, `docs/TGX_VENDOR_SYNC.md`).

| 공통화 후보 | UTE | TGX-CEX (개념) | 공유 방식 |
|-------------|-----|----------------|-----------|
| `layoutPreset` enum | 본 문서 | 동일 5종 또는 부분집합 | **공유 패키지** 또는 duplicated type + lint 동기 |
| Pro layout storage key 스키마 | `PRO_LAYOUT_STORAGE_KEY` | pro-layout v1 | 키 이름·limit 상수 문서 동기 |
| `HtsLayout` 슬롯 | sidebar \| chart \| book \| order \| dock | 동일 5-slot | 컴포넌트는 **각 repo 소유**; props 계약만 공유 |
| Feature flag schema | `UteLayoutFeatureFlags` | `TgxLayoutFeatureFlags` (기획) | JSON Schema / TS type export |
| CEX strip visibility | `integrations.tgxCexStrip` | market header strip | `selectedSymbol` + snapshot 타입 공유 (`cex/types`) |
| Mobile stack order | `TradingLayout` | 동일 스택 순서 | `MOBILE_TRADING_SYSTEM.md` + 본 문서 §4 |

**비공통:** UTE 전용 `UtePremiumTradingShell`, BRG/ADM, MockInvest `tournament` preset, admin RBAC.

---

## Graceful fallback (요약)

```
if (!flags || parseError) → DEFAULT_LAYOUT_FLAGS (preset: hts)
if (emergencyDisable)     → EMERGENCY_PROFILE
if (< lg && preset hts)   → render TradingLayout stack for main grid
if (integration OFF)      → omit widget; do not throw
if (unknown preset)       → hts
```

거래 실패로 이어지는 layout 오류는 **허용하지 않음** — worst case는 `simple` full stack.

---

## Related documents

- `docs/UNIVERSAL_TRADING_UI_CONTRACT.md` — UI 상태·§9 feature flag·§11 PWA.  
- `docs/MOBILE_TRADING_SYSTEM.md` — `TradingLayout`.  
- `docs/UTE_ARCHITECTURE.md` — Premium shell, bridges.  
- `docs/TGX_VENDOR_SYNC.md` — CEX/vendor alignment.  
- `docs/ONEAI_BRIDGE.md`, `docs/MARKET_INTEGRATION.md` — Integration flags.  
- `AGENTS.md` — mock-first.

---

## Maintenance

`layoutPreset` 추가, `UniversalMarketView` 분기 변경, env 키 추가 시 **본 문서**, `UNIVERSAL_TRADING_UI_CONTRACT.md` §9, `MASTER_MANUAL.md`를 함께 갱신한다.
