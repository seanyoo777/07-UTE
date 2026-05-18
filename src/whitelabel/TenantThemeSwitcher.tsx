import { listWhitelabelPresetIds } from './tenantPresetRegistry'
import { useTenantWhitelabelStore } from './tenantWhitelabelStore'

const PRESET_LABELS: Record<string, string> = {
  goldx: 'GOLDX',
  bluetrade: 'BLUETRADE',
  'prime-futures': 'PRIME FUTURES',
}

export function TenantThemeSwitcher() {
  const activePresetId = useTenantWhitelabelStore((s) => s.activePresetId)
  const setActivePresetId = useTenantWhitelabelStore((s) => s.setActivePresetId)
  const ids = listWhitelabelPresetIds()

  return (
    <label className="flex flex-col items-end gap-0.5">
      <span className="text-[9px] font-medium uppercase tracking-wide text-so-muted">
        White-label (mock)
      </span>
      <select
        value={activePresetId}
        onChange={(e) => setActivePresetId(e.target.value)}
        className="max-w-[10rem] rounded-md border border-so-border/60 bg-so-bg/80 px-2 py-1 text-[10px] text-so-fg"
        title="Runtime theme preset — localStorage only, no API"
        aria-label="White-label theme preset"
      >
        {ids.map((id) => (
          <option key={id} value={id}>
            {PRESET_LABELS[id] ?? id}
          </option>
        ))}
      </select>
    </label>
  )
}
