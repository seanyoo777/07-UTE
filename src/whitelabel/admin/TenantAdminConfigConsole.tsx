import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { PlatformMockOnlyBadge } from '../../platform/PlatformMockOnlyBadge'
import type { PlatformNavId } from '../../platform/platformShellConfig'
import { useCustomTenantStore } from '../customTenantStore'
import {
  applyFormToPreset,
  formDriftsFromPreset,
  formStateFromPreset,
  navMappingFromForm,
  resetFormToSourcePreset,
  type TenantAdminFormState,
} from '../customTenantModel'
import { AdminSkinPreview } from '../preview/AdminSkinPreview'
import { BrandSummaryCard } from '../preview/BrandSummaryCard'
import { buildWhitelabelPreviewBundle } from '../preview/buildWhitelabelPreviewModel'
import { LayoutPreviewStrip } from '../preview/LayoutPreviewStrip'
import { MenuOrderPreview } from '../preview/MenuOrderPreview'
import { buildBrandSummary } from '../preview/whitelabelPreviewTypes'
import {
  DEFAULT_WHITELABEL_PRESET_ID,
  isBuiltinPresetId,
  isCustomPresetId,
  listBuiltinPresetIds,
  resolveWhitelabelPreset,
} from '../tenantPresetRegistry'
import { useTenantWhitelabelStore } from '../tenantWhitelabelStore'
import {
  TENANT_ADMIN_PRESET_IDS,
  TENANT_MENU_PRESET_IDS,
  type TenantAdminPresetId,
  type TenantMenuPresetId,
} from '../tenantPresetTypes'
import { TenantAdminCompareStrip } from './TenantAdminCompareStrip'

const NAV_IDS: PlatformNavId[] = ['trading', 'admin', 'diagnostics']
const LAYOUT_SIDEBAR = ['narrow', 'standard', 'wide'] as const
const LAYOUT_TOPBAR = ['flat', 'elevated', 'glass'] as const
const LAYOUT_CARD = ['flat', 'bordered', 'elevated'] as const
const LAYOUT_GRID = ['dense', 'standard', 'spacious'] as const
const SPACING_OPTIONS = ['compact', 'comfortable', 'airy'] as const

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-so-muted">
      {children}
    </label>
  )
}

function SelectField<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: readonly T[]
  onChange: (v: T) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="w-full rounded border border-so-border/60 bg-so-bg/80 px-2 py-1.5 text-[11px] text-so-fg"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}

/**
 * Operator mock console — create / edit / clone custom tenants (localStorage only).
 */
export function TenantAdminConfigConsole() {
  const customTenants = useCustomTenantStore((s) => s.tenants)
  const hydrateCustom = useCustomTenantStore((s) => s.hydrateFromStorage)
  const saveCustom = useCustomTenantStore((s) => s.saveTenant)
  const deleteCustom = useCustomTenantStore((s) => s.deleteTenant)
  const clonePreset = useCustomTenantStore((s) => s.cloneFromPreset)

  const activePresetId = useTenantWhitelabelStore((s) => s.activePresetId)
  const setActivePresetId = useTenantWhitelabelStore((s) => s.setActivePresetId)
  const previewPreset = useTenantWhitelabelStore((s) => s.previewPreset)
  const cancelPreview = useTenantWhitelabelStore((s) => s.cancelPreview)
  const previewing = useTenantWhitelabelStore((s) => s.previewing)

  const [selectedId, setSelectedId] = useState<string>(activePresetId)
  const [sourcePresetId, setSourcePresetId] = useState<string>(
    isBuiltinPresetId(activePresetId) ? activePresetId : 'bluetrade',
  )
  const [form, setForm] = useState<TenantAdminFormState>(() =>
    formStateFromPreset(resolveWhitelabelPreset(activePresetId)),
  )
  const [status, setStatus] = useState<string | null>(null)

  const builtinIds = useMemo(() => listBuiltinPresetIds(), [])
  const allIds = useMemo(
    () => [...builtinIds, ...customTenants.map((t) => t.id)],
    [builtinIds, customTenants],
  )

  const draftPreset = useMemo(() => {
    const base = resolveWhitelabelPreset(selectedId)
    return applyFormToPreset(base, form, isCustomPresetId(selectedId) ? selectedId : undefined)
  }, [form, selectedId])

  const navMapping = useMemo(() => navMappingFromForm(form), [form])

  const previewBundle = useMemo(
    () => ({
      ...buildWhitelabelPreviewBundle(draftPreset),
      brandSummary: buildBrandSummary(draftPreset),
      menuPreview: buildWhitelabelPreviewBundle(draftPreset).menuPreview,
    }),
    [draftPreset],
  )

  useEffect(() => {
    hydrateCustom()
  }, [hydrateCustom])

  const pushPreview = useCallback(
    (nextForm: TenantAdminFormState) => {
      const base = resolveWhitelabelPreset(selectedId)
      const preset = applyFormToPreset(
        base,
        nextForm,
        isCustomPresetId(selectedId) ? selectedId : undefined,
      )
      previewPreset(preset, navMappingFromForm(nextForm))
    },
    [previewPreset, selectedId],
  )

  const updateForm = useCallback(
    (patch: Partial<TenantAdminFormState>) => {
      setForm((prev) => {
        const next = { ...prev, ...patch }
        pushPreview(next)
        return next
      })
    },
    [pushPreview],
  )

  const updateLayout = useCallback(
    (patch: Partial<TenantAdminFormState['layout']>) => {
      setForm((prev) => {
        const next = { ...prev, layout: { ...prev.layout, ...patch } }
        pushPreview(next)
        return next
      })
    },
    [pushPreview],
  )

  const selectTenant = useCallback(
    (id: string) => {
      const preset = resolveWhitelabelPreset(id)
      const custom = customTenants.find((t) => t.id === id)
      const nextForm = formStateFromPreset(preset, custom?.navOverrides ?? null)
      setSelectedId(id)
      setSourcePresetId(custom?.sourcePresetId ?? (isBuiltinPresetId(id) ? id : 'bluetrade'))
      setForm(nextForm)
      pushPreview(nextForm)
      setStatus(null)
    },
    [customTenants, pushPreview],
  )

  useEffect(() => {
    pushPreview(form)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- live preview on mount
  }, [])

  useEffect(() => {
    return () => {
      if (useTenantWhitelabelStore.getState().previewing) {
        cancelPreview()
      }
    }
  }, [cancelPreview])

  const onMenuPresetChange = (menu: TenantMenuPresetId) => {
    const mapping = formStateFromPreset({ ...draftPreset, menu }, null)
    updateForm({
      menu,
      navOrder: mapping.navOrder,
      emphasizedNavIds: mapping.emphasizedNavIds,
      hideNavIds: mapping.hideNavIds,
    })
  }

  const toggleNavList = (
    key: 'emphasizedNavIds' | 'hideNavIds',
    navId: PlatformNavId,
  ) => {
    setForm((prev) => {
      const list = prev[key]
      const next = list.includes(navId) ? list.filter((id) => id !== navId) : [...list, navId]
      const merged = { ...prev, [key]: next }
      pushPreview(merged)
      return merged
    })
  }

  const moveNav = (navId: PlatformNavId, dir: -1 | 1) => {
    setForm((prev) => {
      const order = [...prev.navOrder]
      const idx = order.indexOf(navId)
      if (idx < 0) return prev
      const swap = idx + dir
      if (swap < 0 || swap >= order.length) return prev
      ;[order[idx], order[swap]] = [order[swap]!, order[idx]!]
      const next = { ...prev, navOrder: order }
      pushPreview(next)
      return next
    })
  }

  const onSave = () => {
    const record = saveCustom(
      form,
      isCustomPresetId(selectedId) ? selectedId : null,
      sourcePresetId,
    )
    setSelectedId(record.id)
    setSourcePresetId(record.sourcePresetId)
    setStatus(`Saved custom tenant ${record.id}`)
  }

  const onApplyActive = () => {
    let targetId = selectedId
    const base = resolveWhitelabelPreset(selectedId)
    const custom = customTenants.find((t) => t.id === selectedId)
    if (isCustomPresetId(selectedId)) {
      saveCustom(form, selectedId, sourcePresetId)
    } else if (formDriftsFromPreset(form, base, custom?.navOverrides ?? null)) {
      const record = saveCustom(form, null, selectedId)
      targetId = record.id
      setSelectedId(record.id)
      setSourcePresetId(record.sourcePresetId)
    }
    setActivePresetId(targetId, { persist: true })
    cancelPreview()
    setStatus(`Active preset → ${targetId}`)
  }

  const onDelete = () => {
    if (!isCustomPresetId(selectedId)) return
    deleteCustom(selectedId)
    selectTenant(DEFAULT_WHITELABEL_PRESET_ID)
    setStatus('Custom tenant removed (mock)')
  }

  const onClone = () => {
    const record = clonePreset(sourcePresetId, form.brandName)
    selectTenant(record.id)
    setStatus(`Cloned → ${record.id}`)
  }

  const onResetToPreset = () => {
    const { form: nextForm } = resetFormToSourcePreset(sourcePresetId)
    setForm(nextForm)
    pushPreview(nextForm)
    setStatus(`Reset draft to ${sourcePresetId}`)
  }

  const onRestoreDefault = () => {
    setActivePresetId(DEFAULT_WHITELABEL_PRESET_ID, { persist: true })
    selectTenant(DEFAULT_WHITELABEL_PRESET_ID)
    setStatus('Restored default (bluetrade)')
  }

  const onNewCustom = () => {
    const record = clonePreset('bluetrade', 'New Tenant')
    selectTenant(record.id)
    setStatus(`Created ${record.id}`)
  }

  const isCustom = isCustomPresetId(selectedId)

  return (
    <section
      className="space-y-4 rounded-xl border border-cyan-500/25 bg-cyan-500/5 p-4"
      aria-label="Tenant admin config console"
      data-testid="tenant-admin-config-console"
      data-mock-only="true"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-so-fg">Tenant Admin Config Console</h2>
          <p className="mt-0.5 text-[10px] text-so-muted">
            Visual tenant editor — localStorage only · no API / WebSocket
          </p>
        </div>
        <PlatformMockOnlyBadge />
      </div>

      {status ? (
        <p className="rounded border border-so-border/40 bg-so-bg/60 px-2 py-1 text-[10px] text-so-fg">
          {status}
          {previewing ? (
            <span className="ml-2 text-so-muted">(live preview)</span>
          ) : null}
        </p>
      ) : null}

      <TenantAdminCompareStrip
        form={form}
        sourcePresetId={sourcePresetId}
        draftPreset={draftPreset}
        isCustom={isCustom}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)_minmax(0,280px)]">
        <aside className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-so-muted">Tenants</p>
          <ul className="max-h-56 space-y-1 overflow-y-auto">
            {allIds.map((id) => {
              const p = resolveWhitelabelPreset(id)
              const custom = isCustomPresetId(id)
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => selectTenant(id)}
                    className={`w-full rounded border px-2 py-1.5 text-left text-[10px] ${
                      selectedId === id
                        ? 'border-cyan-500/50 bg-cyan-500/10 text-so-fg'
                        : 'border-so-border/50 bg-so-bg/40 text-so-muted hover:border-so-border'
                    }`}
                  >
                    <span className="font-semibold">{p.brandName}</span>
                    <span className="mt-0.5 block font-mono text-[8px] opacity-80">
                      {id}
                      {custom ? ' · custom' : ' · built-in'}
                    </span>
                    {activePresetId === id ? (
                      <span className="mt-0.5 text-[8px] font-bold uppercase text-so-bid">active</span>
                    ) : null}
                  </button>
                </li>
              )
            })}
          </ul>
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={onNewCustom}
              className="rounded border border-so-border/60 px-2 py-1 text-[9px] font-semibold text-so-fg hover:bg-so-bg/60"
            >
              New tenant
            </button>
            <button
              type="button"
              onClick={onClone}
              className="rounded border border-so-border/60 px-2 py-1 text-[9px] font-semibold text-so-fg hover:bg-so-bg/60"
            >
              Clone preset
            </button>
          </div>
        </aside>

        <form
          className="space-y-3 rounded-lg border border-so-border/50 bg-so-bg/40 p-3"
          onSubmit={(e) => e.preventDefault()}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wide text-so-muted">Config</p>

          <div>
            <FieldLabel>Brand name</FieldLabel>
            <input
              type="text"
              value={form.brandName}
              onChange={(e) => updateForm({ brandName: e.target.value })}
              className="w-full rounded border border-so-border/60 bg-so-bg/80 px-2 py-1.5 text-[11px] text-so-fg"
            />
          </div>

          <div>
            <FieldLabel>Accent color</FieldLabel>
            <div className="flex gap-2">
              <input
                type="color"
                value={form.accentColor}
                onChange={(e) => updateForm({ accentColor: e.target.value })}
                className="h-8 w-12 cursor-pointer rounded border border-so-border/60 bg-transparent"
              />
              <input
                type="text"
                value={form.accentColor}
                onChange={(e) => updateForm({ accentColor: e.target.value })}
                className="min-w-0 flex-1 rounded border border-so-border/60 bg-so-bg/80 px-2 py-1.5 font-mono text-[11px] text-so-fg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <FieldLabel>Admin skin</FieldLabel>
              <SelectField<TenantAdminPresetId>
                value={form.admin}
                options={TENANT_ADMIN_PRESET_IDS}
                onChange={(admin) => updateForm({ admin })}
              />
            </div>
            <div>
              <FieldLabel>Menu preset</FieldLabel>
              <SelectField<TenantMenuPresetId>
                value={form.menu}
                options={TENANT_MENU_PRESET_IDS}
                onChange={onMenuPresetChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <FieldLabel>Sidebar width</FieldLabel>
              <SelectField
                value={form.layout.sidebarWidth}
                options={LAYOUT_SIDEBAR}
                onChange={(sidebarWidth) => updateLayout({ sidebarWidth })}
              />
            </div>
            <div>
              <FieldLabel>Topbar style</FieldLabel>
              <SelectField
                value={form.layout.topbarStyle}
                options={LAYOUT_TOPBAR}
                onChange={(topbarStyle) => updateLayout({ topbarStyle })}
              />
            </div>
            <div>
              <FieldLabel>Card style</FieldLabel>
              <SelectField
                value={form.layout.cardLayout}
                options={LAYOUT_CARD}
                onChange={(cardLayout) => updateLayout({ cardLayout })}
              />
            </div>
            <div>
              <FieldLabel>Spacing density</FieldLabel>
              <SelectField
                value={form.spacing}
                options={SPACING_OPTIONS}
                onChange={(spacing) => updateForm({ spacing })}
              />
            </div>
            <div>
              <FieldLabel>Grid density</FieldLabel>
              <SelectField
                value={form.layout.gridDensity}
                options={LAYOUT_GRID}
                onChange={(gridDensity) => updateLayout({ gridDensity })}
              />
            </div>
            <div>
              <FieldLabel>Source preset (reset)</FieldLabel>
              <SelectField
                value={sourcePresetId}
                options={builtinIds}
                onChange={(id) => setSourcePresetId(id)}
              />
            </div>
          </div>

          <div>
            <FieldLabel>Nav order</FieldLabel>
            <ul className="space-y-1">
              {form.navOrder.map((navId) => (
                <li
                  key={navId}
                  className="flex items-center justify-between rounded border border-so-border/40 px-2 py-1 text-[10px]"
                >
                  <span className="font-mono text-so-fg">{navId}</span>
                  <span className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => moveNav(navId, -1)}
                      className="rounded border border-so-border/50 px-1 text-[9px]"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveNav(navId, 1)}
                      className="rounded border border-so-border/50 px-1 text-[9px]"
                    >
                      ↓
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <FieldLabel>Emphasized nav</FieldLabel>
              {NAV_IDS.map((navId) => (
                <label key={navId} className="flex items-center gap-2 text-[10px] text-so-fg">
                  <input
                    type="checkbox"
                    checked={form.emphasizedNavIds.includes(navId)}
                    onChange={() => toggleNavList('emphasizedNavIds', navId)}
                  />
                  {navId}
                </label>
              ))}
            </div>
            <div>
              <FieldLabel>Hidden nav (sidebar)</FieldLabel>
              {NAV_IDS.map((navId) => (
                <label key={navId} className="flex items-center gap-2 text-[10px] text-so-fg">
                  <input
                    type="checkbox"
                    checked={form.hideNavIds.includes(navId)}
                    onChange={() => toggleNavList('hideNavIds', navId)}
                  />
                  {navId}
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-1 border-t border-so-border/40 pt-2">
            <button
              type="button"
              onClick={onSave}
              className="rounded border border-cyan-500/40 bg-cyan-500/15 px-2 py-1 text-[9px] font-semibold text-cyan-100"
            >
              Save custom
            </button>
            <button
              type="button"
              onClick={onApplyActive}
              className="rounded border border-so-bid/40 bg-so-bid/10 px-2 py-1 text-[9px] font-semibold text-so-bid"
            >
              Apply active
            </button>
            <button
              type="button"
              onClick={onResetToPreset}
              className="rounded border border-so-border/60 px-2 py-1 text-[9px] font-semibold text-so-fg"
            >
              Reset to preset
            </button>
            <button
              type="button"
              onClick={onRestoreDefault}
              className="rounded border border-so-border/60 px-2 py-1 text-[9px] font-semibold text-so-muted"
            >
              Restore default
            </button>
            <button
              type="button"
              disabled={!isCustom}
              onClick={onDelete}
              className="rounded border border-so-ask/40 px-2 py-1 text-[9px] font-semibold text-so-ask disabled:opacity-40"
            >
              Delete (mock)
            </button>
          </div>
        </form>

        <aside className="space-y-3" aria-label="Live preview">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-so-muted">
            Live preview
          </p>
          <BrandSummaryCard summary={previewBundle.brandSummary} />
          <MenuOrderPreview menuPreset={form.menu} navOverride={navMapping} />
          <LayoutPreviewStrip layout={draftPreset.layout} />
          <AdminSkinPreview skins={previewBundle.adminSkins} />
        </aside>
      </div>
    </section>
  )
}
