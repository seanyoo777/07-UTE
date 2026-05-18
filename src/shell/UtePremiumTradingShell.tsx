import type { ReactNode } from 'react'
import { UteShellPlaceholderCard } from '../components/shell/UteShellPlaceholderCard'
import {
  shouldShowChromeSidebar,
  shouldShowMarketDeck,
} from '../config/layoutUiGuards'
import { useEffectiveLayoutFlags } from '../hooks/useEffectiveLayoutFlags'
import type { MarketId } from '../markets/types'
import { useTradingStore } from '../store/tradingStore'
import { UTE_PREMIUM_SHELL_MARKETS } from './utePremiumShellConfig'

type Props = {
  activeMarketId: MarketId
  onMarketChange: (id: MarketId) => void
  children: ReactNode
}

function ShellSidebarRail({ marketId }: { marketId: MarketId }) {
  const board = useTradingStore((s) => s.boards[marketId])
  const bidN = board.orderBook.bids.length
  const askN = board.orderBook.asks.length
  const posN = board.positions.length
  const upnl = board.positions.reduce((a, p) => a + p.unrealizedPnl, 0)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2 pb-3 pt-2">
      <p className="px-1 text-[9px] font-semibold uppercase tracking-widest text-so-muted/90">Navigate</p>
      <div className="flex flex-col gap-1">
        {(['Dashboard', 'Liquidity', 'Risk desk'] as const).map((label) => (
          <button
            key={label}
            type="button"
            disabled
            className="cursor-not-allowed rounded-md border border-so-border/40 bg-so-bg/30 px-2 py-1.5 text-left text-[10px] font-medium text-so-muted opacity-70"
            title="Phase 1 — mock shell only"
          >
            {label}
          </button>
        ))}
      </div>
      <div className="my-1 border-t border-so-border/40" />
      <p className="px-1 text-[9px] font-semibold uppercase tracking-widest text-so-muted/90">Workspace</p>
      <UteShellPlaceholderCard title="Order book" subtitle="mock" accent="accent">
        <span className="font-mono text-so-text/90">{board.activeSymbol}</span>
        <div className="mt-1 grid grid-cols-2 gap-1 font-mono text-[9px]">
          <span>bid levels {bidN}</span>
          <span>ask levels {askN}</span>
        </div>
        <p className="mt-1 text-[8px] text-so-muted/80">Full book remains in main workspace →</p>
      </UteShellPlaceholderCard>
      <UteShellPlaceholderCard title="Positions" subtitle="mock" accent="bid">
        <div className="font-mono text-so-text/90">open {posN}</div>
        <div className="mt-0.5 font-mono text-[9px] text-so-muted">
          Σ uPnL{' '}
          <span className={upnl >= 0 ? 'text-so-bid' : 'text-so-ask'}>
            {upnl >= 0 ? '+' : ''}
            {upnl.toFixed(2)}
          </span>
        </div>
        <p className="mt-1 text-[8px] text-so-muted/80">Detail panels in main grid (unchanged).</p>
      </UteShellPlaceholderCard>
    </div>
  )
}

/**
 * UTE premium trading shell — chrome controlled by layout feature flags (UI only).
 */
export function UtePremiumTradingShell({ activeMarketId, onMarketChange, children }: Props) {
  const layoutFlags = useEffectiveLayoutFlags()
  const showShellSidebar = shouldShowChromeSidebar(layoutFlags)
  const showMarketDeck = shouldShowMarketDeck(layoutFlags)

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-so-bg lg:flex-row">
      {showShellSidebar ? (
        <aside className="relative hidden w-[220px] shrink-0 flex-col border-r border-so-border-2/70 bg-gradient-to-b from-[#0d1119] via-so-surface to-so-bg lg:flex xl:w-60">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-so-accent/15 via-transparent to-so-accent-2/10" />
          <div className="border-b border-so-border/50 px-3 py-3">
            <div className="text-[11px] font-bold tracking-tight text-so-text">UTE</div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-so-muted">Trading shell</div>
            <p className="mt-1.5 text-[8px] leading-snug text-so-muted/80">mock · unified · no live route</p>
          </div>
          <ShellSidebarRail marketId={activeMarketId} />
        </aside>
      ) : null}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {showMarketDeck ? (
          <div className="shrink-0 border-b border-so-border-2/60 bg-gradient-to-r from-so-surface via-so-surface-2 to-so-surface px-2 py-2 shadow-[inset_0_-1px_0_rgba(79,135,255,0.06)]">
            <div className="flex items-center justify-between gap-2 pb-1">
              <span className="text-[9px] font-semibold uppercase tracking-widest text-so-muted">Markets</span>
              <span className="hidden text-[8px] text-so-muted/70 sm:inline">Linear / HTS tone · mock</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-0.5 pt-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {UTE_PREMIUM_SHELL_MARKETS.map((m) => {
                const on = m.marketId === activeMarketId
                return (
                  <button
                    key={m.marketId}
                    type="button"
                    onClick={() => onMarketChange(m.marketId)}
                    aria-pressed={on}
                    className={[
                      'group shrink-0 rounded-lg border px-3 py-2 text-left transition-all',
                      on
                        ? 'border-so-accent/50 bg-so-accent/15 text-so-text shadow-[0_0_20px_-8px_rgba(79,135,255,0.45)]'
                        : 'border-so-border-2/50 bg-so-bg/40 text-so-muted hover:border-so-border-2 hover:bg-so-surface-2/80 hover:text-so-text',
                    ].join(' ')}
                  >
                    <div className="text-[11px] font-semibold leading-tight">{m.shellLabel}</div>
                    <div className="mt-0.5 text-[8px] font-medium uppercase tracking-wide text-so-muted group-hover:text-so-muted/90">
                      {m.shellHint}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}

        <div className="relative flex min-h-0 flex-1 flex-col p-1.5 sm:p-2 lg:p-3">
          {showMarketDeck ? (
            <div className="pointer-events-none absolute inset-x-3 top-2 h-px bg-gradient-to-r from-transparent via-so-accent/20 to-transparent lg:inset-x-4" />
          ) : null}
          <div
            className={[
              'flex min-h-0 flex-1 flex-col overflow-hidden',
              showMarketDeck
                ? 'rounded-xl border border-so-border-2/55 bg-so-surface/25 shadow-[0_0_48px_-16px_rgba(79,135,255,0.18),inset_0_1px_0_rgba(255,255,255,0.04)]'
                : 'bg-so-bg/20',
            ].join(' ')}
          >
            {showMarketDeck ? (
              <>
                <div className="flex shrink-0 items-center justify-between gap-2 border-b border-so-border/50 bg-so-bg/35 px-2 py-1.5 sm:px-3">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-so-muted">Workspace</span>
                  <span className="text-[8px] text-so-muted/70">chart · book · order — existing layout</span>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-so-border/30 bg-so-bg/20 px-2 py-1 sm:px-3">
                  <span className="rounded-md border border-so-border-2/50 bg-so-surface/30 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-so-muted">
                    Chart
                  </span>
                  <span className="text-[8px] text-so-muted/75">mock canvas · TV widget in grid below</span>
                </div>
              </>
            ) : null}
            <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
