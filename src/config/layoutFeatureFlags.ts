/**
 * Layout feature flags — UI-only resolver (env + defaults).
 * @see docs/UTE_LAYOUT_FEATURE_FLAGS.md
 */

export const LAYOUT_PRESETS = ['hts', 'simple', 'mobile', 'compact', 'tournament'] as const

export type LayoutPreset = (typeof LAYOUT_PRESETS)[number]

export type UteLayoutChromeFlags = {
  showPremiumShell: boolean
  showHtsTopBar: boolean
  showMarketDeck: boolean
  showSidebar: boolean
  showBottomDock: boolean
  showIntegrationSlots: boolean
  /** Platform header notification slot (mock summary). */
  showNotificationSlot: boolean
  /** Unified event feed under notification slot (localStorage, mock). */
  showUnifiedEventFeed: boolean
  /** Workspace context router (feed → panel highlight, mock navigation). */
  enableWorkspaceContextRouter: boolean
  /** Tenant context bridge (12-TGX-TokenAdmin validation mock, read-only). */
  enableTenantContextBridge: boolean
  /** Global Diagnostics Center (cross-app mock aggregate on /admin). */
  enableGlobalDiagnosticsCenter: boolean
  /** AI Incident Review board (mock triage on /admin). */
  enableIncidentReview: boolean
  /** Mock AI recommendation / root-cause blocks on incident board. */
  enableIncidentAiSummary: boolean
  /** AI Proposal Queue on /admin (mock, status-only). */
  enableProposalQueue: boolean
  /** Mock AI summary / impact blocks on proposal board. */
  enableProposalAiSummary: boolean
  /** Cross-app risk graph on /admin (mock visualization). */
  enableRiskGraph: boolean
  /** Global operations timeline on /admin (mock chronological). */
  enableOperationsTimeline: boolean
  /** White-label theme preset engine (CSS vars + layout tokens, mock). */
  enableWhitelabelPresets: boolean
  /** Platform header theme switcher (localStorage, mock). */
  enableWhitelabelThemeSwitcher: boolean
  /** Tenant Preview Center on /admin (mock brand switch). */
  enableWhitelabelPreviewCenter: boolean
  /** Tenant Admin Config Console on /admin (mock CRUD + visual editor). */
  enableWhitelabelAdminConfig: boolean
}

export type UteLayoutIntegrationFlags = {
  oneAi: boolean
  gameHub: boolean
  mockInvest: boolean
  tgxCexStrip: boolean
  speedOrderChrome: boolean
}

export type UteLayoutFeatureFlags = {
  layoutPreset: LayoutPreset
  chrome: UteLayoutChromeFlags
  integrations: UteLayoutIntegrationFlags
  readOnly: boolean
  emergencyDisable: boolean
}

/** Resolved flags + layout hints for UI (no trading-store impact). */
export type EffectiveLayoutFlags = UteLayoutFeatureFlags & {
  /** `< lg` + `hts`, or preset `mobile` — use TradingLayout stack in UniversalMarketView. */
  forceMobileStack: boolean
}

export const DEFAULT_LAYOUT_FLAGS: UteLayoutFeatureFlags = {
  layoutPreset: 'hts',
  chrome: {
    showPremiumShell: true,
    showHtsTopBar: true,
    showMarketDeck: true,
    showSidebar: true,
    showBottomDock: true,
    showIntegrationSlots: true,
    showNotificationSlot: true,
    showUnifiedEventFeed: true,
    enableWorkspaceContextRouter: true,
    enableTenantContextBridge: true,
    enableGlobalDiagnosticsCenter: true,
    enableIncidentReview: true,
    enableIncidentAiSummary: true,
    enableProposalQueue: true,
    enableProposalAiSummary: true,
    enableRiskGraph: true,
    enableOperationsTimeline: true,
    enableWhitelabelPresets: true,
    enableWhitelabelThemeSwitcher: true,
    enableWhitelabelPreviewCenter: true,
    enableWhitelabelAdminConfig: true,
  },
  integrations: {
    oneAi: true,
    gameHub: false,
    mockInvest: true,
    tgxCexStrip: true,
    speedOrderChrome: true,
  },
  readOnly: false,
  emergencyDisable: false,
}

/** Applied when `emergencyDisable` is true after env merge (§8). */
export const EMERGENCY_LAYOUT_PROFILE: Pick<
  UteLayoutFeatureFlags,
  'layoutPreset' | 'chrome' | 'integrations' | 'emergencyDisable'
> = {
  layoutPreset: 'simple',
  emergencyDisable: true,
  chrome: {
    showPremiumShell: true,
    showHtsTopBar: true,
    showMarketDeck: true,
    showSidebar: true,
    showBottomDock: false,
    showIntegrationSlots: false,
    showNotificationSlot: true,
    showUnifiedEventFeed: false,
    enableWorkspaceContextRouter: false,
    enableTenantContextBridge: false,
    enableGlobalDiagnosticsCenter: false,
    enableIncidentReview: false,
    enableIncidentAiSummary: false,
    enableProposalQueue: false,
    enableProposalAiSummary: false,
    enableRiskGraph: false,
    enableOperationsTimeline: false,
    enableWhitelabelPresets: false,
    enableWhitelabelThemeSwitcher: false,
    enableWhitelabelPreviewCenter: false,
    enableWhitelabelAdminConfig: false,
  },
  integrations: {
    oneAi: false,
    gameHub: false,
    mockInvest: false,
    tgxCexStrip: false,
    speedOrderChrome: false,
  },
}

/** Env keys accepted by the resolver (Vite `import.meta.env` or test injection). */
export type LayoutFlagsEnvRecord = {
  VITE_UTE_LAYOUT_PRESET?: string
  VITE_UTE_EMERGENCY_DISABLE?: string
  VITE_UTE_READ_ONLY?: string
  /** Alias for `VITE_UTE_READ_ONLY` */
  VITE_UTE_READONLY?: string
  VITE_UTE_SHOW_PREMIUM_SHELL?: string
  VITE_UTE_SHOW_HTS_TOPBAR?: string
  VITE_UTE_SHOW_MARKET_DECK?: string
  VITE_UTE_SHOW_SIDEBAR?: string
  VITE_UTE_SHOW_BOTTOM_DOCK?: string
  VITE_UTE_SHOW_INTEGRATION_SLOTS?: string
  VITE_UTE_SHOW_NOTIFICATION_SLOT?: string
  VITE_UTE_SHOW_UNIFIED_EVENT_FEED?: string
  VITE_UTE_ENABLE_WORKSPACE_CONTEXT_ROUTER?: string
  VITE_UTE_ENABLE_TENANT_CONTEXT_BRIDGE?: string
  VITE_UTE_ENABLE_GLOBAL_DIAGNOSTICS_CENTER?: string
  VITE_UTE_ENABLE_INCIDENT_REVIEW?: string
  VITE_UTE_ENABLE_INCIDENT_AI_SUMMARY?: string
  VITE_UTE_ENABLE_PROPOSAL_QUEUE?: string
  VITE_UTE_ENABLE_PROPOSAL_AI_SUMMARY?: string
  VITE_UTE_ENABLE_RISK_GRAPH?: string
  VITE_UTE_ENABLE_OPERATIONS_TIMELINE?: string
  VITE_UTE_ENABLE_WHITELABEL_PRESETS?: string
  VITE_UTE_ENABLE_WHITELABEL_THEME_SWITCHER?: string
  VITE_UTE_ENABLE_WHITELABEL_PREVIEW_CENTER?: string
  VITE_UTE_ENABLE_WHITELABEL_ADMIN_CONFIG?: string
  VITE_UTE_TENANT_VALIDATION_MOCK_VERDICT?: string
  VITE_UTE_TENANT_VALIDATION_MOCK_FAIL?: string
  VITE_UTE_ONEAI_CHROME?: string
  VITE_UTE_MOCKINVEST_CHROME?: string
  VITE_UTE_GAMEHUB_CHROME?: string
  VITE_UTE_TGX_CEX_STRIP?: string
  VITE_UTE_SPEEDORDER_CHROME?: string
}

export type ResolveLayoutFlagsInput = {
  /** If omitted, reads `import.meta.env`. Pass `{}` for defaults-only (tests). */
  env?: LayoutFlagsEnvRecord
  /** After env merge; does not bypass emergency profile. */
  overrides?: Partial<
    Pick<UteLayoutFeatureFlags, 'layoutPreset' | 'readOnly' | 'emergencyDisable'>
  > & {
    chrome?: Partial<UteLayoutChromeFlags>
    integrations?: Partial<UteLayoutIntegrationFlags>
  }
  /** When true, `hts` preset sets `forceMobileStack` (breakpoint contract). */
  viewportIsMobile?: boolean
}

const PRESET_SET = new Set<string>(LAYOUT_PRESETS)

export function isLayoutPreset(value: string): value is LayoutPreset {
  return PRESET_SET.has(value)
}

/** Unknown / empty → `hts`. */
export function parseLayoutPreset(raw: string | undefined | null): LayoutPreset {
  if (raw == null || raw.trim() === '') return 'hts'
  const normalized = raw.trim().toLowerCase()
  return isLayoutPreset(normalized) ? normalized : 'hts'
}

export function parseEnvBoolean(raw: string | undefined): boolean | undefined {
  if (raw === undefined) return undefined
  const v = raw.trim().toLowerCase()
  if (v === '' || v === 'undefined') return undefined
  if (v === 'true' || v === '1' || v === 'yes' || v === 'on') return true
  if (v === 'false' || v === '0' || v === 'no' || v === 'off') return false
  return undefined
}

function readLayoutFlagsFromViteEnv(): LayoutFlagsEnvRecord {
  const e = import.meta.env
  return {
    VITE_UTE_LAYOUT_PRESET: e.VITE_UTE_LAYOUT_PRESET,
    VITE_UTE_EMERGENCY_DISABLE: e.VITE_UTE_EMERGENCY_DISABLE,
    VITE_UTE_READ_ONLY: e.VITE_UTE_READ_ONLY,
    VITE_UTE_READONLY: e.VITE_UTE_READONLY,
    VITE_UTE_SHOW_PREMIUM_SHELL: e.VITE_UTE_SHOW_PREMIUM_SHELL,
    VITE_UTE_SHOW_HTS_TOPBAR: e.VITE_UTE_SHOW_HTS_TOPBAR,
    VITE_UTE_SHOW_MARKET_DECK: e.VITE_UTE_SHOW_MARKET_DECK,
    VITE_UTE_SHOW_SIDEBAR: e.VITE_UTE_SHOW_SIDEBAR,
    VITE_UTE_SHOW_BOTTOM_DOCK: e.VITE_UTE_SHOW_BOTTOM_DOCK,
    VITE_UTE_SHOW_INTEGRATION_SLOTS: e.VITE_UTE_SHOW_INTEGRATION_SLOTS,
    VITE_UTE_SHOW_NOTIFICATION_SLOT: e.VITE_UTE_SHOW_NOTIFICATION_SLOT,
    VITE_UTE_SHOW_UNIFIED_EVENT_FEED: e.VITE_UTE_SHOW_UNIFIED_EVENT_FEED,
    VITE_UTE_ENABLE_WORKSPACE_CONTEXT_ROUTER: e.VITE_UTE_ENABLE_WORKSPACE_CONTEXT_ROUTER,
    VITE_UTE_ENABLE_TENANT_CONTEXT_BRIDGE: e.VITE_UTE_ENABLE_TENANT_CONTEXT_BRIDGE,
    VITE_UTE_ENABLE_GLOBAL_DIAGNOSTICS_CENTER: e.VITE_UTE_ENABLE_GLOBAL_DIAGNOSTICS_CENTER,
    VITE_UTE_ENABLE_INCIDENT_REVIEW: e.VITE_UTE_ENABLE_INCIDENT_REVIEW,
    VITE_UTE_ENABLE_INCIDENT_AI_SUMMARY: e.VITE_UTE_ENABLE_INCIDENT_AI_SUMMARY,
    VITE_UTE_ENABLE_PROPOSAL_QUEUE: e.VITE_UTE_ENABLE_PROPOSAL_QUEUE,
    VITE_UTE_ENABLE_PROPOSAL_AI_SUMMARY: e.VITE_UTE_ENABLE_PROPOSAL_AI_SUMMARY,
    VITE_UTE_ENABLE_RISK_GRAPH: e.VITE_UTE_ENABLE_RISK_GRAPH,
    VITE_UTE_ENABLE_OPERATIONS_TIMELINE: e.VITE_UTE_ENABLE_OPERATIONS_TIMELINE,
    VITE_UTE_ENABLE_WHITELABEL_PRESETS: e.VITE_UTE_ENABLE_WHITELABEL_PRESETS,
    VITE_UTE_ENABLE_WHITELABEL_THEME_SWITCHER: e.VITE_UTE_ENABLE_WHITELABEL_THEME_SWITCHER,
    VITE_UTE_ENABLE_WHITELABEL_PREVIEW_CENTER: e.VITE_UTE_ENABLE_WHITELABEL_PREVIEW_CENTER,
    VITE_UTE_ENABLE_WHITELABEL_ADMIN_CONFIG: e.VITE_UTE_ENABLE_WHITELABEL_ADMIN_CONFIG,
    VITE_UTE_TENANT_VALIDATION_MOCK_VERDICT: e.VITE_UTE_TENANT_VALIDATION_MOCK_VERDICT,
    VITE_UTE_TENANT_VALIDATION_MOCK_FAIL: e.VITE_UTE_TENANT_VALIDATION_MOCK_FAIL,
    VITE_UTE_ONEAI_CHROME: e.VITE_UTE_ONEAI_CHROME,
    VITE_UTE_MOCKINVEST_CHROME: e.VITE_UTE_MOCKINVEST_CHROME,
    VITE_UTE_GAMEHUB_CHROME: e.VITE_UTE_GAMEHUB_CHROME,
    VITE_UTE_TGX_CEX_STRIP: e.VITE_UTE_TGX_CEX_STRIP,
    VITE_UTE_SPEEDORDER_CHROME: e.VITE_UTE_SPEEDORDER_CHROME,
  }
}

function mergeChrome(
  base: UteLayoutChromeFlags,
  patch: Partial<UteLayoutChromeFlags>,
): UteLayoutChromeFlags {
  return { ...base, ...patch }
}

function mergeIntegrations(
  base: UteLayoutIntegrationFlags,
  patch: Partial<UteLayoutIntegrationFlags>,
): UteLayoutIntegrationFlags {
  return { ...base, ...patch }
}

function applyEnvRecord(
  flags: UteLayoutFeatureFlags,
  env: LayoutFlagsEnvRecord,
): UteLayoutFeatureFlags {
  let next: UteLayoutFeatureFlags = {
    ...flags,
    chrome: { ...flags.chrome },
    integrations: { ...flags.integrations },
  }

  if (env.VITE_UTE_LAYOUT_PRESET !== undefined) {
    next = { ...next, layoutPreset: parseLayoutPreset(env.VITE_UTE_LAYOUT_PRESET) }
  }

  const emergency = parseEnvBoolean(env.VITE_UTE_EMERGENCY_DISABLE)
  if (emergency !== undefined) next = { ...next, emergencyDisable: emergency }

  const readOnly =
    parseEnvBoolean(env.VITE_UTE_READ_ONLY) ?? parseEnvBoolean(env.VITE_UTE_READONLY)
  if (readOnly !== undefined) next = { ...next, readOnly }

  const chromePatches: Partial<UteLayoutChromeFlags> = {}
  const pShell = parseEnvBoolean(env.VITE_UTE_SHOW_PREMIUM_SHELL)
  if (pShell !== undefined) chromePatches.showPremiumShell = pShell
  const pTop = parseEnvBoolean(env.VITE_UTE_SHOW_HTS_TOPBAR)
  if (pTop !== undefined) chromePatches.showHtsTopBar = pTop
  const pDeck = parseEnvBoolean(env.VITE_UTE_SHOW_MARKET_DECK)
  if (pDeck !== undefined) chromePatches.showMarketDeck = pDeck
  const pSide = parseEnvBoolean(env.VITE_UTE_SHOW_SIDEBAR)
  if (pSide !== undefined) chromePatches.showSidebar = pSide
  const pDock = parseEnvBoolean(env.VITE_UTE_SHOW_BOTTOM_DOCK)
  if (pDock !== undefined) chromePatches.showBottomDock = pDock
  const pSlots = parseEnvBoolean(env.VITE_UTE_SHOW_INTEGRATION_SLOTS)
  if (pSlots !== undefined) chromePatches.showIntegrationSlots = pSlots
  const pNotif = parseEnvBoolean(env.VITE_UTE_SHOW_NOTIFICATION_SLOT)
  if (pNotif !== undefined) chromePatches.showNotificationSlot = pNotif
  const pFeed = parseEnvBoolean(env.VITE_UTE_SHOW_UNIFIED_EVENT_FEED)
  if (pFeed !== undefined) chromePatches.showUnifiedEventFeed = pFeed
  const pRouter = parseEnvBoolean(env.VITE_UTE_ENABLE_WORKSPACE_CONTEXT_ROUTER)
  if (pRouter !== undefined) chromePatches.enableWorkspaceContextRouter = pRouter
  const pTenantBridge = parseEnvBoolean(env.VITE_UTE_ENABLE_TENANT_CONTEXT_BRIDGE)
  if (pTenantBridge !== undefined) chromePatches.enableTenantContextBridge = pTenantBridge
  const pGlobalDiag = parseEnvBoolean(env.VITE_UTE_ENABLE_GLOBAL_DIAGNOSTICS_CENTER)
  if (pGlobalDiag !== undefined) chromePatches.enableGlobalDiagnosticsCenter = pGlobalDiag
  const pIncidentReview = parseEnvBoolean(env.VITE_UTE_ENABLE_INCIDENT_REVIEW)
  if (pIncidentReview !== undefined) chromePatches.enableIncidentReview = pIncidentReview
  const pIncidentAi = parseEnvBoolean(env.VITE_UTE_ENABLE_INCIDENT_AI_SUMMARY)
  if (pIncidentAi !== undefined) chromePatches.enableIncidentAiSummary = pIncidentAi
  const pProposalQueue = parseEnvBoolean(env.VITE_UTE_ENABLE_PROPOSAL_QUEUE)
  if (pProposalQueue !== undefined) chromePatches.enableProposalQueue = pProposalQueue
  const pProposalAi = parseEnvBoolean(env.VITE_UTE_ENABLE_PROPOSAL_AI_SUMMARY)
  if (pProposalAi !== undefined) chromePatches.enableProposalAiSummary = pProposalAi
  const pRiskGraph = parseEnvBoolean(env.VITE_UTE_ENABLE_RISK_GRAPH)
  if (pRiskGraph !== undefined) chromePatches.enableRiskGraph = pRiskGraph
  const pOpsTimeline = parseEnvBoolean(env.VITE_UTE_ENABLE_OPERATIONS_TIMELINE)
  if (pOpsTimeline !== undefined) chromePatches.enableOperationsTimeline = pOpsTimeline
  const pWhitelabel = parseEnvBoolean(env.VITE_UTE_ENABLE_WHITELABEL_PRESETS)
  if (pWhitelabel !== undefined) chromePatches.enableWhitelabelPresets = pWhitelabel
  const pWhitelabelSwitcher = parseEnvBoolean(env.VITE_UTE_ENABLE_WHITELABEL_THEME_SWITCHER)
  if (pWhitelabelSwitcher !== undefined) {
    chromePatches.enableWhitelabelThemeSwitcher = pWhitelabelSwitcher
  }
  const pWhitelabelPreview = parseEnvBoolean(env.VITE_UTE_ENABLE_WHITELABEL_PREVIEW_CENTER)
  if (pWhitelabelPreview !== undefined) {
    chromePatches.enableWhitelabelPreviewCenter = pWhitelabelPreview
  }
  const pWhitelabelAdmin = parseEnvBoolean(env.VITE_UTE_ENABLE_WHITELABEL_ADMIN_CONFIG)
  if (pWhitelabelAdmin !== undefined) {
    chromePatches.enableWhitelabelAdminConfig = pWhitelabelAdmin
  }

  if (Object.keys(chromePatches).length > 0) {
    next = { ...next, chrome: mergeChrome(next.chrome, chromePatches) }
  }

  const intPatches: Partial<UteLayoutIntegrationFlags> = {}
  const pOneAi = parseEnvBoolean(env.VITE_UTE_ONEAI_CHROME)
  if (pOneAi !== undefined) intPatches.oneAi = pOneAi
  const pMi = parseEnvBoolean(env.VITE_UTE_MOCKINVEST_CHROME)
  if (pMi !== undefined) intPatches.mockInvest = pMi
  const pGh = parseEnvBoolean(env.VITE_UTE_GAMEHUB_CHROME)
  if (pGh !== undefined) intPatches.gameHub = pGh
  const pCex = parseEnvBoolean(env.VITE_UTE_TGX_CEX_STRIP)
  if (pCex !== undefined) intPatches.tgxCexStrip = pCex
  const pSo = parseEnvBoolean(env.VITE_UTE_SPEEDORDER_CHROME)
  if (pSo !== undefined) intPatches.speedOrderChrome = pSo

  if (Object.keys(intPatches).length > 0) {
    next = { ...next, integrations: mergeIntegrations(next.integrations, intPatches) }
  }

  return next
}

function applyOverrides(
  flags: UteLayoutFeatureFlags,
  overrides: NonNullable<ResolveLayoutFlagsInput['overrides']>,
): UteLayoutFeatureFlags {
  return {
    ...flags,
    ...(overrides.layoutPreset !== undefined
      ? { layoutPreset: parseLayoutPreset(overrides.layoutPreset) }
      : {}),
    ...(overrides.readOnly !== undefined ? { readOnly: overrides.readOnly } : {}),
    ...(overrides.emergencyDisable !== undefined
      ? { emergencyDisable: overrides.emergencyDisable }
      : {}),
    chrome: overrides.chrome ? mergeChrome(flags.chrome, overrides.chrome) : flags.chrome,
    integrations: overrides.integrations
      ? mergeIntegrations(flags.integrations, overrides.integrations)
      : flags.integrations,
  }
}

function applyEmergencyProfile(flags: UteLayoutFeatureFlags): UteLayoutFeatureFlags {
  return {
    ...flags,
    layoutPreset: EMERGENCY_LAYOUT_PROFILE.layoutPreset,
    emergencyDisable: EMERGENCY_LAYOUT_PROFILE.emergencyDisable,
    chrome: mergeChrome(flags.chrome, EMERGENCY_LAYOUT_PROFILE.chrome),
    integrations: mergeIntegrations(
      flags.integrations,
      EMERGENCY_LAYOUT_PROFILE.integrations,
    ),
  }
}

function computeForceMobileStack(
  layoutPreset: LayoutPreset,
  viewportIsMobile: boolean | undefined,
): boolean {
  if (layoutPreset === 'mobile') return true
  if (viewportIsMobile === true && layoutPreset === 'hts') return true
  return false
}

/**
 * Merge DEFAULT → env (or `input.env`) → overrides → emergency profile (if enabled).
 * Does not touch trading store, adapters, or localStorage.
 */
export function resolveEffectiveLayoutFlags(
  input?: ResolveLayoutFlagsInput,
): EffectiveLayoutFlags {
  const envRecord =
    input && 'env' in input && input.env !== undefined
      ? input.env
      : readLayoutFlagsFromViteEnv()

  let flags = applyEnvRecord(
    {
      ...DEFAULT_LAYOUT_FLAGS,
      chrome: { ...DEFAULT_LAYOUT_FLAGS.chrome },
      integrations: { ...DEFAULT_LAYOUT_FLAGS.integrations },
    },
    envRecord,
  )

  if (input?.overrides) {
    flags = applyOverrides(flags, input.overrides)
  }

  if (flags.emergencyDisable) {
    flags = applyEmergencyProfile(flags)
  }

  const forceMobileStack = computeForceMobileStack(
    flags.layoutPreset,
    input?.viewportIsMobile,
  )

  return { ...flags, forceMobileStack }
}
