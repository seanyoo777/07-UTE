import { DEFAULT_LAYOUT_FLAGS } from '../../config/layoutFeatureFlags'
import { MOCK_TENANT_PRESETS } from '../mockTenantPresets'
import { DEFAULT_WHITELABEL_PRESET_ID, resolveWhitelabelPreset } from '../tenantPresetRegistry'
import { loadWhitelabelPresetIdFromStorage } from '../tenantPresetStorage'
import { buildMenuPreview } from '../tenantMenuNavMapping'
import { resolveNavMappingForPresetId } from '../tenantPresetRegistry'
import {
  TENANT_ADMIN_PRESET_IDS,
  type TenantAdminPresetId,
  type TenantWhitelabelPreset,
} from '../tenantPresetTypes'
import { validateTenantPreset } from '../validateTenantPreset'
import { ADMIN_SHELL_PREVIEW } from './adminSkinPreviewStyles'
import type {
  AdminSkinPreviewCardModel,
  TenantPreviewCardModel,
  WhitelabelPreviewBundle,
  WhitelabelPreviewDiagnosticsModel,
} from './whitelabelPreviewTypes'
import { buildBrandSummary } from './whitelabelPreviewTypes'

const ADMIN_SKIN_LABELS: Record<TenantAdminPresetId, string> = {
  'dark-professional': 'Dark professional',
  banking: 'Banking',
  'trading-desk': 'Trading desk',
  'modern-glass': 'Modern glass',
}

export function buildTenantPreviewCards(
  activePresetId: string,
  presets: TenantWhitelabelPreset[] = MOCK_TENANT_PRESETS,
): TenantPreviewCardModel[] {
  return presets.map((p) => ({
    presetId: p.id,
    brandName: p.brandName,
    primaryColor: p.theme.colors.accent,
    accentColor: p.theme.colors.accent2,
    menuPreset: p.menu,
    adminPreset: p.admin,
    isActive: p.id === activePresetId,
  }))
}

export function buildAdminSkinPreviewCards(
  activeAdmin: TenantAdminPresetId,
): AdminSkinPreviewCardModel[] {
  return TENANT_ADMIN_PRESET_IDS.map((skinId) => ({
    skinId,
    label: ADMIN_SKIN_LABELS[skinId],
    shellClass: ADMIN_SHELL_PREVIEW[skinId],
    isActive: skinId === activeAdmin,
  }))
}

export function buildWhitelabelPreviewDiagnostics(
  preset: TenantWhitelabelPreset,
): WhitelabelPreviewDiagnosticsModel {
  const storedPresetId = loadWhitelabelPresetIdFromStorage()
  const navOverride = resolveNavMappingForPresetId(preset.id, preset.menu)
  const menuPreview = buildMenuPreview(
    preset.menu,
    {
      ...DEFAULT_LAYOUT_FLAGS,
      forceMobileStack: false,
    },
    navOverride,
  )
  const layout = preset.layout
  return {
    selectedTenantId: preset.tenantId,
    selectedBrandName: preset.brandName,
    themePersisted: storedPresetId === preset.id,
    storedPresetId,
    invalidFallbackDefaultId: resolveWhitelabelPreset('__invalid__').id,
    currentAdminSkin: preset.admin,
    presetValid: validateTenantPreset(preset).ok,
    menuVisibleOrder: menuPreview.visibleOrder.join(' → ') || '—',
    layoutSummary: `${layout.sidebarWidth} · ${layout.topbarStyle} · ${layout.cardLayout} · ${layout.gridDensity}`,
  }
}

export function buildWhitelabelPreviewBundle(
  activePreset: TenantWhitelabelPreset,
): WhitelabelPreviewBundle {
  const defaultFlags = { ...DEFAULT_LAYOUT_FLAGS, forceMobileStack: false }
  return {
    mockOnly: true,
    activePresetId: activePreset.id,
    tenantCards: buildTenantPreviewCards(activePreset.id),
    brandSummary: buildBrandSummary(activePreset),
    layoutPreview: { ...activePreset.layout },
    menuPreview: buildMenuPreview(
      activePreset.menu,
      defaultFlags,
      resolveNavMappingForPresetId(activePreset.id, activePreset.menu),
    ),
    adminSkins: buildAdminSkinPreviewCards(activePreset.admin),
    diagnostics: buildWhitelabelPreviewDiagnostics(activePreset),
  }
}

export function validateTenantPreviewModel(): { ok: boolean; message: string } {
  const cards = buildTenantPreviewCards(DEFAULT_WHITELABEL_PRESET_ID)
  if (cards.length !== 3) {
    return { ok: false, message: `expected 3 tenant cards, got ${cards.length}` }
  }
  const brands = cards.map((c) => c.brandName).sort()
  if (!brands.includes('GOLDX') || !brands.includes('BLUETRADE') || !brands.includes('PRIME FUTURES')) {
    return { ok: false, message: 'missing GOLDX / BLUETRADE / PRIME FUTURES' }
  }
  return { ok: true, message: '3 tenant preview cards' }
}

export function validateAdminSkinPreviewModel(): { ok: boolean; message: string } {
  const skins = buildAdminSkinPreviewCards('banking')
  if (skins.length !== 4) {
    return { ok: false, message: `expected 4 admin skins, got ${skins.length}` }
  }
  if (!skins.every((s) => s.shellClass.length > 0)) {
    return { ok: false, message: 'admin skin shellClass missing' }
  }
  return { ok: true, message: '4 admin skin preview cards' }
}
