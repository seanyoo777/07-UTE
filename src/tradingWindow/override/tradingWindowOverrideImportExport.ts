import {
  adminFormFromTenantId,
  adminFormToOverride,
  overrideToAdminForm,
  validateTradingWindowTenantOverride,
} from './tradingWindowOverrideModel'
import type {
  TradingWindowOverridesStorageBlob,
  TradingWindowTenantOverride,
} from './tradingWindowOverrideTypes'
import {
  TRADING_WINDOW_OVERRIDES_STORAGE_KEY,
  TRADING_WINDOW_OVERRIDES_STORAGE_VERSION,
} from './tradingWindowOverrideTypes'

export type ImportExportValidation = {
  ok: boolean
  warn: boolean
  message: string
  overrides?: Record<string, TradingWindowTenantOverride>
}

export function exportOverridesJson(
  overrides: Record<string, TradingWindowTenantOverride>,
): string {
  const blob: TradingWindowOverridesStorageBlob = {
    v: TRADING_WINDOW_OVERRIDES_STORAGE_VERSION,
    mockOnly: true,
    overrides,
  }
  return JSON.stringify(blob, null, 2)
}

export function exportOverridesToClipboardText(
  overrides: Record<string, TradingWindowTenantOverride>,
): string {
  return [
    '# UTE trading window overrides (mockOnly) — paste into admin import',
    `# storage key: ${TRADING_WINDOW_OVERRIDES_STORAGE_KEY}`,
    exportOverridesJson(overrides),
  ].join('\n')
}

function extractJsonFromPaste(text: string): string {
  const trimmed = text.trim()
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence?.[1]) return fence[1].trim()
  const start = trimmed.indexOf('{')
  const end = trimmed.lastIndexOf('}')
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1)
  return trimmed
}

export function parseOverridesImport(text: string): ImportExportValidation {
  if (!text.trim()) {
    return { ok: false, warn: true, message: 'empty import text' }
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(extractJsonFromPaste(text))
  } catch {
    return { ok: false, warn: true, message: 'invalid JSON' }
  }
  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, warn: true, message: 'root must be object' }
  }
  const root = parsed as Partial<TradingWindowOverridesStorageBlob> & {
    overrides?: unknown
  }
  if (root.mockOnly !== true) {
    return { ok: false, warn: true, message: 'mockOnly must be true — import rejected' }
  }
  if (root.v !== TRADING_WINDOW_OVERRIDES_STORAGE_VERSION) {
    return {
      ok: false,
      warn: true,
      message: `schema v mismatch (expected ${TRADING_WINDOW_OVERRIDES_STORAGE_VERSION})`,
    }
  }
  if (!root.overrides || typeof root.overrides !== 'object') {
    return { ok: false, warn: true, message: 'overrides object required' }
  }
  const clean: Record<string, TradingWindowTenantOverride> = {}
  const warnings: string[] = []
  for (const [id, row] of Object.entries(root.overrides)) {
    const v = validateTradingWindowTenantOverride(row)
    if (!v.ok) {
      warnings.push(`${id}: ${v.message}`)
      continue
    }
    const o = row as TradingWindowTenantOverride
    if (o.tenantPresetId !== id) {
      warnings.push(`${id}: tenantPresetId mismatch`)
    }
    clean[id] = o
  }
  if (Object.keys(clean).length === 0) {
    return {
      ok: false,
      warn: true,
      message: warnings.length ? warnings.join('; ') : 'no valid overrides',
    }
  }
  return {
    ok: true,
    warn: warnings.length > 0,
    message: warnings.length ? `imported with warnings: ${warnings.join('; ')}` : `${Object.keys(clean).length} overrides ready`,
    overrides: clean,
  }
}

/** Round-trip admin form for a single tenant (clipboard-friendly). */
export function exportSingleOverrideJson(tenantPresetId: string, override: TradingWindowTenantOverride): string {
  return JSON.stringify(
    {
      mockOnly: true,
      tenantPresetId,
      form: overrideToAdminForm(override),
      override,
    },
    null,
    2,
  )
}

export function parseSingleOverrideImport(
  tenantPresetId: string,
  text: string,
): ImportExportValidation {
  try {
    const parsed = JSON.parse(extractJsonFromPaste(text)) as {
      mockOnly?: boolean
      override?: TradingWindowTenantOverride
      form?: ReturnType<typeof adminFormFromTenantId>
    }
    if (parsed.mockOnly !== true) {
      return { ok: false, warn: true, message: 'mockOnly must be true' }
    }
    if (parsed.override) {
      const v = validateTradingWindowTenantOverride(parsed.override)
      if (!v.ok) return { ok: false, warn: true, message: v.message }
      return {
        ok: true,
        warn: false,
        message: 'single override valid',
        overrides: { [tenantPresetId]: parsed.override },
      }
    }
    if (parsed.form) {
      const o = adminFormToOverride({ ...parsed.form, tenantPresetId })
      return {
        ok: true,
        warn: false,
        message: 'form converted to override',
        overrides: { [tenantPresetId]: o },
      }
    }
    return { ok: false, warn: true, message: 'override or form required' }
  } catch {
    return { ok: false, warn: true, message: 'invalid JSON' }
  }
}

export { TRADING_WINDOW_OVERRIDES_STORAGE_KEY }
