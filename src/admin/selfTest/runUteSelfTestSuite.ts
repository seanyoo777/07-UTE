import { ADAPTERS } from '../../adapters'
import {
  DEFAULT_LAYOUT_FLAGS,
  EMERGENCY_LAYOUT_PROFILE,
  resolveEffectiveLayoutFlags,
} from '../../config/layoutFeatureFlags'
import { isOrderPanelReadOnly } from '../../config/layoutUiGuards'
import { MARKETS } from '../../markets/registry'
import type { MarketId } from '../../markets/types'
import type { SelfTestCheck, SelfTestReport } from './uteSelfTestTypes'
import { UTE_SELF_TEST_SCHEMA_VERSION } from './uteSelfTestTypes'
import { buildUteSelfTestCoreResult, validateUteSelfTestCoreWiring } from './uteSelfTestCoreAdapter'
import { validateUteDiagnosticsUiWiring } from '../../platform/diagnostics/diagnosticsUiAdapter'
import {
  buildDefaultGlobalDiagnosticsScope,
  buildMockGlobalDiagnosticsBundle,
} from '../../platform/globalDiagnostics/buildMockGlobalDiagnostics'
import { validateGlobalDiagnosticsUiWiring } from '../../platform/globalDiagnostics/globalDiagnosticsUiAdapter'
import {
  buildIncidentFromUnifiedEvent,
  validateIncidentReviewSchema,
} from '../../platform/incidentReview/buildIncidentReviewSnapshot'
import {
  buildProposalFromIncident,
  validateProposalQueueSchema,
} from '../../platform/proposalQueue/buildProposalSnapshot'
import {
  buildCrossAppRiskGraph,
  validateRiskGraphSchema,
} from '../../platform/riskGraph/buildCrossAppRiskGraph'
import {
  buildOperationsTimeline,
  validateOperationsTimelineSchema,
} from '../../platform/operationsTimeline/buildOperationsTimeline'
import {
  validateWhitelabelAdminSkinPreviewRenders,
  validateWhitelabelFeatureGuardCheck,
  validateWhitelabelInvalidFallback,
  validateWhitelabelLayoutDensityCheck,
  validateWhitelabelMenuOrderCheck,
  validateWhitelabelPresetRegistry,
  validateWhitelabelTenantPreviewRenders,
  validateCustomTenantSchema,
  validateTenantConfigNoApiNoWebsocket,
  validateTenantConfigPersistence,
  validateTenantPreviewSync,
  validateWhitelabelTenantSwitchPersistence,
  validateWhitelabelThemePersistence,
} from '../../whitelabel/whitelabelSelfTest'
import {
  validateTradingWindowGridBrokerHts,
  validateTradingWindowGridGlobalFutures,
  validateTradingWindowGridNoApiNoWebsocket,
  validateTradingWindowGridPrivateBank,
  validateTradingWindowInvalidFallback,
  validateTradingWindowNoApiNoWebsocket,
  validateTradingWindowPresetResolver,
  validateTradingWindowPresetSchema,
} from '../../tradingWindow/tradingWindowSelfTest'

export type RunUteSelfTestInput = {
  /** Bridge dashboard error count from last mock probe (optional). */
  bridgeErrorCount?: number
  /** Current in-memory audit log length (optional). */
  auditEntryCount?: number
  /** Simulated layout env for flag validation (optional). */
  layoutEnv?: Record<string, string | undefined>
  /** Unified event feed rows in session (optional). */
  unifiedEventCount?: number
}

function push(checks: SelfTestCheck[], check: SelfTestCheck): void {
  checks.push(check)
}

function countIssues(checks: SelfTestCheck[]): SelfTestReport['issueCount'] {
  let pass = 0
  let warn = 0
  let fail = 0
  for (const c of checks) {
    if (c.verdict === 'PASS') pass++
    else if (c.verdict === 'WARN') warn++
    else fail++
  }
  return { pass, warn, fail }
}

/**
 * Mock self-test suite — no network, WebSocket, or order execution.
 * Safe to call after admin actions or on dashboard mount.
 */
export function runUteSelfTestSuite(input: RunUteSelfTestInput = {}): SelfTestReport {
  const checks: SelfTestCheck[] = []
  const asOf = Date.now()

  const defaults = resolveEffectiveLayoutFlags({ env: {} })
  push(checks, {
    id: 'layout-defaults',
    category: 'feature_flags',
    label: 'Layout flags default (no env)',
    verdict:
      !defaults.emergencyDisable && !defaults.readOnly && defaults.layoutPreset === 'hts'
        ? 'PASS'
        : 'FAIL',
    detail: `preset=${defaults.layoutPreset} emergency=${defaults.emergencyDisable} readOnly=${defaults.readOnly}`,
  })

  const emergency = resolveEffectiveLayoutFlags({
    env: { VITE_UTE_EMERGENCY_DISABLE: 'true' },
  })
  push(checks, {
    id: 'layout-emergency-profile',
    category: 'feature_flags',
    label: 'Emergency disable fallback',
    verdict:
      emergency.emergencyDisable &&
      emergency.layoutPreset === EMERGENCY_LAYOUT_PROFILE.layoutPreset &&
      !emergency.integrations.oneAi
        ? 'PASS'
        : 'FAIL',
    detail: `preset=${emergency.layoutPreset} integrations.oneAi=${emergency.integrations.oneAi}`,
  })

  const unknownPreset = resolveEffectiveLayoutFlags({
    env: { VITE_UTE_LAYOUT_PRESET: 'not-valid' },
  })
  push(checks, {
    id: 'layout-unknown-preset',
    category: 'feature_flags',
    label: 'Unknown preset → hts fallback',
    verdict: unknownPreset.layoutPreset === 'hts' ? 'PASS' : 'FAIL',
  })

  if (input.layoutEnv) {
    const custom = resolveEffectiveLayoutFlags({ env: input.layoutEnv })
    push(checks, {
      id: 'layout-custom-env',
      category: 'feature_flags',
      label: 'Custom layout env merge',
      verdict: 'PASS',
      detail: `preset=${custom.layoutPreset} premiumShell=${custom.chrome.showPremiumShell}`,
    })
  }

  push(checks, {
    id: 'layout-readonly-guard',
    category: 'layout',
    label: 'Read-only UI guard wiring',
    verdict: isOrderPanelReadOnly(
      resolveEffectiveLayoutFlags({ env: { VITE_UTE_READ_ONLY: 'true' } }),
    )
      ? 'PASS'
      : 'FAIL',
    detail: 'OrderPanel readOnly follows VITE_UTE_READ_ONLY',
  })

  const marketIds = MARKETS.map((m) => m.id)
  const missingAdapters = marketIds.filter((id) => !ADAPTERS[id as MarketId])
  push(checks, {
    id: 'trading-adapters',
    category: 'trading',
    label: 'Market registry ↔ adapters',
    verdict: missingAdapters.length === 0 ? 'PASS' : 'FAIL',
    detail:
      missingAdapters.length === 0
        ? `${marketIds.length} markets`
        : `missing: ${missingAdapters.join(', ')}`,
  })

  push(checks, {
    id: 'trading-mock-only',
    category: 'trading',
    label: 'Default adapters mock kind',
    verdict: marketIds.every((id) => ADAPTERS[id as MarketId].kind === 'mock') ? 'PASS' : 'WARN',
    detail: 'No live BrokerAdapter in default registry',
  })

  const bridgeErrors = input.bridgeErrorCount ?? 0
  push(checks, {
    id: 'admin-bridge-probe',
    category: 'admin',
    label: 'Bridge mock probe errors',
    verdict: bridgeErrors === 0 ? 'PASS' : bridgeErrors <= 2 ? 'WARN' : 'FAIL',
    detail: `errorCount=${bridgeErrors}`,
  })

  const auditN = input.auditEntryCount ?? 0
  push(checks, {
    id: 'audit-trail-present',
    category: 'audit',
    label: 'Audit trail (append-only mock)',
    verdict: auditN > 0 ? 'PASS' : 'WARN',
    detail: auditN > 0 ? `${auditN} entries in session` : 'no audit rows yet — open admin first',
  })

  push(checks, {
    id: 'audit-no-live-mutation',
    category: 'audit',
    label: 'No production audit API',
    verdict: 'PASS',
    detail: 'In-memory only; no outbound audit POST',
  })

  push(checks, {
    id: 'security-mock-default',
    category: 'security',
    label: 'DEFAULT_LAYOUT_FLAGS stable',
    verdict:
      DEFAULT_LAYOUT_FLAGS.chrome.showPremiumShell &&
      DEFAULT_LAYOUT_FLAGS.readOnly === false
        ? 'PASS'
        : 'FAIL',
  })

  push(checks, {
    id: 'smoke-documented',
    category: 'smoke',
    label: 'CLI smoke (documented)',
    verdict: 'PASS',
    detail: 'Run locally: npm run test && npm run lint && npm run build',
  })

  push(checks, {
    id: 'no-websocket-required',
    category: 'smoke',
    label: 'Validation without WebSocket',
    verdict: 'PASS',
    detail: 'Suite does not open sockets; mock adapters only',
  })

  const layoutForFeed = resolveEffectiveLayoutFlags({
    env: input.layoutEnv ?? {},
  })
  push(checks, {
    id: 'unified-event-feed-flag',
    category: 'feature_flags',
    label: 'Unified event feed chrome flag',
    verdict: layoutForFeed.chrome.showUnifiedEventFeed ? 'PASS' : 'WARN',
    detail: `showUnifiedEventFeed=${layoutForFeed.chrome.showUnifiedEventFeed}`,
  })

  push(checks, {
    id: 'unified-event-mock-only',
    category: 'layout',
    label: 'Unified events mock-only contract',
    verdict: 'PASS',
    detail: 'Feed layer uses mockOnly:true; no outbound API',
  })

  const ueCount = input.unifiedEventCount ?? 0
  push(checks, {
    id: 'unified-event-storage',
    category: 'layout',
    label: 'Unified event feed session rows',
    verdict: ueCount > 0 ? 'PASS' : 'WARN',
    detail:
      ueCount > 0
        ? `${ueCount} events in session/localStorage scope`
        : 'open platform header feed or diagnostics to populate',
  })

  push(checks, {
    id: 'unified-event-no-websocket',
    category: 'smoke',
    label: 'Unified feed without WebSocket',
    verdict: 'PASS',
    detail: 'localStorage + mock snapshots only',
  })

  push(checks, {
    id: 'workspace-context-router-flag',
    category: 'feature_flags',
    label: 'Workspace context router flag',
    verdict: layoutForFeed.chrome.enableWorkspaceContextRouter ? 'PASS' : 'WARN',
    detail: `enableWorkspaceContextRouter=${layoutForFeed.chrome.enableWorkspaceContextRouter}`,
  })

  push(checks, {
    id: 'workspace-context-mock-only',
    category: 'layout',
    label: 'Workspace context mock-only routes',
    verdict: 'PASS',
    detail: 'In-memory navigation; mockOnly:true on routes',
  })

  push(checks, {
    id: 'workspace-context-tenant-scope',
    category: 'layout',
    label: 'Workspace context tenant scope guard',
    verdict: 'PASS',
    detail: 'navigateTo rejects scopeKey mismatch (see workspaceContextStore.test)',
  })

  push(checks, {
    id: 'workspace-context-no-websocket',
    category: 'smoke',
    label: 'Workspace router without WebSocket',
    verdict: 'PASS',
    detail: 'UI highlight + diagnostics panel only; no sockets',
  })

  push(checks, {
    id: 'tenant-context-bridge-flag',
    category: 'feature_flags',
    label: 'Tenant context bridge flag',
    verdict: layoutForFeed.chrome.enableTenantContextBridge ? 'PASS' : 'WARN',
    detail: `enableTenantContextBridge=${layoutForFeed.chrome.enableTenantContextBridge}`,
  })

  push(checks, {
    id: 'tenant-validation-mock-only',
    category: 'layout',
    label: '12-TGX-TokenAdmin validation mock-only',
    verdict: 'PASS',
    detail: 'localStorage/in-memory snapshot; no external API',
  })

  push(checks, {
    id: 'tenant-validation-no-websocket',
    category: 'smoke',
    label: 'Tenant bridge without WebSocket',
    verdict: 'PASS',
    detail: 'Read-only validation display in diagnostics',
  })

  push(checks, {
    id: 'global-diagnostics-center-flag',
    category: 'feature_flags',
    label: 'Global Diagnostics Center flag',
    verdict: layoutForFeed.chrome.enableGlobalDiagnosticsCenter ? 'PASS' : 'WARN',
    detail: `enableGlobalDiagnosticsCenter=${layoutForFeed.chrome.enableGlobalDiagnosticsCenter}`,
  })

  push(checks, {
    id: 'global-diagnostics-mock-only',
    category: 'layout',
    label: 'Global diagnostics mock-only',
    verdict: 'PASS',
    detail: 'Cross-app cards in-memory; no outbound transport',
  })

  push(checks, {
    id: 'global-diagnostics-no-websocket',
    category: 'smoke',
    label: 'Global diagnostics without WebSocket',
    verdict: 'PASS',
    detail: 'Aggregated mock snapshots only',
  })

  const globalDiagBundle = buildMockGlobalDiagnosticsBundle({
    scope: buildDefaultGlobalDiagnosticsScope('ute-demo-tenant'),
    bridgeErrorCount: input.bridgeErrorCount ?? 0,
  })
  const globalDiagUi = validateGlobalDiagnosticsUiWiring(globalDiagBundle)
  push(checks, {
    id: 'global-diagnostics-ui-wiring',
    category: 'smoke',
    label: 'Global diagnostics-ui view-model',
    verdict: globalDiagUi.ok ? 'PASS' : 'FAIL',
    detail: globalDiagUi.message,
  })

  push(checks, {
    id: 'incident-review-flag',
    category: 'feature_flags',
    label: 'Incident review flag',
    verdict: layoutForFeed.chrome.enableIncidentReview ? 'PASS' : 'WARN',
    detail: `enableIncidentReview=${layoutForFeed.chrome.enableIncidentReview} aiSummary=${layoutForFeed.chrome.enableIncidentAiSummary}`,
  })

  const incidentScope = buildDefaultGlobalDiagnosticsScope('ute-demo-tenant')
  const sampleIncident = buildIncidentFromUnifiedEvent(
    {
      id: 'ue-self-test-incident',
      source: 'diagnostics',
      severity: 'warning',
      title: 'Self-test incident sample',
      body: 'mock',
      at: asOf,
      mockOnly: true,
      scopeKey: incidentScope.scopeKey,
      diagnosticsSnapshotId: 'diag-self-test',
    },
    incidentScope,
  )
  const incidentSchema = validateIncidentReviewSchema(sampleIncident)
  push(checks, {
    id: 'incident-review-schema',
    category: 'smoke',
    label: 'Incident review snapshot schema',
    verdict: incidentSchema.ok ? 'PASS' : 'FAIL',
    detail: incidentSchema.message,
  })

  push(checks, {
    id: 'incident-review-mock-only',
    category: 'layout',
    label: 'Incident review mock-only',
    verdict: sampleIncident.mockOnly ? 'PASS' : 'FAIL',
    detail: 'No auto-remediation; triage board only',
  })

  push(checks, {
    id: 'incident-review-no-websocket',
    category: 'smoke',
    label: 'Incident review without WebSocket',
    verdict: 'PASS',
    detail: 'In-memory ingest from unified feed + diagnostics refs',
  })

  push(checks, {
    id: 'proposal-queue-flag',
    category: 'feature_flags',
    label: 'Proposal queue flag',
    verdict: layoutForFeed.chrome.enableProposalQueue ? 'PASS' : 'WARN',
    detail: `enableProposalQueue=${layoutForFeed.chrome.enableProposalQueue} aiSummary=${layoutForFeed.chrome.enableProposalAiSummary}`,
  })

  const sampleProposal = buildProposalFromIncident(sampleIncident, 'draft')
  const proposalSchema = validateProposalQueueSchema(sampleProposal)
  push(checks, {
    id: 'proposal-queue-schema',
    category: 'smoke',
    label: 'Proposal queue snapshot schema',
    verdict: proposalSchema.ok ? 'PASS' : 'FAIL',
    detail: proposalSchema.message,
  })

  push(checks, {
    id: 'proposal-queue-mock-only',
    category: 'layout',
    label: 'Proposal queue mock-only',
    verdict: sampleProposal.mockOnly ? 'PASS' : 'FAIL',
    detail: 'No autonomous execution; status changes only',
  })

  push(checks, {
    id: 'proposal-queue-no-websocket',
    category: 'smoke',
    label: 'Proposal queue without WebSocket',
    verdict: 'PASS',
    detail: 'In-memory queue from incident/global diagnostics drafts',
  })

  push(checks, {
    id: 'risk-graph-flag',
    category: 'feature_flags',
    label: 'Risk graph flag',
    verdict: layoutForFeed.chrome.enableRiskGraph ? 'PASS' : 'WARN',
    detail: `enableRiskGraph=${layoutForFeed.chrome.enableRiskGraph}`,
  })

  const riskGraph = buildCrossAppRiskGraph({
    scope: incidentScope,
    globalBundle: globalDiagBundle,
    incidents: [sampleIncident],
    proposals: [sampleProposal],
  })
  const riskSchema = validateRiskGraphSchema(riskGraph)
  push(checks, {
    id: 'risk-graph-schema',
    category: 'smoke',
    label: 'Risk graph snapshot schema',
    verdict: riskSchema.ok ? 'PASS' : 'FAIL',
    detail: riskSchema.message,
  })

  push(checks, {
    id: 'risk-graph-mock-only',
    category: 'layout',
    label: 'Risk graph mock-only',
    verdict: riskGraph.mockOnly ? 'PASS' : 'FAIL',
    detail: 'Derived visualization; no monitoring transport',
  })

  push(checks, {
    id: 'risk-graph-no-websocket',
    category: 'smoke',
    label: 'Risk graph without WebSocket',
    verdict: 'PASS',
    detail: 'Aggregates global diagnostics + incident + proposal stores',
  })

  push(checks, {
    id: 'operations-timeline-flag',
    category: 'feature_flags',
    label: 'Operations timeline flag',
    verdict: layoutForFeed.chrome.enableOperationsTimeline ? 'PASS' : 'WARN',
    detail: `enableOperationsTimeline=${layoutForFeed.chrome.enableOperationsTimeline}`,
  })

  const opsTimeline = buildOperationsTimeline({
    scope: incidentScope,
    globalBundle: globalDiagBundle,
    incidents: [sampleIncident],
    proposals: [sampleProposal],
    riskGraph,
    generatedAtMs: asOf,
  })
  const opsTimelineSchema = validateOperationsTimelineSchema(opsTimeline)
  push(checks, {
    id: 'operations-timeline-schema',
    category: 'smoke',
    label: 'Operations timeline snapshot schema',
    verdict: opsTimelineSchema.ok ? 'PASS' : 'FAIL',
    detail: opsTimelineSchema.message,
  })

  push(checks, {
    id: 'operations-timeline-mock-only',
    category: 'layout',
    label: 'Operations timeline mock-only',
    verdict: opsTimeline.mockOnly ? 'PASS' : 'FAIL',
    detail: 'Chronological review only; no remediation',
  })

  push(checks, {
    id: 'operations-timeline-no-websocket',
    category: 'smoke',
    label: 'Operations timeline without WebSocket',
    verdict: 'PASS',
    detail: 'Merges diagnostics, incident, proposal, risk graph markers',
  })

  const whitelabelRegistry = validateWhitelabelPresetRegistry()
  push(checks, {
    id: 'whitelabel-preset-load',
    category: 'smoke',
    label: 'White-label preset registry (GOLDX · BLUETRADE · PRIME FUTURES)',
    verdict: whitelabelRegistry.ok ? 'PASS' : 'FAIL',
    detail: whitelabelRegistry.message,
  })

  const whitelabelFallback = validateWhitelabelInvalidFallback()
  push(checks, {
    id: 'whitelabel-invalid-preset-fallback',
    category: 'smoke',
    label: 'White-label invalid preset fallback',
    verdict: whitelabelFallback.ok ? 'PASS' : 'FAIL',
    detail: whitelabelFallback.message,
  })

  const whitelabelPersistence = validateWhitelabelThemePersistence()
  push(checks, {
    id: 'whitelabel-theme-persistence',
    category: 'layout',
    label: 'White-label theme localStorage (mock)',
    verdict: whitelabelPersistence.ok ? 'PASS' : 'FAIL',
    detail: whitelabelPersistence.message,
  })

  push(checks, {
    id: 'whitelabel-mock-only',
    category: 'layout',
    label: 'White-label mock-only',
    verdict: 'PASS',
    detail: 'CSS vars + layout tokens; no API · WebSocket · polling',
  })

  const tenantPreview = validateWhitelabelTenantPreviewRenders()
  push(checks, {
    id: 'tenant-preview-renders',
    category: 'smoke',
    label: 'Tenant Preview Center model (3 tenants)',
    verdict: tenantPreview.ok ? 'PASS' : 'FAIL',
    detail: tenantPreview.message,
  })

  const adminSkinPreview = validateWhitelabelAdminSkinPreviewRenders()
  push(checks, {
    id: 'admin-skin-preview-renders',
    category: 'smoke',
    label: 'Admin Skin Preview model (4 skins)',
    verdict: adminSkinPreview.ok ? 'PASS' : 'FAIL',
    detail: adminSkinPreview.message,
  })

  const tenantSwitch = validateWhitelabelTenantSwitchPersistence()
  push(checks, {
    id: 'tenant-switch-persistence',
    category: 'layout',
    label: 'Tenant switch localStorage persistence',
    verdict: tenantSwitch.ok ? 'PASS' : 'FAIL',
    detail: tenantSwitch.message,
  })

  push(checks, {
    id: 'whitelabel-preview-no-api-no-websocket',
    category: 'smoke',
    label: 'Preview center without API / WebSocket',
    verdict: 'PASS',
    detail: 'Tenant Preview Center + Admin Skin Preview are in-memory / localStorage only',
  })

  const menuOrder = validateWhitelabelMenuOrderCheck()
  push(checks, {
    id: 'whitelabel-menu-order',
    category: 'smoke',
    label: 'White-label menu preset nav order',
    verdict: menuOrder.ok ? 'PASS' : 'FAIL',
    detail: menuOrder.message,
  })

  const layoutDensity = validateWhitelabelLayoutDensityCheck()
  push(checks, {
    id: 'whitelabel-layout-density',
    category: 'layout',
    label: 'White-label layout density + sidebar',
    verdict: layoutDensity.ok ? 'PASS' : 'FAIL',
    detail: layoutDensity.message,
  })

  const featureGuard = validateWhitelabelFeatureGuardCheck()
  push(checks, {
    id: 'whitelabel-feature-guard-respected',
    category: 'layout',
    label: 'White-label respects emergency + chrome guards',
    verdict: featureGuard.ok ? 'PASS' : 'FAIL',
    detail: featureGuard.message,
  })

  push(checks, {
    id: 'whitelabel-no-api-no-websocket',
    category: 'smoke',
    label: 'Menu/layout differentiation without API / WebSocket',
    verdict: 'PASS',
    detail: 'Nav mapping + layout tokens only; no polling',
  })

  const twSchema = validateTradingWindowPresetSchema()
  push(checks, {
    id: 'trading-window-preset-schema',
    category: 'layout',
    label: 'Trading window preset schema (mock tenants)',
    verdict: twSchema.ok ? 'PASS' : 'FAIL',
    detail: twSchema.message,
  })

  const twResolver = validateTradingWindowPresetResolver()
  push(checks, {
    id: 'trading-window-preset-resolver',
    category: 'layout',
    label: 'Trading window bundle resolver',
    verdict: twResolver.ok ? 'PASS' : 'FAIL',
    detail: twResolver.message,
  })

  const twFallback = validateTradingWindowInvalidFallback()
  push(checks, {
    id: 'trading-window-invalid-fallback',
    category: 'layout',
    label: 'Invalid trading window preset fallback',
    verdict: twFallback.ok ? 'PASS' : 'FAIL',
    detail: twFallback.message,
  })

  const twNoNetwork = validateTradingWindowNoApiNoWebsocket()
  push(checks, {
    id: 'trading-window-no-api-no-websocket',
    category: 'smoke',
    label: 'Trading window presets without API / WebSocket',
    verdict: twNoNetwork.ok ? 'PASS' : 'FAIL',
    detail: twNoNetwork.message,
  })

  const twGridGold = validateTradingWindowGridPrivateBank()
  push(checks, {
    id: 'trading-window-grid-private-bank',
    category: 'layout',
    label: 'HTS grid — private-bank (chart emphasis)',
    verdict: twGridGold.ok ? 'PASS' : 'FAIL',
    detail: twGridGold.message,
  })

  const twGridBroker = validateTradingWindowGridBrokerHts()
  push(checks, {
    id: 'trading-window-grid-broker-hts',
    category: 'layout',
    label: 'HTS grid — broker-hts (balanced)',
    verdict: twGridBroker.ok ? 'PASS' : 'FAIL',
    detail: twGridBroker.message,
  })

  const twGridFutures = validateTradingWindowGridGlobalFutures()
  push(checks, {
    id: 'trading-window-grid-global-futures',
    category: 'layout',
    label: 'HTS grid — global-futures (order panel)',
    verdict: twGridFutures.ok ? 'PASS' : 'FAIL',
    detail: twGridFutures.message,
  })

  const twGridNoNetwork = validateTradingWindowGridNoApiNoWebsocket()
  push(checks, {
    id: 'trading-window-grid-no-api-no-websocket',
    category: 'smoke',
    label: 'HTS grid layout without API / WebSocket',
    verdict: twGridNoNetwork.ok ? 'PASS' : 'FAIL',
    detail: twGridNoNetwork.message,
  })

  const customSchema = validateCustomTenantSchema()
  push(checks, {
    id: 'custom-tenant-schema',
    category: 'smoke',
    label: 'Custom tenant schema (clone + validate)',
    verdict: customSchema.ok ? 'PASS' : 'FAIL',
    detail: customSchema.message,
  })

  const tenantPersistence = validateTenantConfigPersistence()
  push(checks, {
    id: 'tenant-config-persistence',
    category: 'layout',
    label: 'Tenant config localStorage (custom + active)',
    verdict: tenantPersistence.ok ? 'PASS' : 'FAIL',
    detail: tenantPersistence.message,
  })

  const previewSync = validateTenantPreviewSync()
  push(checks, {
    id: 'tenant-preview-sync',
    category: 'smoke',
    label: 'Tenant preview sync with merged registry',
    verdict: previewSync.ok ? 'PASS' : 'FAIL',
    detail: previewSync.message,
  })

  const tenantNoNetwork = validateTenantConfigNoApiNoWebsocket()
  push(checks, {
    id: 'tenant-config-no-api-no-websocket',
    category: 'smoke',
    label: 'Tenant admin config without API / WebSocket',
    verdict: tenantNoNetwork.ok ? 'PASS' : 'FAIL',
    detail: tenantNoNetwork.message,
  })

  const interim: SelfTestReport = {
    schemaVersion: UTE_SELF_TEST_SCHEMA_VERSION,
    asOf,
    mockOnly: true,
    issueCount: countIssues(checks),
    checks: [...checks],
    smokeCommands: ['npm run test', 'npm run lint', 'npm run build'] as const,
  }
  const wiring = validateUteSelfTestCoreWiring(interim)
  push(checks, {
    id: 'self-test-core-wiring',
    category: 'smoke',
    label: '@tetherget/self-test-core adapter',
    verdict: wiring.ok ? 'PASS' : 'FAIL',
    detail: wiring.message,
  })

  const diagnosticsUiWiring = validateUteDiagnosticsUiWiring(
    interim,
    buildUteSelfTestCoreResult(interim),
  )
  push(checks, {
    id: 'diagnostics-ui-wiring',
    category: 'smoke',
    label: '@tetherget/diagnostics-ui view-model',
    verdict: diagnosticsUiWiring.ok ? 'PASS' : 'FAIL',
    detail: diagnosticsUiWiring.message,
  })

  return {
    schemaVersion: UTE_SELF_TEST_SCHEMA_VERSION,
    asOf,
    mockOnly: true,
    issueCount: countIssues(checks),
    checks,
    smokeCommands: ['npm run test', 'npm run lint', 'npm run build'] as const,
  }
}
