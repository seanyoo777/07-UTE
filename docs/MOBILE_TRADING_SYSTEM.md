# Mobile Trading System

UTE’s trading workspace is designed **mobile-first**: small screens get a **complete vertical workflow**; large screens unlock multi-column density without forking business logic.

---

## Layout contract

**`TradingLayout`** (`src/layouts/TradingLayout.tsx`) defines the canonical arrangement:

| Viewport | Structure |
|----------|-----------|
| **Mobile** (default / `< lg`) | Single column stack: **ticker → chart → order book → order panel → history**. |
| **Desktop** (`lg+`) | Three-column grid: chart + history span the main column; fixed-width columns for order book and order panel. |

Principles:

- **`min-h-0` / `min-w-0`** on flex children so scroll regions behave inside nested layouts.  
- **Chart** remains usable with a minimum height; **history** sits below the chart on mobile for thumb reach on recent activity.  
- **Order book** and **order panel** stay **first-class** on narrow screens — no “desktop-only trading” assumption.

---

## Shell and navigation

- Top bars, sidebars, and market tabs (`MarketTabs`, `MarketSidebar`) should expose **market switching** and **symbol context** within one thumb-friendly header zone where possible.  
- Avoid hover-only critical actions; provide tap targets and visible affordances.

---

## Performance and ergonomics

- Prefer **virtualized or windowed** lists for deep order books and long history once data volume grows.  
- Debounce rapid symbol changes to avoid adapter subscription churn on touch keyboards.  
- Keep **mock data engines** lightweight so mobile CPUs stay responsive during demos.

---

## Integration slots on small screens

`IntegrationSlot` badges are **non-interactive** (`pointer-events-none`) so they do not steal taps from underlying controls. When embedding partner UI (SpeedOrder, TGX-CEX, OneAI, MockInvest), verify **overlay z-index** does not block primary actions on short viewports.

---

## Accessibility

- Respect OS font scaling where feasible.  
- Ensure **color is not the only signal** for bid/ask/success/error — pair with icons or text (existing design tokens should be used consistently).

---

## Mock / demo mode

Mobile layouts must work **fully offline** with mock adapters — no dependency on real-time brokerage WebSockets for core navigation.

---

## Related documents

- `docs/UTE_ARCHITECTURE.md` — Where layout sits in the stack.  
- `docs/MULTI_MARKET_RULES.md` — Shared row types feeding history on all breakpoints.  
- `docs/MARKET_INTEGRATION.md` — Adding a market without breaking responsive grids.
