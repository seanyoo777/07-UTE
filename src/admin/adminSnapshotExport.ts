/**
 * 관리자 스냅샷 클립보드보내기 — 마스킹만 적용, 서버 전송 없음.
 */

/**보내기 JSON 최상위 schemaVersion (UTE admin export contract) */
export const ADMIN_EXPORT_SCHEMA_VERSION = '1.0.0' as const

/** 마스킹 규칙 버전 — docs/SECURITY_ADMIN_STRUCTURE.md 와 동기 */
export const ADMIN_EXPORT_MASKING_POLICY_VERSION = 'ute-admin-export-mask-1' as const

type JsonObject = Record<string, unknown>

function isPlainObject(v: unknown): v is JsonObject {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

/** 문자열 길이 상한(요약 유출 완화) */
const MAX_SUMMARY_LEN = 160

function truncateSummary(s: string): string {
  if (s.length <= MAX_SUMMARY_LEN) return s
  return `${s.slice(0, MAX_SUMMARY_LEN)}…[truncated]`
}

/**
 * 알려진 민감 패턴: Bridge `lastError.message`, 긴 `capabilitiesSummary`,
 * TetherGet `fallbackReason`, 클립보드에 부적합한 과다 문자열.
 */
export function maskAdminExportPayload(payload: JsonObject): JsonObject {
  const out = JSON.parse(JSON.stringify(payload)) as JsonObject

  if (isPlainObject(out.bridges)) {
    for (const id of Object.keys(out.bridges)) {
      const snap = out.bridges[id]
      if (!isPlainObject(snap)) continue
      if (typeof snap.capabilitiesSummary === 'string') {
        snap.capabilitiesSummary = truncateSummary(snap.capabilitiesSummary)
      }
      if (isPlainObject(snap.lastError)) {
        const le = snap.lastError as JsonObject
        if (typeof le.message === 'string') {
          le.message = '[masked]'
        }
      }
      const tg = snap.tethergetPanel
      if (isPlainObject(tg)) {
        if (typeof tg.summaryLine === 'string') tg.summaryLine = truncateSummary(tg.summaryLine)
        if (typeof tg.fallbackReason === 'string') tg.fallbackReason = truncateSummary(tg.fallbackReason)
      }
      const tgx = snap.tgxPanel
      if (isPlainObject(tgx) && typeof tgx.tickerLine === 'string') {
        tgx.tickerLine = truncateSummary(tgx.tickerLine)
      }
      const so = snap.speedorderPanel
      if (isPlainObject(so) && typeof so.marketSyncLine === 'string') {
        so.marketSyncLine = truncateSummary(so.marketSyncLine)
      }
    }
  }

  if (isPlainObject(out.uteIntegration)) {
    const ix = out.uteIntegration as JsonObject
    if (typeof ix.headline === 'string') ix.headline = truncateSummary(ix.headline)
    const mi = ix.mockinvest
    if (isPlainObject(mi) && typeof mi.lifecycleSummary === 'string') {
      mi.lifecycleSummary = truncateSummary(mi.lifecycleSummary as string)
    }
    const vo = ix.speedOrder
    if (isPlainObject(vo) && typeof vo.marketSyncLine === 'string') {
      vo.marketSyncLine = truncateSummary(vo.marketSyncLine as string)
    }
  }

  out.masked = true
  out.maskingPolicyVersion = ADMIN_EXPORT_MASKING_POLICY_VERSION
  return out
}

export function buildAdminExportPayloadBase(input: {
  role: string
  bridges: unknown
  uteIntegration: unknown
  securityAdmin: unknown
}): JsonObject {
  return {
    schemaVersion: ADMIN_EXPORT_SCHEMA_VERSION,
    mock: true,
    exportedAt: Date.now(),
    role: input.role,
    bridges: input.bridges,
    uteIntegration: input.uteIntegration,
    securityAdmin: input.securityAdmin,
  }
}
