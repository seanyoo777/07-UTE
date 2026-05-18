import type { LayoutPreviewModel } from './whitelabelPreviewTypes'
import {
  CARD_LAYOUT_LABEL,
  GRID_DENSITY_LABEL,
  SIDEBAR_WIDTH_LABEL,
  SIDEBAR_WIDTH_VISUAL,
  TOPBAR_STYLE_LABEL,
} from './layoutPreviewLabels'

type Props = {
  layout: LayoutPreviewModel
}

function TopbarMini({ style }: { style: LayoutPreviewModel['topbarStyle'] }) {
  const cls =
    style === 'glass'
      ? 'border border-so-border/30 bg-so-surface/50 backdrop-blur-sm'
      : style === 'elevated'
        ? 'border border-so-border bg-so-surface shadow-sm'
        : 'border-b border-so-border/60 bg-so-surface/80'
  return <div className={`h-2 w-full rounded-sm ${cls}`} title={TOPBAR_STYLE_LABEL[style]} />
}

function CardMini({ layout }: { layout: LayoutPreviewModel['cardLayout'] }) {
  const cls =
    layout === 'elevated'
      ? 'border border-so-border/50 bg-so-surface shadow-md'
      : layout === 'bordered'
        ? 'border-2 border-so-border bg-so-bg/80'
        : 'bg-so-surface/60'
  return (
    <div
      className={`h-8 flex-1 rounded-sm ${cls}`}
      title={CARD_LAYOUT_LABEL[layout]}
    />
  )
}

function GridMini({ density }: { density: LayoutPreviewModel['gridDensity'] }) {
  const gap = density === 'dense' ? 'gap-0.5' : density === 'spacious' ? 'gap-2' : 'gap-1'
  return (
    <div className={`flex ${gap}`} title={GRID_DENSITY_LABEL[density]}>
      <div className="h-6 w-3 rounded-sm bg-so-border/40" />
      <div className="h-6 w-3 rounded-sm bg-so-border/40" />
      <div className="h-6 w-3 rounded-sm bg-so-border/40" />
    </div>
  )
}

export function LayoutPreviewStrip({ layout }: Props) {
  return (
    <div className="rounded-lg border border-so-border/60 bg-so-surface/40 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-so-muted">Layout preview</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-so-border/40 bg-so-bg/50 p-2">
          <p className="text-[9px] text-so-muted">Sidebar width</p>
          <p className="mt-0.5 text-[10px] font-medium text-so-fg">{SIDEBAR_WIDTH_LABEL[layout.sidebarWidth]}</p>
          <div className="mt-2 flex h-10 items-stretch gap-1 rounded border border-so-border/30 bg-so-bg/60 p-1">
            <div
              className={`shrink-0 rounded-sm bg-so-accent/30 ${SIDEBAR_WIDTH_VISUAL[layout.sidebarWidth]}`}
            />
            <div className="min-w-0 flex-1 rounded-sm bg-so-border/20" />
          </div>
        </div>
        <div className="rounded-md border border-so-border/40 bg-so-bg/50 p-2">
          <p className="text-[9px] text-so-muted">Topbar style</p>
          <p className="mt-0.5 text-[10px] font-medium text-so-fg">{TOPBAR_STYLE_LABEL[layout.topbarStyle]}</p>
          <div className="mt-2 space-y-1 rounded border border-so-border/30 bg-so-bg/60 p-2">
            <TopbarMini style={layout.topbarStyle} />
            <div className="h-4 rounded-sm bg-so-border/15" />
          </div>
        </div>
        <div className="rounded-md border border-so-border/40 bg-so-bg/50 p-2">
          <p className="text-[9px] text-so-muted">Card layout</p>
          <p className="mt-0.5 text-[10px] font-medium text-so-fg">{CARD_LAYOUT_LABEL[layout.cardLayout]}</p>
          <div className="mt-2 flex gap-1">
            <CardMini layout={layout.cardLayout} />
            <CardMini layout={layout.cardLayout} />
          </div>
        </div>
        <div className="rounded-md border border-so-border/40 bg-so-bg/50 p-2">
          <p className="text-[9px] text-so-muted">Grid density</p>
          <p className="mt-0.5 text-[10px] font-medium text-so-fg">{GRID_DENSITY_LABEL[layout.gridDensity]}</p>
          <div className="mt-2 flex justify-center">
            <GridMini density={layout.gridDensity} />
          </div>
        </div>
      </div>
    </div>
  )
}
