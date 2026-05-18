import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { PlatformMockOnlyBadge } from '../../platform/PlatformMockOnlyBadge'
import { listBuiltinPresetIds } from '../../whitelabel/tenantPresetRegistry'
import { useTenantWhitelabelStore } from '../../whitelabel/tenantWhitelabelStore'
import { TradingWindowHtsGridPreview } from '../preview/TradingWindowHtsGridPreview'
import { TradingWindowPanelChromePreview } from '../preview/TradingWindowPanelChromePreview'
import {
  TRADING_WINDOW_PROFILE_IDS,
  type TradingWindowProfileId,
} from '../tradingWindowPresetTypes'
import {
  type DockTabStyleChrome,
  type OrderBookDensityChrome,
  type OrderFormChromeMode,
} from '../tradingWindowPanelChrome'
import {
  adminFormFromTenantId,
  adminFormDriftsFromSaved,
  type TradingWindowAdminFormState,
} from '../override/tradingWindowOverrideModel'
import { useTradingWindowOverrideStore } from '../override/tradingWindowOverrideStore'
import { MOBILE_STACK_MODES } from '../override/tradingWindowOverrideTypes'
import { getHtsGridForProfile } from '../tradingWindowHtsGridDefaults'
import { TradingWindowOverrideCompareStrip } from './TradingWindowOverrideCompareStrip'
import { TradingWindowOverrideImportExportPanel } from './TradingWindowOverrideImportExportPanel'
import { TradingWindowMarketContextSelector } from '../market/TradingWindowMarketContextSelector'
import { TradingWindowMobileStackEditor } from '../mobile/TradingWindowMobileStackEditor'
import { resolveWhitelabelPreset } from '../../whitelabel/tenantPresetRegistry'

const DENSITY_OPTIONS: OrderBookDensityChrome[] = ['compact', 'standard', 'futures-emphasis']
const FORM_MODES: OrderFormChromeMode[] = ['premium', 'standard', 'fast']
const DOCK_TABS: DockTabStyleChrome[] = ['compact', 'elevated', 'institutional']
const DOCK_HEIGHTS = ['short', 'standard', 'tall'] as const

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
      className="w-full rounded border border-so-border/60 bg-so-bg/80 px-2 py-1 text-[11px] text-so-fg"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (n: number) => void
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded border border-so-border/60 bg-so-bg/80 px-2 py-1 text-[11px] tabular-nums text-so-fg"
      />
    </div>
  )
}

/**
 * Trading window override console — localStorage mock only.
 */
export function TradingWindowAdminConsole() {
  const hydrate = useTradingWindowOverrideStore((s) => s.hydrateFromStorage)
  const overrides = useTradingWindowOverrideStore((s) => s.overrides)
  const setPreviewFromForm = useTradingWindowOverrideStore((s) => s.setPreviewFromForm)
  const saveOverrideFromForm = useTradingWindowOverrideStore((s) => s.saveOverrideFromForm)
  const resetTenantOverride = useTradingWindowOverrideStore((s) => s.resetTenantOverride)
  const clearPreview = useTradingWindowOverrideStore((s) => s.clearPreview)
  const previewing = useTradingWindowOverrideStore((s) => s.preview)

  const activePresetId = useTenantWhitelabelStore((s) => s.activePresetId)
  const tenantPreset = useTenantWhitelabelStore((s) => s.preset)

  const tenantIds = useMemo(() => listBuiltinPresetIds(), [])
  const [selectedId, setSelectedId] = useState(activePresetId)
  const [form, setForm] = useState<TradingWindowAdminFormState>(() =>
    adminFormFromTenantId(activePresetId, overrides[activePresetId] ?? null),
  )
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const saved = overrides[selectedId] ?? null
  const draftDrift = adminFormDriftsFromSaved(form, saved)
  const liveOnActiveTenant = selectedId === tenantPreset.id

  const pushPreview = useCallback(
    (next: TradingWindowAdminFormState) => {
      setPreviewFromForm(next)
    },
    [setPreviewFromForm],
  )

  const updateForm = useCallback(
    (patch: Partial<TradingWindowAdminFormState>) => {
      setForm((prev) => {
        const next = { ...prev, ...patch }
        pushPreview(next)
        return next
      })
    },
    [pushPreview],
  )

  const onProfileChange = (profileId: TradingWindowProfileId) => {
    const grid = getHtsGridForProfile(profileId)
    updateForm({
      profileId,
      htsChart: grid.chart,
      htsBook: grid.orderBook,
      htsOrder: grid.orderPanel,
    })
  }

  const onSelectTenant = (id: string) => {
    setSelectedId(id)
    const nextForm = adminFormFromTenantId(id, overrides[id] ?? null)
    setForm(nextForm)
    pushPreview(nextForm)
    setStatus(null)
  }

  const onSave = () => {
    saveOverrideFromForm(form)
    setStatus(`Saved override for ${form.tenantPresetId}`)
  }

  const onReset = () => {
    resetTenantOverride(selectedId)
    const baseline = adminFormFromTenantId(selectedId, null)
    setForm(baseline)
    pushPreview(baseline)
    setStatus(`Reset ${selectedId} to preset defaults`)
  }

  const onClearPreview = () => {
    clearPreview()
    setStatus('Preview cleared (saved overrides kept)')
  }

  const previewPreset = useMemo(() => resolveWhitelabelPreset(selectedId), [selectedId])

  return (
    <section
      className="space-y-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4"
      aria-label="Trading window admin console"
      data-testid="trading-window-admin-console"
      data-mock-only="true"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-so-fg">Trading Window Admin</h2>
          <p className="mt-0.5 text-[10px] text-so-muted">
            WhiteLabel / Trading Window — localStorage · ute.trading_window_overrides_v1
          </p>
        </div>
        <PlatformMockOnlyBadge />
      </div>

      {status ? (
        <p className="rounded border border-so-border/40 bg-so-bg/60 px-2 py-1 text-[10px] text-so-fg">
          {status}
          {previewing ? <span className="ml-2 text-so-muted">(live preview)</span> : null}
        </p>
      ) : null}

      <p className="text-[10px] text-so-muted">
        Live preview syncs Preview Center, Diagnostics, and UniversalMarketView when selected tenant
        matches active shell ({activePresetId}
        {liveOnActiveTenant ? ' · synced' : ' · select active tenant to preview workspace'}).
      </p>

      <TradingWindowMarketContextSelector compact />

      <TradingWindowOverrideCompareStrip form={form} />

      <TradingWindowOverrideImportExportPanel tenantPresetId={selectedId} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,160px)_minmax(0,1fr)_minmax(0,260px)]">
        <aside className="space-y-1">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-so-muted">Tenant</p>
          {tenantIds.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => onSelectTenant(id)}
              className={`block w-full rounded-md border px-2 py-1.5 text-left text-[10px] font-semibold ${
                selectedId === id
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-so-fg'
                  : 'border-so-border/50 text-so-muted hover:bg-so-surface/40'
              }`}
            >
              {id}
              {overrides[id] ? <span className="ml-1 text-emerald-400">*</span> : null}
            </button>
          ))}
        </aside>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <FieldLabel>Profile</FieldLabel>
            <SelectField value={form.profileId} options={TRADING_WINDOW_PROFILE_IDS} onChange={onProfileChange} />
          </div>
          <div>
            <FieldLabel>Mobile stack</FieldLabel>
            <SelectField
              value={form.mobileStackMode}
              options={MOBILE_STACK_MODES}
              onChange={(mobileStackMode) => updateForm({ mobileStackMode })}
            />
          </div>
          <NumberField
            label="Grid chart"
            value={form.htsChart}
            min={1}
            max={8}
            onChange={(htsChart) => updateForm({ htsChart })}
          />
          <NumberField
            label="Grid book"
            value={form.htsBook}
            min={1}
            max={8}
            onChange={(htsBook) => updateForm({ htsBook })}
          />
          <NumberField
            label="Grid order"
            value={form.htsOrder}
            min={1}
            max={8}
            onChange={(htsOrder) => updateForm({ htsOrder })}
          />
          <div>
            <FieldLabel>Book density chrome</FieldLabel>
            <SelectField
              value={form.orderBookDensity}
              options={DENSITY_OPTIONS}
              onChange={(orderBookDensity) => updateForm({ orderBookDensity })}
            />
          </div>
          <div>
            <FieldLabel>Order form chrome</FieldLabel>
            <SelectField
              value={form.orderFormMode}
              options={FORM_MODES}
              onChange={(orderFormMode) => updateForm({ orderFormMode })}
            />
          </div>
          <div>
            <FieldLabel>Dock tab style</FieldLabel>
            <SelectField
              value={form.dockTabStyle}
              options={DOCK_TABS}
              onChange={(dockTabStyle) => updateForm({ dockTabStyle })}
            />
          </div>
          <div>
            <FieldLabel>Dock height</FieldLabel>
            <SelectField
              value={form.dockHeight}
              options={DOCK_HEIGHTS}
              onChange={(dockHeight) => updateForm({ dockHeight })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <TradingWindowMobileStackEditor
            stackOrder={form.mobileStackOrder}
            visualPreset={form.mobileVisualPreset}
            onChange={({ stackOrder, visualPreset }) =>
              updateForm({
                mobileStackOrder: stackOrder,
                mobileVisualPreset: visualPreset,
                mobileStackMode:
                  visualPreset === 'futures' ? 'order-first' : 'standard',
              })
            }
          />
          <TradingWindowHtsGridPreview preset={previewPreset} />
          <TradingWindowPanelChromePreview preset={previewPreset} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={!draftDrift && saved !== null}
          className="rounded-md border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-[10px] font-semibold text-so-fg hover:bg-emerald-500/25 disabled:opacity-50"
        >
          Save override
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-md border border-so-border/60 px-3 py-1.5 text-[10px] font-semibold text-so-muted hover:bg-so-surface/40"
        >
          Reset to preset
        </button>
        <button
          type="button"
          onClick={onClearPreview}
          className="rounded-md border border-so-border/60 px-3 py-1.5 text-[10px] font-semibold text-so-muted hover:bg-so-surface/40"
        >
          Clear preview
        </button>
      </div>
    </section>
  )
}
