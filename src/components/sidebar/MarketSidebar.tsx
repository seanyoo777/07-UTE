import { useEffect, useMemo, useState } from 'react'
import { getCategoryConfig } from '../../config/categoryConfig'
import { MARKETS } from '../../markets/registry'
import type { MarketId } from '../../markets/types'
import type { SymbolSpec } from '../../core/symbols/SymbolSpec'
import { useTradingStore } from '../../store/tradingStore'
import { formatPct, formatPrice } from '../../core/utils/format'

type Props = {
  activeMarket: MarketId
  onMarketChange: (id: MarketId) => void
}

const FAV_KEY = 'utx.sidebar.favorites.v1'

/**
 * 좌측 통합 마켓 패널.
 *
 * 상단: 5개 카테고리 그리드 (탭 형태)
 * 중간: 검색
 * 하단: 활성 카테고리의 심볼 리스트 (실시간 라스트가 + 변동률 + 즐겨찾기)
 *
 * 화이트라벨 / 다크 톤 유지. 카테고리 색상은 accentColor 활용.
 */
export function MarketSidebar({ activeMarket, onMarketChange }: Props) {
  const board = useTradingStore((s) => s.boards[activeMarket])
  const setActiveSymbol = useTradingStore((s) => s.setActiveSymbol)
  const [query, setQuery] = useState('')
  const [favorites, setFavorites] = useState<Set<string>>(() => readFavorites())

  useEffect(() => {
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(Array.from(favorites)))
    } catch {
      /* ignore */
    }
  }, [favorites])

  const filtered: SymbolSpec[] = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = board.symbols
      .filter((sp) => {
        if (!q) return true
        return (
          sp.symbol.toLowerCase().includes(q) ||
          sp.displayName.toLowerCase().includes(q)
        )
      })
      .slice()
    list.sort((a, b) => {
      const keyA = `${activeMarket}:${a.symbol}`
      const keyB = `${activeMarket}:${b.symbol}`
      const af = favorites.has(keyA) ? 1 : 0
      const bf = favorites.has(keyB) ? 1 : 0
      if (af !== bf) return bf - af
      return a.displayName.localeCompare(b.displayName)
    })
    return list
  }, [board.symbols, query, favorites, activeMarket])

  function toggleFav(sym: string): void {
    setFavorites((prev) => {
      const next = new Set(prev)
      const k = `${activeMarket}:${sym}`
      if (next.has(k)) next.delete(k)
      else next.add(k)
      return next
    })
  }

  return (
    <nav
      className="so-panel-glow relative flex h-full min-h-0 flex-col overflow-hidden border-r border-so-border bg-gradient-to-b from-so-surface to-so-bg"
      aria-label="시장·종목 선택"
    >
      <div className="shrink-0 border-b border-so-border px-2 pb-2 pt-1.5">
        <div className="mb-1 px-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-so-muted">
          통합 마켓
        </div>
        <div className="grid grid-cols-3 gap-1">
          {MARKETS.map((m) => {
            const isActive = m.id === activeMarket
            const cfg = getCategoryConfig(m.id)
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onMarketChange(m.id)}
                className={[
                  'relative flex flex-col items-center justify-center overflow-hidden rounded-md border px-1 py-2 text-[11px] font-semibold transition-all',
                  isActive
                    ? 'border-so-accent/50 bg-so-surface-2 text-so-text shadow-[0_0_12px_rgba(79,135,255,0.15)]'
                    : 'border-so-border bg-so-surface-2/40 text-so-muted hover:border-so-border-2 hover:text-so-text',
                ].join(' ')}
                aria-pressed={isActive}
                title={m.label}
                style={
                  isActive
                    ? {
                        backgroundImage: `linear-gradient(135deg, ${cfg.accentColor}22, transparent 60%)`,
                      }
                    : undefined
                }
              >
                {isActive ? (
                  <span
                    className="absolute inset-x-0 top-0 h-px"
                    style={{ backgroundColor: cfg.accentColor }}
                    aria-hidden
                  />
                ) : null}
                <span
                  className="text-[9px] font-bold uppercase tracking-wider"
                  style={isActive ? { color: cfg.accentColor } : { opacity: 0.65 }}
                >
                  {m.shortLabel}
                </span>
                <span>{m.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="shrink-0 border-b border-so-border px-2 py-1.5">
        <div className="relative">
          <span
            className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-[11px] text-so-muted"
            aria-hidden
          >
            ⌕
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="종목 검색"
            autoComplete="off"
            className="w-full rounded-md border border-so-border bg-so-bg/60 py-1.5 pl-6 pr-2 text-[12px] text-so-text outline-none transition-colors placeholder:text-so-muted focus:border-so-accent focus:bg-so-bg"
            aria-label="종목 검색"
          />
        </div>
      </div>

      <ul className="min-h-0 flex-1 overflow-y-auto p-1">
        {filtered.length === 0 ? (
          <li className="px-2 py-6 text-center text-[11px] text-so-muted">
            {board.status === 'connecting' ? '심볼 로딩 중…' : '검색 결과 없음'}
          </li>
        ) : (
          filtered.map((sp) => {
            const t = board.tickers.find((tt) => tt.symbol === sp.symbol)
            const isActive = sp.symbol === board.activeSymbol
            const key = `${activeMarket}:${sp.symbol}`
            const fav = favorites.has(key)
            const positive = (t?.changePct ?? 0) >= 0
            return (
              <li key={sp.symbol}>
                <button
                  type="button"
                  onClick={() => setActiveSymbol(activeMarket, sp.symbol)}
                  className={[
                    'group flex w-full items-center gap-2 rounded-md px-1.5 py-1.5 text-left text-[12px] transition-colors focus:outline-none',
                    isActive
                      ? 'bg-so-accent/15 text-so-text ring-1 ring-so-accent/35'
                      : 'text-so-text hover:bg-so-surface-2',
                  ].join(' ')}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      toggleFav(sp.symbol)
                    }}
                    className={[
                      'grid h-5 w-5 shrink-0 place-items-center rounded text-[11px]',
                      fav
                        ? 'bg-so-accent/20 text-so-accent'
                        : 'text-so-muted hover:text-so-text',
                    ].join(' ')}
                    aria-label={fav ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                    title={fav ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                  >
                    {fav ? '★' : '☆'}
                  </button>
                  <span className="flex min-w-0 flex-1 flex-col leading-tight">
                    <span className="truncate font-medium">{sp.displayName}</span>
                    <span className="truncate text-[10px] text-so-muted">{sp.symbol}</span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end leading-tight">
                    <span className="tabular-nums text-[11px] text-so-text">
                      {t ? formatPrice(t.price, sp.priceDecimals) : formatPrice(sp.referencePrice, sp.priceDecimals)}
                    </span>
                    <span
                      className={`tabular-nums text-[10px] ${positive ? 'text-so-bid' : 'text-so-ask'}`}
                    >
                      {t ? formatPct(t.changePct) : '0.00%'}
                    </span>
                  </span>
                </button>
              </li>
            )
          })
        )}
      </ul>
    </nav>
  )
}

function readFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(FAV_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return new Set()
    const next = new Set<string>()
    for (const v of parsed) {
      if (typeof v === 'string') next.add(v)
    }
    return next
  } catch {
    return new Set()
  }
}
