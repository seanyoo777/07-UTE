import type { LayoutModeBannerCopy } from '../../config/layoutUiGuards'

type Props = {
  copy: LayoutModeBannerCopy
}

const TONE_CLASS: Record<LayoutModeBannerCopy['tone'], string> = {
  readonly: 'border-so-accent/40 bg-so-accent/10 text-so-accent',
  emergency: 'border-so-warn/40 bg-so-warn/10 text-so-warn',
  both: 'border-so-ask/40 bg-so-ask/10 text-so-ask',
}

export function LayoutModeBanner({ copy }: Props) {
  if (!copy.show) return null

  return (
    <div
      role="status"
      className={`shrink-0 border-b px-3 py-1.5 text-[11px] ${TONE_CLASS[copy.tone]}`}
    >
      <span className="font-semibold">{copy.title}</span>
      <span className="ml-2 opacity-90">{copy.detail}</span>
    </div>
  )
}
