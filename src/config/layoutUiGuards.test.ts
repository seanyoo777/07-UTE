import { describe, expect, it } from 'vitest'
import { DEFAULT_LAYOUT_FLAGS, resolveEffectiveLayoutFlags } from './layoutFeatureFlags'
import {
  getLayoutModeBannerCopy,
  isOrderPanelReadOnly,
  shouldShowBottomDock,
  shouldShowChromeSidebar,
  shouldShowHtsTopBar,
  shouldShowIntegrationBadge,
  shouldShowIntegrationSlot,
  shouldShowMarketDeck,
  shouldShowNotificationSlot,
  shouldShowUnifiedEventFeed,
  shouldEnableWorkspaceContextRouter,
  shouldEnableGlobalDiagnosticsCenter,
  shouldEnableIncidentReview,
  shouldEnableIncidentAiSummary,
  shouldEnableProposalQueue,
  shouldEnableProposalAiSummary,
  shouldEnableRiskGraph,
  shouldEnableOperationsTimeline,
  shouldEnableTenantContextBridge,
  shouldShowPremiumShell,
} from './layoutUiGuards'

describe('layoutUiGuards', () => {
  it('defaults match full chrome', () => {
    const f = resolveEffectiveLayoutFlags({ env: {} })
    expect(shouldShowIntegrationBadge(f)).toBe(true)
    expect(shouldShowBottomDock(f)).toBe(true)
    expect(isOrderPanelReadOnly(f)).toBe(false)
    expect(getLayoutModeBannerCopy(f).show).toBe(false)
  })

  it('readOnly enables order panel guard and banner', () => {
    const f = resolveEffectiveLayoutFlags({
      env: { VITE_UTE_READ_ONLY: 'true' },
    })
    expect(isOrderPanelReadOnly(f)).toBe(true)
    expect(getLayoutModeBannerCopy(f).show).toBe(true)
    expect(getLayoutModeBannerCopy(f).tone).toBe('readonly')
  })

  it('emergency hides integration badge and bottom dock', () => {
    const f = resolveEffectiveLayoutFlags({
      env: { VITE_UTE_EMERGENCY_DISABLE: 'true' },
    })
    expect(shouldShowIntegrationBadge(f)).toBe(false)
    expect(shouldShowBottomDock(f)).toBe(false)
    expect(getLayoutModeBannerCopy(f).show).toBe(true)
    expect(getLayoutModeBannerCopy(f).tone).toBe('emergency')
  })

  it('emergency + readOnly shows combined banner tone', () => {
    const f = resolveEffectiveLayoutFlags({
      env: {
        VITE_UTE_EMERGENCY_DISABLE: 'true',
        VITE_UTE_READ_ONLY: 'true',
      },
    })
    expect(getLayoutModeBannerCopy(f).tone).toBe('both')
  })

  it('DEFAULT_LAYOUT_FLAGS keeps readOnly and emergency off', () => {
    expect(DEFAULT_LAYOUT_FLAGS.readOnly).toBe(false)
    expect(DEFAULT_LAYOUT_FLAGS.emergencyDisable).toBe(false)
  })

  it('defaults enable full shell chrome', () => {
    const f = resolveEffectiveLayoutFlags({ env: {} })
    expect(shouldShowPremiumShell(f)).toBe(true)
    expect(shouldShowHtsTopBar(f)).toBe(true)
    expect(shouldShowMarketDeck(f)).toBe(true)
    expect(shouldShowChromeSidebar(f)).toBe(true)
    expect(shouldShowIntegrationSlot(f, 'speedOrderChrome')).toBe(true)
  })

  it('env can hide premium shell chrome pieces', () => {
    const f = resolveEffectiveLayoutFlags({
      env: {
        VITE_UTE_SHOW_PREMIUM_SHELL: 'false',
        VITE_UTE_SHOW_HTS_TOPBAR: 'false',
        VITE_UTE_SHOW_MARKET_DECK: 'false',
        VITE_UTE_SHOW_SIDEBAR: 'false',
        VITE_UTE_SPEEDORDER_CHROME: 'false',
      },
    })
    expect(shouldShowPremiumShell(f)).toBe(false)
    expect(shouldShowHtsTopBar(f)).toBe(false)
    expect(shouldShowMarketDeck(f)).toBe(false)
    expect(shouldShowChromeSidebar(f)).toBe(false)
    expect(shouldShowIntegrationSlot(f, 'speedOrderChrome')).toBe(false)
  })

  it('env can hide platform notification slot', () => {
    const f = resolveEffectiveLayoutFlags({
      env: { VITE_UTE_SHOW_NOTIFICATION_SLOT: 'false' },
    })
    expect(shouldShowNotificationSlot(f)).toBe(false)
  })

  it('env can hide unified event feed', () => {
    const f = resolveEffectiveLayoutFlags({
      env: { VITE_UTE_SHOW_UNIFIED_EVENT_FEED: 'false' },
    })
    expect(shouldShowUnifiedEventFeed(f)).toBe(false)
  })

  it('emergency profile disables unified event feed', () => {
    const f = resolveEffectiveLayoutFlags({
      env: { VITE_UTE_EMERGENCY_DISABLE: 'true' },
    })
    expect(shouldShowUnifiedEventFeed(f)).toBe(false)
  })

  it('env can disable workspace context router', () => {
    const f = resolveEffectiveLayoutFlags({
      env: { VITE_UTE_ENABLE_WORKSPACE_CONTEXT_ROUTER: 'false' },
    })
    expect(shouldEnableWorkspaceContextRouter(f)).toBe(false)
  })

  it('env can disable tenant context bridge', () => {
    const f = resolveEffectiveLayoutFlags({
      env: { VITE_UTE_ENABLE_TENANT_CONTEXT_BRIDGE: 'false' },
    })
    expect(shouldEnableTenantContextBridge(f)).toBe(false)
  })

  it('env can disable global diagnostics center', () => {
    const f = resolveEffectiveLayoutFlags({
      env: { VITE_UTE_ENABLE_GLOBAL_DIAGNOSTICS_CENTER: 'false' },
    })
    expect(shouldEnableGlobalDiagnosticsCenter(f)).toBe(false)
  })

  it('emergency profile disables global diagnostics center', () => {
    const f = resolveEffectiveLayoutFlags({
      env: { VITE_UTE_EMERGENCY_DISABLE: 'true' },
    })
    expect(shouldEnableGlobalDiagnosticsCenter(f)).toBe(false)
  })

  it('env can disable incident review', () => {
    const f = resolveEffectiveLayoutFlags({
      env: { VITE_UTE_ENABLE_INCIDENT_REVIEW: 'false' },
    })
    expect(shouldEnableIncidentReview(f)).toBe(false)
  })

  it('emergency profile disables incident review and AI summary', () => {
    const f = resolveEffectiveLayoutFlags({
      env: { VITE_UTE_EMERGENCY_DISABLE: 'true' },
    })
    expect(shouldEnableIncidentReview(f)).toBe(false)
    expect(shouldEnableIncidentAiSummary(f)).toBe(false)
  })

  it('env can disable proposal queue', () => {
    const f = resolveEffectiveLayoutFlags({
      env: { VITE_UTE_ENABLE_PROPOSAL_QUEUE: 'false' },
    })
    expect(shouldEnableProposalQueue(f)).toBe(false)
  })

  it('emergency profile disables proposal queue', () => {
    const f = resolveEffectiveLayoutFlags({
      env: { VITE_UTE_EMERGENCY_DISABLE: 'true' },
    })
    expect(shouldEnableProposalQueue(f)).toBe(false)
    expect(shouldEnableProposalAiSummary(f)).toBe(false)
  })

  it('env can disable risk graph', () => {
    const f = resolveEffectiveLayoutFlags({
      env: { VITE_UTE_ENABLE_RISK_GRAPH: 'false' },
    })
    expect(shouldEnableRiskGraph(f)).toBe(false)
  })

  it('emergency profile disables risk graph', () => {
    const f = resolveEffectiveLayoutFlags({
      env: { VITE_UTE_EMERGENCY_DISABLE: 'true' },
    })
    expect(shouldEnableRiskGraph(f)).toBe(false)
  })

  it('env can disable operations timeline', () => {
    const f = resolveEffectiveLayoutFlags({
      env: { VITE_UTE_ENABLE_OPERATIONS_TIMELINE: 'false' },
    })
    expect(shouldEnableOperationsTimeline(f)).toBe(false)
  })

  it('emergency profile disables operations timeline', () => {
    const f = resolveEffectiveLayoutFlags({
      env: { VITE_UTE_EMERGENCY_DISABLE: 'true' },
    })
    expect(shouldEnableOperationsTimeline(f)).toBe(false)
  })
})
