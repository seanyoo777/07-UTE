import type { AdminSkinPreviewCardModel } from './whitelabelPreviewTypes'

type Props = {
  skins: AdminSkinPreviewCardModel[]
}

export function AdminSkinPreview({ skins }: Props) {
  return (
    <div className="rounded-lg border border-so-border/60 bg-so-surface/40 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-so-muted">
        Admin skin preview
      </p>
      <p className="mt-0.5 text-[9px] text-so-muted">Mock admin chrome — no live RBAC skin API</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {skins.map((skin) => (
          <div
            key={skin.skinId}
            className={`overflow-hidden rounded-lg border ${
              skin.isActive
                ? 'border-so-accent/60 ring-1 ring-so-accent/30'
                : 'border-so-border/50'
            }`}
            data-ute-admin-skin={skin.skinId}
            data-active={skin.isActive ? 'true' : 'false'}
          >
            <div className={`p-2 ${skin.shellClass}`}>
              <div className="flex items-center justify-between gap-1 border-b border-so-border/40 pb-1.5">
                <span className="text-[8px] font-semibold uppercase text-so-muted">Admin</span>
                {skin.isActive ? (
                  <span className="rounded bg-so-accent/20 px-1 text-[7px] font-bold text-so-accent">
                    LIVE
                  </span>
                ) : null}
              </div>
              <div className="mt-2 space-y-1">
                <div className="h-1.5 w-3/4 rounded bg-so-border/50" />
                <div className="grid grid-cols-2 gap-1">
                  <div className="h-6 rounded border border-so-border/30 bg-so-surface/40" />
                  <div className="h-6 rounded border border-so-border/30 bg-so-surface/40" />
                </div>
                <div className="h-4 rounded border border-so-border/20 bg-so-bg/40" />
              </div>
            </div>
            <p className="border-t border-so-border/40 bg-so-bg/80 px-2 py-1 text-[9px] font-medium text-so-fg">
              {skin.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
