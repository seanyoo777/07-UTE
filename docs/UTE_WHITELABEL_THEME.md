# UTE White-Label Theme Preset Engine (Phase 1)

Mock-only white-label layer: one UTE engine, multiple brand faces without per-tenant code forks.

## Preset structure

| Layer | File | Fields |
|-------|------|--------|
| Theme | `tenantThemeConfig` | `colors`, `typography`, `chartStyle`, `spacing`, `borderRadius` |
| Layout | `tenantLayoutPreset` | `sidebarWidth`, `topbarStyle`, `cardLayout`, `gridDensity` |
| Menu | `tenantMenuPreset` | `trading-first` \| `mobile-first` \| `broker-style` \| `futures-style` |
| Admin | `tenantAdminPreset` | `dark-professional` \| `banking` \| `trading-desk` \| `modern-glass` |

Registry: `src/whitelabel/mockTenantPresets.ts` — **GOLDX**, **BLUETRADE**, **PRIME FUTURES**.

## Theme engine

1. `resolveWhitelabelPreset(id)` — registry lookup; invalid id → default (`bluetrade`).
2. `applyTenantTheme(preset)` — sets CSS variables on `document.documentElement` and `data-ute-*` attributes.
3. `useTenantWhitelabelStore` — hydrates from `localStorage` key `ute-whitelabel-preset-id`, syncs `usePlatformTenantStore` display labels.
4. `resolveWhitelabelShellClasses` — maps layout/admin presets to Tailwind classes on shell chrome.

## UI integration

- `TenantWhitelabelBootstrap` in `main.tsx` (hydrate once).
- `TenantThemeSwitcher` in `PlatformHeader` when `chrome.enableWhitelabelThemeSwitcher`.
- Diagnostics: `WhitelabelDiagnosticsSection` in platform diagnostics panel.
- Self-test: `whitelabel-preset-load`, `whitelabel-theme-persistence`, `whitelabel-invalid-preset-fallback`.

## Flags

| Env | Chrome flag |
|-----|-------------|
| `VITE_UTE_ENABLE_WHITELABEL_PRESETS` | `enableWhitelabelPresets` |
| `VITE_UTE_ENABLE_WHITELABEL_THEME_SWITCHER` | `enableWhitelabelThemeSwitcher` |

Emergency profile disables both.

## Constraints

- **mockOnly** — no trading API, WebSocket, or polling.
- **Additive** — `UtePlatformShell` and existing features unchanged.
- **No tenant code copy** — new brands = new registry entries only.

## Phase 2 — Tenant Preview Center + Admin Skin Preview

| Component | Path | Role |
|-----------|------|------|
| **Tenant Preview Center** | `preview/TenantPreviewCenter.tsx` | 3 tenant cards, switch preset, MOCK ONLY badge |
| **Admin Skin Preview** | `preview/AdminSkinPreview.tsx` | 4 admin skin mini cards; active skin marked LIVE |
| **Layout Preview** | `preview/LayoutPreviewStrip.tsx` | Sidebar / topbar / card / grid visuals |
| **Brand Summary** | `preview/BrandSummaryCard.tsx` | Logo text, colors, menu/admin/layout |
| **Preview model** | `preview/buildWhitelabelPreviewModel.ts` | Pure bundle for UI + self-test |

**Flag:** `chrome.enableWhitelabelPreviewCenter` · `VITE_UTE_ENABLE_WHITELABEL_PREVIEW_CENTER`  
**Placement:** `/admin` after Self-Test Center.

**Self-test:** `tenant-preview-renders`, `admin-skin-preview-renders`, `tenant-switch-persistence`, `whitelabel-preview-no-api-no-websocket`.

## Phase 3 — Menu / layout differentiation

| Menu preset | Nav order | Emphasis | Sidebar hide |
|-------------|-----------|----------|--------------|
| `trading-first` | trading → admin → diagnostics | trading | — |
| `mobile-first` | trading → admin | trading | diagnostics (header/admin only) |
| `broker-style` | admin → trading → diagnostics | admin | — |
| `futures-style` | trading → diagnostics → admin | trading, diagnostics | — |

- **Resolver:** `resolvePlatformNavForTenant(flags, menuPreset)` — feature flags first, then menu hide/order.
- **Layout:** `resolveWhitelabelShellClasses` — sidebar, topbar, `gridDensityClass`, `cardLayoutClass`, `workspaceSpacingClass` on `UtePlatformShell` main.
- **Preview:** `MenuOrderPreview` in Tenant Preview Center — visible/hidden/emphasized per nav id.

**Self-test:** `whitelabel-menu-order`, `whitelabel-layout-density`, `whitelabel-feature-guard-respected`, `whitelabel-no-api-no-websocket`.

## Phase 4 — Tenant Admin Config Console

| Component | Path | Role |
|-----------|------|------|
| **Tenant Admin Config Console** | `admin/TenantAdminConfigConsole.tsx` | Visual CRUD for custom tenants on `/admin` |
| **Compare strip** | `admin/TenantAdminCompareStrip.tsx` | Draft vs source preset chips |
| **Custom model** | `customTenantModel.ts` | Form state, clone, drift, validate |
| **Custom storage** | `customTenantStorage.ts` | `ute.whitelabel.custom_tenants_v1` |
| **Active config** | `activeConfigStorage.ts` | `ute.whitelabel.active_config_v1` (+ legacy `ute-whitelabel-preset-id`) |
| **Registry merge** | `tenantPresetRegistry.ts` | Built-ins + `registerCustomTenantRecords()` |

**Flag:** `chrome.enableWhitelabelAdminConfig` · `VITE_UTE_ENABLE_WHITELABEL_ADMIN_CONFIG`  
**Placement:** `/admin` directly under Tenant Preview Center.

**Operator actions (mock only):** create · edit · delete custom · clone preset · reset to preset · apply active · restore default (bluetrade).

**Editable fields:** brand name · accent color · admin skin · menu preset · layout (sidebar / topbar / card / grid) · spacing density · nav order · emphasized nav · hidden nav.

**Live preview:** form changes call `useTenantWhitelabelStore.previewPreset()` (CSS vars + preview panels); cancel on unmount restores persisted active config.

**Self-test:** `custom-tenant-schema` · `tenant-config-persistence` · `tenant-preview-sync` · `tenant-config-no-api-no-websocket`.

## Tenant extension

1. Add `TenantWhitelabelPreset` object to `MOCK_TENANT_PRESETS` (built-in).
2. Or use **Tenant Admin Config Console** to clone/edit custom tenants (still registry merge, no code fork).
3. Remote preset JSON can replace registry behind a feature flag; keep `validateTenantPreset` as gate.
