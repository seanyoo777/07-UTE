import { MARKETS } from '../markets/registry'
import type { MarketId } from '../markets/types'

type Props = {
  active: MarketId
  onChange: (id: MarketId) => void
}

/**
 * 시장 선택 탭 — 5개 시장.
 * 가로 스크롤 가능 (모바일 대응).
 */
export function MarketTabs({ active, onChange }: Props) {
  return (
    <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-so-border bg-so-surface px-2 py-1.5">
      {MARKETS.map((m) => {
        const isActive = m.id === active
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            className={[
              'shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
              isActive
                ? 'bg-so-accent text-white'
                : 'text-so-muted hover:bg-so-surface-2 hover:text-so-text',
            ].join(' ')}
            aria-pressed={isActive}
          >
            <span className="mr-1.5 hidden text-[10px] font-semibold uppercase opacity-70 sm:inline">
              {m.shortLabel}
            </span>
            {m.label}
          </button>
        )
      })}
    </div>
  )
}
