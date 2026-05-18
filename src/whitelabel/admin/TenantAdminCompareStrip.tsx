import { resolveWhitelabelPreset } from '../tenantPresetRegistry'
import type { TenantAdminFormState } from '../customTenantModel'
import type { TenantWhitelabelPreset } from '../tenantPresetTypes'

type Props = {
  form: TenantAdminFormState
  sourcePresetId: string
  draftPreset: TenantWhitelabelPreset
  isCustom: boolean
}

function Chip({ label, value, changed }: { label: string; value: string; changed?: boolean }) {
  return (
    <span
      className={`rounded border px-1.5 py-0.5 font-mono text-[8px] ${
        changed
          ? 'border-amber-500/50 bg-amber-500/10 text-amber-200'
          : 'border-so-border/50 bg-so-bg/40 text-so-muted'
      }`}
      title={label}
    >
      {value}
    </span>
  )
}

export function TenantAdminCompareStrip({ form, sourcePresetId, draftPreset, isCustom }: Props) {
  const source = resolveWhitelabelPreset(sourcePresetId)

  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-lg border border-so-border/50 bg-so-bg/50 px-2 py-2"
      data-testid="tenant-admin-compare-strip"
    >
      <span className="text-[9px] font-semibold uppercase tracking-wide text-so-muted">
        Compare
      </span>
      <Chip label="source" value={sourcePresetId} />
      <Chip
        label="brand"
        value={form.brandName}
        changed={form.brandName !== source.brandName}
      />
      <Chip
        label="accent"
        value={form.accentColor}
        changed={form.accentColor !== source.theme.colors.accent}
      />
      <Chip label="admin" value={form.admin} changed={form.admin !== source.admin} />
      <Chip label="menu" value={form.menu} changed={form.menu !== source.menu} />
      <Chip
        label="sidebar"
        value={form.layout.sidebarWidth}
        changed={form.layout.sidebarWidth !== source.layout.sidebarWidth}
      />
      <Chip
        label="grid"
        value={form.layout.gridDensity}
        changed={form.layout.gridDensity !== source.layout.gridDensity}
      />
      {isCustom ? (
        <span className="rounded bg-violet-500/15 px-1.5 py-0.5 text-[8px] font-bold uppercase text-violet-300">
          custom · {draftPreset.id}
        </span>
      ) : (
        <span className="text-[8px] text-so-muted">built-in (save → custom copy)</span>
      )}
    </div>
  )
}
