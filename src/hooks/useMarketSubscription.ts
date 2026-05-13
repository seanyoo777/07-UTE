import { useEffect } from 'react'
import { ADAPTERS } from '../adapters'
import type { MarketId } from '../markets/types'
import { useTradingStore } from '../store/tradingStore'

/**
 * 시장(어댑터)별 1회 connect + 시장 데이터 구독.
 * - 어댑터의 listSymbols로 보드 부팅
 * - 활성 심볼 변경 시 구독 재설정
 */
export function useMarketSubscription(marketId: MarketId): void {
  const activeSymbol = useTradingStore((s) => s.boards[marketId]?.activeSymbol)
  const setAdapterStatus = useTradingStore((s) => s.setAdapterStatus)
  const setBoardSymbols = useTradingStore((s) => s.setBoardSymbols)
  const applyTickerPatch = useTradingStore((s) => s.applyTickerPatch)
  const applyOrderBook = useTradingStore((s) => s.applyOrderBook)
  const pushFill = useTradingStore((s) => s.pushFill)

  useEffect(() => {
    const adapter = ADAPTERS[marketId]
    if (!adapter) return
    let cancelled = false
    setAdapterStatus(marketId, 'connecting')
    void (async () => {
      try {
        await adapter.connect()
        const symbols = await adapter.listSymbols()
        if (cancelled) return
        setBoardSymbols(marketId, symbols)
        setAdapterStatus(marketId, 'ready')
      } catch (err) {
        setAdapterStatus(
          marketId,
          'error',
          err instanceof Error ? err.message : 'connect failed',
        )
      }
    })()
    return () => {
      cancelled = true
    }
  }, [marketId, setAdapterStatus, setBoardSymbols])

  useEffect(() => {
    const adapter = ADAPTERS[marketId]
    if (!adapter || !activeSymbol) return
    const unsub = adapter.subscribe(activeSymbol, {
      onTicker: (t) => applyTickerPatch(marketId, t.symbol, { price: t.price, changePct: t.changePct }),
      onOrderBook: (book) => applyOrderBook(marketId, book),
      onTrade: (fill) => pushFill(marketId, fill),
    })
    return () => {
      unsub()
    }
  }, [marketId, activeSymbol, applyTickerPatch, applyOrderBook, pushFill])
}
