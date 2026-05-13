import type { ReactNode } from 'react'

export type IntegrationSource = '05-SpeedOrder' | '02-TGX-CEX' | '03-OneAI' | '04-MockInvest' | '06-League' | 'custom'

type Props = {
  /** 누구의 어떤 모듈을 이 자리에 끼울지 */
  source: IntegrationSource
  /** 통합 대상 모듈 이름 (예: 'SpeedOrderPanel', 'OrderBookPanel') */
  module: string
  /** 통합 진행 상태 */
  state?: 'planned' | 'in-progress' | 'integrated'
  /** 통합 단계 코멘트 1줄 */
  note?: string
  /** 우측 상단 코너 배지만 렌더링 (기본 true). false 시 배지 없음 */
  showBadge?: boolean
  /** 현재 들어 있는 placeholder/임시 구현물 */
  children: ReactNode
}

const STATE_LABEL: Record<NonNullable<Props['state']>, string> = {
  planned: '통합 예정',
  'in-progress': '통합 중',
  integrated: '통합 완료',
}

const STATE_TONE: Record<NonNullable<Props['state']>, string> = {
  planned: 'border-so-accent/40 bg-so-accent/15 text-so-accent',
  'in-progress': 'border-so-warn/40 bg-so-warn/15 text-so-warn',
  integrated: 'border-so-bid/40 bg-so-bid/15 text-so-bid',
}

/**
 * 통합 슬롯 마커.
 *
 * 7번은 최종 통합 플랫폼이며, 각 트레이딩 모듈은 5번(SpeedOrder)에서 만들고
 * 2번(TGX-CEX)에서 검증한 뒤 이 자리에 끼워 넣는다.
 *
 * 이 컴포넌트는 현재 들어 있는 임시 placeholder/mock 구현 위에
 * "이 자리는 5번에서 가져올 예정" 표시를 한다.
 *
 * - children: 임시 구현물 (현재 mock UI). 통합 완료되면 children만 교체하면 됨.
 * - 외형은 children 의 박스 위에 우측 상단 작은 배지 1개만 띄움 (기존 UI 영향 없음).
 */
export function IntegrationSlot({
  source,
  module,
  state = 'planned',
  note,
  showBadge = true,
  children,
}: Props) {
  return (
    <div className="relative flex h-full min-h-0 min-w-0 flex-col">
      {showBadge ? (
        <div
          className={`pointer-events-none absolute right-1.5 top-1.5 z-[3] flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider backdrop-blur-sm ${STATE_TONE[state]}`}
          title={`${source} · ${module} · ${STATE_LABEL[state]}${note ? ` — ${note}` : ''}`}
        >
          <span>{source}</span>
          <span className="opacity-60">·</span>
          <span>{STATE_LABEL[state]}</span>
        </div>
      ) : null}
      {children}
    </div>
  )
}

/**
 * 슬롯 안에 들어가는 임시 placeholder.
 * children 자체가 통합 대기 자리임을 더 명확히 보여주고 싶을 때 사용.
 */
export function IntegrationSlotPlaceholder({
  source,
  module,
  description,
}: {
  source: IntegrationSource
  module: string
  description?: string
}) {
  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-so-border-2 bg-so-surface-2/40 p-6 text-center">
      <div className="rounded-full border border-so-accent/40 bg-so-accent/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-so-accent">
        통합 슬롯
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-[14px] font-semibold text-so-text">{module}</h3>
        <span className="font-mono text-[11px] text-so-muted">{source}</span>
      </div>
      {description ? (
        <p className="max-w-sm text-[11px] leading-relaxed text-so-muted">{description}</p>
      ) : null}
      <p className="text-[10px] text-so-muted/80">
        이 자리는 5번 SpeedOrder에서 만들고 2번 TGX-CEX에서 검증한 뒤 7번에 통합됩니다.
      </p>
    </div>
  )
}
