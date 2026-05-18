import { shouldEnableWhitelabelPresets } from '../config/layoutUiGuards'
import { useEffectiveLayoutFlags } from '../hooks/useEffectiveLayoutFlags'
import { loadActivePresetIdFromConfig } from './activeConfigStorage'
import { useCustomTenantStore } from './customTenantStore'
import { CUSTOM_TENANTS_STORAGE_KEY } from './customTenantTypes'
import { buildWhitelabelPreviewBundle } from './preview/buildWhitelabelPreviewModel'
import { isCustomPresetId } from './tenantPresetRegistry'
import { useTenantWhitelabelStore } from './tenantWhitelabelStore'
import { validateTenantPreset } from './validateTenantPreset'

export function WhitelabelDiagnosticsSection() {
  const layoutFlags = useEffectiveLayoutFlags()
  const preset = useTenantWhitelabelStore((s) => s.preset)
  const hydrated = useTenantWhitelabelStore((s) => s.hydrated)
  const previewing = useTenantWhitelabelStore((s) => s.previewing)
  const customCount = useCustomTenantStore((s) => s.tenants.length)
  if (!shouldEnableWhitelabelPresets(layoutFlags)) return null

  const validation = validateTenantPreset(preset)
  const preview = buildWhitelabelPreviewBundle(preset)
  const d = preview.diagnostics
  const activeConfigId =
    typeof window !== 'undefined' ? loadActivePresetIdFromConfig() : null

  return (
    <div
      className="rounded-md border border-so-border/50 bg-so-bg/60 p-2 text-[10px]"
      data-testid="whitelabel-diagnostics"
    >
      <p className="font-semibold text-so-fg">White-label preset (mock)</p>
      <p className="mt-1 text-so-muted">
        selected tenant{' '}
        <span className="font-mono text-so-fg">{d.selectedTenantId}</span> · {d.selectedBrandName}
      </p>
      <p className="text-so-muted">
        active preset <span className="font-mono text-so-fg">{preset.id}</span> · menu{' '}
        <span className="font-mono text-so-fg">{preset.menu}</span>
      </p>
      <p className="text-so-muted">
        admin skin <span className="font-mono text-so-fg">{d.currentAdminSkin}</span> · layout{' '}
        <span className="font-mono text-so-fg">{d.layoutSummary}</span>
      </p>
      <p className="text-so-muted">
        menu order <span className="font-mono text-so-fg">{d.menuVisibleOrder}</span>
      </p>
      <p className="text-so-muted">
        theme persisted={d.themePersisted ? 'yes' : 'no'} · invalid fallback →{' '}
        <span className="font-mono text-so-fg">{d.invalidFallbackDefaultId}</span>
      </p>
      <p className="text-so-muted">
        hydrated={hydrated ? 'yes' : 'no'} · valid={validation.ok ? 'yes' : 'no'} · preview=
        {previewing ? 'live' : 'off'}
      </p>
      <p className="text-so-muted">
        custom tenants={customCount} · active config{' '}
        <span className="font-mono text-so-fg">{activeConfigId ?? '—'}</span>
        {isCustomPresetId(preset.id) ? ' · custom active' : ''}
      </p>
      <p className="text-[9px] text-so-muted/80">
        storage: {CUSTOM_TENANTS_STORAGE_KEY} · ute.whitelabel.active_config_v1
      </p>
    </div>
  )
}
