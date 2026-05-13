import type { CategoryConfig } from '../../config/categoryConfig'

/**
 * 시장 상태 배지 — 카테고리 config 의 sessionLabel 을 기반.
 * mock 단계에서는 정적 라벨만 노출. (실제 장중/장외 게이트는 다음 단계)
 */
export function MarketStateBadge({ config }: { config: CategoryConfig }) {
  if (!config.hasMarketSession) {
    return (
      <span className="shrink-0 rounded-md bg-so-bid/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-so-bid">
        24/7 OPEN
      </span>
    )
  }
  return (
    <span
      className="shrink-0 rounded-md border border-so-border bg-so-surface-2 px-2 py-1 text-[10px] text-so-muted"
      title={config.sessionLabel}
    >
      <span className="mr-1 font-semibold text-so-text">세션</span>
      <span className="text-[10px]">{config.sessionLabel}</span>
    </span>
  )
}
