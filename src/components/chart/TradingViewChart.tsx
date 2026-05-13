import { useEffect, useId, useRef, useState } from 'react'
import type { SymbolSpec } from '../../core/symbols/SymbolSpec'
import { formatPct, formatPrice } from '../../core/utils/format'

let scriptPromise: Promise<void> | null = null

function loadTradingViewScript(): Promise<void> {
  if (typeof window !== 'undefined' && (window as unknown as { TradingView?: unknown }).TradingView) {
    return Promise.resolve()
  }
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://s3.tradingview.com/tv.js'
      s.async = true
      s.onload = () => resolve()
      s.onerror = () => reject(new Error('Failed to load TradingView script'))
      document.head.appendChild(s)
    })
  }
  return scriptPromise
}

type TvWidget = { remove?: () => void; resize?: () => void }

type Props = {
  spec: SymbolSpec | undefined
  lastPrice: number
  changePct: number
}

type ChartState = 'loading' | 'ready' | 'error'

function tvSymbolFor(spec: SymbolSpec | undefined): string {
  if (!spec) return 'BINANCE:BTCUSDT'
  if (spec.tvSymbol && spec.tvSymbol.trim()) return spec.tvSymbol
  return spec.symbol
}

/**
 * 공통 TradingView 차트 — 6개 시장 모두 동일 컴포넌트.
 * - 심볼/카테고리 차이는 SymbolSpec.tvSymbol 로만 표현 (config 기반)
 * - 네트워크 차단/스크립트 실패 시 fallback placeholder (라스트 프라이스 큰 폰트)
 */
export function TradingViewChart({ spec, lastPrice, changePct }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<TvWidget | null>(null)
  const containerId = `tv_chart_${useId().replace(/:/g, '')}`
  const [state, setState] = useState<ChartState>('loading')
  const tvSymbol = tvSymbolFor(spec)

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    let cancelled = false
    widgetRef.current = null
    setState('loading')
    wrap.innerHTML = `<div id="${containerId}" class="h-full w-full min-h-[200px]"></div>`

    loadTradingViewScript()
      .then(() => {
        if (cancelled) return
        const TV = (window as unknown as { TradingView?: { widget: new (o: object) => TvWidget } }).TradingView
        if (!TV?.widget) {
          setState('error')
          return
        }
        const w = new TV.widget({
          autosize: true,
          symbol: tvSymbol,
          interval: '15',
          timezone: 'Asia/Seoul',
          theme: 'dark',
          style: '1',
          locale: 'kr',
          toolbar_bg: '#0b0e11',
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          container_id: containerId,
          studies_overrides: {},
        }) as TvWidget
        widgetRef.current = w
        if (!cancelled) setState('ready')
      })
      .catch(() => {
        if (cancelled || !wrap) return
        setState('error')
      })

    return () => {
      cancelled = true
      try {
        widgetRef.current?.remove?.()
      } catch {
        /* ignore */
      }
      widgetRef.current = null
      if (wrap) wrap.innerHTML = ''
    }
  }, [tvSymbol, containerId])

  useEffect(() => {
    if (state !== 'ready') return
    const wrap = wrapRef.current
    if (!wrap || typeof ResizeObserver === 'undefined') return
    const bump = () => {
      window.dispatchEvent(new Event('resize'))
      try {
        widgetRef.current?.resize?.()
      } catch {
        /* older embeds */
      }
    }
    bump()
    const ro = new ResizeObserver(() => window.requestAnimationFrame(bump))
    ro.observe(wrap)
    window.addEventListener('orientationchange', bump)
    return () => {
      ro.disconnect()
      window.removeEventListener('orientationchange', bump)
    }
  }, [state, tvSymbol])

  const positive = changePct >= 0
  const priceDecimals = spec?.priceDecimals ?? 2

  return (
    <section
      className="relative flex min-h-0 flex-1 flex-col overflow-hidden border-so-border bg-so-surface"
      aria-label="Chart"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-so-border bg-so-surface-2 px-3 py-1.5">
        <div className="flex items-center gap-2 text-[12px]">
          <h2 className="font-semibold text-so-text">차트</h2>
          <span className="text-so-muted">{spec?.displayName ?? ''}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="tabular-nums font-semibold text-so-text">
            {formatPrice(lastPrice, priceDecimals)}
          </span>
          <span
            className={`rounded px-1.5 py-0.5 font-semibold ${
              positive ? 'bg-so-bid/15 text-so-bid' : 'bg-so-ask/15 text-so-ask'
            }`}
          >
            {formatPct(changePct)}
          </span>
          <span className="hidden rounded bg-so-bg/60 px-1.5 py-0.5 font-mono text-[10px] text-so-muted lg:inline">
            {tvSymbol}
          </span>
        </div>
      </div>

      <div className="relative min-h-0 w-full flex-1">
        <div ref={wrapRef} className="absolute inset-0 h-full w-full" />
        {state === 'loading' && (
          <div className="pointer-events-none absolute inset-0 z-[2] flex flex-col items-center justify-center gap-3 bg-so-bg/90">
            <div
              className="h-9 w-9 animate-spin rounded-full border-2 border-so-border border-t-so-accent"
              aria-hidden
            />
            <span className="text-xs font-medium text-so-muted">차트 로딩…</span>
          </div>
        )}
        {state === 'error' && (
          <div className="pointer-events-none absolute inset-0 z-[2] flex flex-col items-center justify-center gap-2 bg-so-bg/85 p-4 text-center">
            <div className="text-[28px] font-bold tabular-nums">
              {formatPrice(lastPrice, priceDecimals)}
            </div>
            <div className={`text-[12px] font-semibold ${positive ? 'text-so-bid' : 'text-so-ask'}`}>
              {formatPct(changePct)} ({spec?.quoteCurrency})
            </div>
            <p className="max-w-md text-xs text-so-muted">
              TradingView 차트 스크립트 차단됨 — mock 라스트 프라이스만 표시.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
