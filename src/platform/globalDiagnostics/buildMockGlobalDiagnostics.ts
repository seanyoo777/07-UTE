import { buildSelfTestResult, type Verdict } from '@tetherget/self-test-core'
import type { SelfTestVerdict } from '../../admin/selfTest/uteSelfTestTypes'
import { DEFAULT_PLATFORM_ID, type PlatformDiagnosticsScope } from '../platformScope'
import {
  GLOBAL_DIAGNOSTICS_SOURCE_IDS,
  type GlobalDiagnosticsBundle,
  type GlobalDiagnosticsSnapshot,
  type GlobalDiagnosticsSourceCard,
} from './globalDiagnosticsTypes'
import { GLOBAL_DIAGNOSTICS_SOURCE_META } from './globalDiagnosticsSourceMeta'

export type BuildMockGlobalDiagnosticsInput = {
  scope: PlatformDiagnosticsScope
  tenantDisplayName?: string
  companyId?: string
  bridgeErrorCount?: number
  asOf?: number
}

/** Deterministic mock verdict per source — no cross-app transport. */
function mockSourceVerdict(
  sourceIndex: number,
  bridgeErrorCount: number,
): SelfTestVerdict {
  const warnAt = sourceIndex % 2 === 0 ? 1 : 2
  const failAt = warnAt + 2
  if (bridgeErrorCount >= failAt) return 'FAIL'
  if (bridgeErrorCount >= warnAt) return 'WARN'
  return 'PASS'
}

function countsForVerdict(verdict: SelfTestVerdict): { pass: number; warn: number; fail: number } {
  if (verdict === 'FAIL') return { pass: 2, warn: 1, fail: 1 }
  if (verdict === 'WARN') return { pass: 4, warn: 1, fail: 0 }
  return { pass: 5, warn: 0, fail: 0 }
}

function buildSourceCard(
  sourceIndex: number,
  bridgeErrorCount: number,
  asOf: number,
): GlobalDiagnosticsSourceCard {
  const meta = GLOBAL_DIAGNOSTICS_SOURCE_META[GLOBAL_DIAGNOSTICS_SOURCE_IDS[sourceIndex]!]
  const overall = mockSourceVerdict(sourceIndex, bridgeErrorCount)
  const counts = countsForVerdict(overall)

  return {
    id: meta.id,
    appLabel: meta.appLabel,
    productName: meta.productName,
    overall,
    ...counts,
    lastCheckedAtMs: asOf - sourceIndex * 4_000,
    mockOnly: true,
    headline:
      overall === 'PASS'
        ? `${meta.productName} mock probe OK`
        : overall === 'WARN'
          ? `${meta.productName} mock drift · review`
          : `${meta.productName} mock fault · isolate`,
  }
}

export function buildMockGlobalDiagnosticsBundle(
  input: BuildMockGlobalDiagnosticsInput,
): GlobalDiagnosticsBundle {
  const asOf = input.asOf ?? Date.now()
  const bridgeErrorCount = input.bridgeErrorCount ?? 0
  const sourceCards = GLOBAL_DIAGNOSTICS_SOURCE_IDS.map((_, i) =>
    buildSourceCard(i, bridgeErrorCount, asOf),
  )

  const suites = sourceCards.map((card) => ({
    id: card.id,
    label: `${card.appLabel} · ${card.productName}`,
    status: card.overall as Verdict,
    issues: [],
    passCount: card.pass,
    warnCount: card.warn,
    failCount: card.fail,
  }))

  const core = buildSelfTestResult({
    suites,
    mockOnly: true,
    lastCheckedAtMs: asOf,
  })

  return {
    scope: input.scope,
    tenantDisplayName: input.tenantDisplayName ?? 'UTE Demo Org',
    companyId: input.companyId ?? 'ute-demo-company',
    sourceCards,
    core,
    mockOnly: true,
  }
}

function countSourcesByVerdict(
  cards: GlobalDiagnosticsBundle['sourceCards'],
): { pass: number; warn: number; fail: number } {
  let pass = 0
  let warn = 0
  let fail = 0
  for (const c of cards) {
    if (c.overall === 'FAIL') fail += 1
    else if (c.overall === 'WARN') warn += 1
    else pass += 1
  }
  return { pass, warn, fail }
}

export function buildGlobalDiagnosticsSnapshotFromBundle(
  bundle: GlobalDiagnosticsBundle,
): GlobalDiagnosticsSnapshot {
  const issueCount = countSourcesByVerdict(bundle.sourceCards)
  const overall = bundle.core.overall

  return {
    id: `global-diag-${bundle.scope.scopeKey}-${bundle.core.lastCheckedAtMs}`,
    scope: bundle.scope,
    asOf: bundle.core.lastCheckedAtMs,
    mockOnly: true,
    overall,
    issueCount,
    sourceCount: bundle.sourceCards.length,
    highlights: bundle.sourceCards.map((c) => `${c.appLabel}:${c.overall}`),
  }
}

export function buildDefaultGlobalDiagnosticsScope(
  tenantId: string,
  platformId: string = DEFAULT_PLATFORM_ID,
): PlatformDiagnosticsScope {
  return {
    platformId,
    tenantId,
    scopeKey: `${platformId}:${tenantId}`,
  }
}
