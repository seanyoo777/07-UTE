import type { ReactNode } from 'react'

type Props = {
  title: string
  subtitle?: string
  children?: ReactNode
  /** 카드 상단 강조 라인 */
  accent?: 'accent' | 'bid' | 'ask' | 'muted'
}

const ACCENT: Record<NonNullable<Props['accent']>, string> = {
  accent: 'from-so-accent/40 via-so-accent-2/25 to-transparent',
  bid: 'from-so-bid/35 via-so-bid/10 to-transparent',
  ask: 'from-so-ask/35 via-so-ask/10 to-transparent',
  muted: 'from-so-border-2/60 via-so-border/20 to-transparent',
}

/**
 * Premium shell용 카드 뼈대 — 내용은 mock·스냅샷 요약만.
 */
export function UteShellPlaceholderCard({ title, subtitle, children, accent = 'muted' }: Props) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-so-border-2/60 bg-so-bg/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r ${ACCENT[accent]}`} />
      <div className="px-2.5 py-2">
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-so-text">{title}</span>
          {subtitle ? (
            <span className="shrink-0 text-[8px] font-medium uppercase text-so-muted">{subtitle}</span>
          ) : null}
        </div>
        {children ? <div className="text-[10px] leading-snug text-so-muted">{children}</div> : null}
      </div>
    </div>
  )
}
