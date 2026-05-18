import type { EffectiveLayoutFlags, UteLayoutIntegrationFlags } from './layoutFeatureFlags'

/** Premium shell wrapper (`UtePremiumTradingShell`). */
export function shouldShowPremiumShell(
  flags: Pick<EffectiveLayoutFlags, 'chrome'>,
): boolean {
  return flags.chrome.showPremiumShell
}

/** `HtsTopBar` (App trading route). */
export function shouldShowHtsTopBar(flags: Pick<EffectiveLayoutFlags, 'chrome'>): boolean {
  return flags.chrome.showHtsTopBar
}

/** Premium shell market deck tabs. */
export function shouldShowMarketDeck(flags: Pick<EffectiveLayoutFlags, 'chrome'>): boolean {
  return flags.chrome.showMarketDeck
}

/** Premium shell rail + `MarketSidebar` in `HtsLayout`. */
export function shouldShowChromeSidebar(flags: Pick<EffectiveLayoutFlags, 'chrome'>): boolean {
  return flags.chrome.showSidebar
}

/** IntegrationSlot 배지 노출 (emergency 시 chrome.showIntegrationSlots === false). */
export function shouldShowIntegrationBadge(
  flags: Pick<EffectiveLayoutFlags, 'chrome'>,
): boolean {
  return flags.chrome.showIntegrationSlots
}

export type IntegrationSlotKind = keyof Pick<
  UteLayoutIntegrationFlags,
  'speedOrderChrome' | 'tgxCexStrip'
>

const INTEGRATION_SLOT_MAP: Record<IntegrationSlotKind, keyof UteLayoutIntegrationFlags> = {
  speedOrderChrome: 'speedOrderChrome',
  tgxCexStrip: 'tgxCexStrip',
}

/**
 * SlotWrap policy: chrome master switch AND per-integration mock flag.
 */
export function shouldShowIntegrationSlot(
  flags: EffectiveLayoutFlags,
  kind: IntegrationSlotKind,
): boolean {
  if (!flags.chrome.showIntegrationSlots) return false
  const key = INTEGRATION_SLOT_MAP[kind]
  return flags.integrations[key]
}

/** HTS 하단 dock 노출. */
export function shouldShowBottomDock(flags: Pick<EffectiveLayoutFlags, 'chrome'>): boolean {
  return flags.chrome.showBottomDock
}

/** Platform header notification slot (mock summary). */
export function shouldShowNotificationSlot(flags: Pick<EffectiveLayoutFlags, 'chrome'>): boolean {
  return flags.chrome.showNotificationSlot
}

/** Unified event feed (mock, localStorage max 10). */
export function shouldShowUnifiedEventFeed(flags: Pick<EffectiveLayoutFlags, 'chrome'>): boolean {
  return flags.chrome.showUnifiedEventFeed
}

/** Workspace context router (unified feed → panel highlight). */
export function shouldEnableWorkspaceContextRouter(
  flags: Pick<EffectiveLayoutFlags, 'chrome'>,
): boolean {
  return flags.chrome.enableWorkspaceContextRouter
}

/** Tenant context bridge (12-TGX-TokenAdmin validation read-only). */
export function shouldEnableTenantContextBridge(
  flags: Pick<EffectiveLayoutFlags, 'chrome'>,
): boolean {
  return flags.chrome.enableTenantContextBridge
}

/** Global Diagnostics Center (cross-app mock on /admin). */
export function shouldEnableGlobalDiagnosticsCenter(
  flags: Pick<EffectiveLayoutFlags, 'chrome'>,
): boolean {
  return flags.chrome.enableGlobalDiagnosticsCenter
}

/** AI Incident Review board (mock triage). */
export function shouldEnableIncidentReview(
  flags: Pick<EffectiveLayoutFlags, 'chrome'>,
): boolean {
  return flags.chrome.enableIncidentReview
}

/** Mock AI summary blocks on incident board. */
export function shouldEnableIncidentAiSummary(
  flags: Pick<EffectiveLayoutFlags, 'chrome'>,
): boolean {
  return flags.chrome.enableIncidentAiSummary
}

/** AI Proposal Queue on /admin. */
export function shouldEnableProposalQueue(
  flags: Pick<EffectiveLayoutFlags, 'chrome'>,
): boolean {
  return flags.chrome.enableProposalQueue
}

/** Mock AI summary on proposal board. */
export function shouldEnableProposalAiSummary(
  flags: Pick<EffectiveLayoutFlags, 'chrome'>,
): boolean {
  return flags.chrome.enableProposalAiSummary
}

/** Cross-app risk graph on /admin. */
export function shouldEnableRiskGraph(flags: Pick<EffectiveLayoutFlags, 'chrome'>): boolean {
  return flags.chrome.enableRiskGraph
}

/** Global operations timeline on /admin. */
export function shouldEnableOperationsTimeline(
  flags: Pick<EffectiveLayoutFlags, 'chrome'>,
): boolean {
  return flags.chrome.enableOperationsTimeline
}

/** White-label theme preset engine (CSS vars + layout tokens). */
export function shouldEnableWhitelabelPresets(
  flags: Pick<EffectiveLayoutFlags, 'chrome'>,
): boolean {
  return flags.chrome.enableWhitelabelPresets
}

/** Platform header theme switcher (localStorage mock). */
export function shouldShowWhitelabelThemeSwitcher(
  flags: Pick<EffectiveLayoutFlags, 'chrome'>,
): boolean {
  return flags.chrome.enableWhitelabelPresets && flags.chrome.enableWhitelabelThemeSwitcher
}

/** Tenant Preview Center on /admin. */
export function shouldEnableWhitelabelPreviewCenter(
  flags: Pick<EffectiveLayoutFlags, 'chrome'>,
): boolean {
  return flags.chrome.enableWhitelabelPresets && flags.chrome.enableWhitelabelPreviewCenter
}

/** Tenant Admin Config Console on /admin (mock CRUD). */
export function shouldEnableWhitelabelAdminConfig(
  flags: Pick<EffectiveLayoutFlags, 'chrome'>,
): boolean {
  return flags.chrome.enableWhitelabelPresets && flags.chrome.enableWhitelabelAdminConfig
}

/** Trading window presets on UniversalMarketView. */
export function shouldEnableTradingWindowPresets(
  flags: Pick<EffectiveLayoutFlags, 'chrome'>,
): boolean {
  return flags.chrome.enableWhitelabelPresets && flags.chrome.enableTradingWindowPresets
}

/** 주문 패널 UI 입력·제출 비활성 (store/submitOrder 미변경). */
export function isOrderPanelReadOnly(flags: Pick<EffectiveLayoutFlags, 'readOnly'>): boolean {
  return flags.readOnly
}

export type LayoutModeBannerCopy = {
  show: boolean
  tone: 'readonly' | 'emergency' | 'both'
  title: string
  detail: string
}

export function getLayoutModeBannerCopy(
  flags: Pick<EffectiveLayoutFlags, 'readOnly' | 'emergencyDisable'>,
): LayoutModeBannerCopy {
  if (flags.emergencyDisable && flags.readOnly) {
    return {
      show: true,
      tone: 'both',
      title: 'Safe mode · read-only',
      detail: '통합 슬롯·하단 dock 축소 · 주문 입력 비활성 (mock)',
    }
  }
  if (flags.emergencyDisable) {
    return {
      show: true,
      tone: 'emergency',
      title: 'Safe mode',
      detail: '통합 슬롯·하단 dock 축소 (mock · emergency disable)',
    }
  }
  if (flags.readOnly) {
    return {
      show: true,
      tone: 'readonly',
      title: 'Demo · read-only',
      detail: '주문 입력·제출 비활성 (mock · UI guard only)',
    }
  }
  return { show: false, tone: 'readonly', title: '', detail: '' }
}
