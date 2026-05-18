import { MARKET_CONTEXT_PRESETS, listMarketContextPresetIds } from './marketContextRegistry'
import { useMarketContextStore } from './marketContextStore'

type Props = {
  compact?: boolean
}

export function TradingWindowMarketContextSelector({ compact }: Props) {
  const previewContextId = useMarketContextStore((s) => s.previewContextId)
  const setPreviewContextId = useMarketContextStore((s) => s.setPreviewContextId)

  const ids = listMarketContextPresetIds()

  return (
    <div
      className={compact ? 'space-y-1' : 'space-y-2'}
      data-testid="trading-window-market-context-selector"
    >
      <p className="text-[9px] font-semibold uppercase tracking-wide text-so-muted">
        Market context
        {previewContextId ? null : (
          <span className="ml-1 font-normal normal-case text-so-muted/80">
            · workspace uses route market
          </span>
        )}
      </p>
      <div className={`flex flex-wrap gap-1 ${compact ? '' : 'max-w-xl'}`}>
        {ids.map((id) => {
          const ctx = MARKET_CONTEXT_PRESETS[id]
          const active = previewContextId === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setPreviewContextId(id)}
              className={`rounded-md border px-2 py-1 text-left ${
                active
                  ? 'border-violet-500/50 bg-violet-500/15 text-so-fg'
                  : 'border-so-border/50 text-so-muted hover:bg-so-surface/40'
              } ${compact ? 'text-[9px]' : 'text-[10px]'}`}
              data-ute-twp-market-select={id}
            >
              <span className="font-semibold">{ctx.label}</span>
              {!compact ? (
                <span className="mt-0.5 block text-[8px] text-so-muted">{ctx.uiStyleLabel}</span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
