import type { BrandSummaryModel } from './whitelabelPreviewTypes'

type Props = {
  summary: BrandSummaryModel
}

export function BrandSummaryCard({ summary }: Props) {
  const { layoutPreset } = summary
  return (
    <div className="rounded-lg border border-so-border/60 bg-so-surface/40 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-so-muted">Brand summary</p>
      <div className="mt-2 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-md border border-so-border/50 text-[9px] font-bold"
          style={{
            color: summary.primaryColor,
            borderColor: `${summary.primaryColor}66`,
            background: `${summary.primaryColor}14`,
          }}
        >
          {summary.logoText.slice(0, 2)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-so-fg">{summary.logoText}</p>
          <div className="mt-1 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 text-[9px] text-so-muted">
              primary
              <span
                className="inline-block h-3 w-3 rounded-sm border border-so-border/40"
                style={{ background: summary.primaryColor }}
              />
              <span className="font-mono text-so-fg">{summary.primaryColor}</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[9px] text-so-muted">
              accent
              <span
                className="inline-block h-3 w-3 rounded-sm border border-so-border/40"
                style={{ background: summary.accentColor }}
              />
              <span className="font-mono text-so-fg">{summary.accentColor}</span>
            </span>
          </div>
        </div>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-[9px] sm:grid-cols-3">
        <div>
          <dt className="text-so-muted">menu</dt>
          <dd className="font-mono text-so-fg">{summary.menuPreset}</dd>
        </div>
        <div>
          <dt className="text-so-muted">admin</dt>
          <dd className="font-mono text-so-fg">{summary.adminPreset}</dd>
        </div>
        <div>
          <dt className="text-so-muted">sidebar</dt>
          <dd className="font-mono text-so-fg">{layoutPreset.sidebarWidth}</dd>
        </div>
        <div>
          <dt className="text-so-muted">topbar</dt>
          <dd className="font-mono text-so-fg">{layoutPreset.topbarStyle}</dd>
        </div>
        <div>
          <dt className="text-so-muted">cards</dt>
          <dd className="font-mono text-so-fg">{layoutPreset.cardLayout}</dd>
        </div>
        <div>
          <dt className="text-so-muted">grid</dt>
          <dd className="font-mono text-so-fg">{layoutPreset.gridDensity}</dd>
        </div>
      </dl>
    </div>
  )
}
