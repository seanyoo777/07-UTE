import { useCallback, useMemo, useState } from 'react'
import { useAdminAccessStore } from './adminAccessStore'
import { runUteSelfTestSuite } from './selfTest/runUteSelfTestSuite'
import type { SelfTestReport, SelfTestVerdict } from './selfTest/uteSelfTestTypes'

const VERDICT_BADGE: Record<SelfTestVerdict, string> = {
  PASS: 'border-so-bid/50 bg-so-bid/12 text-so-bid',
  WARN: 'border-so-warn/50 bg-so-warn/12 text-so-warn',
  FAIL: 'border-so-ask/60 bg-so-ask/15 text-so-ask',
}

type Props = {
  bridgeErrorCount: number
  auditEntryCount: number
  unifiedEventCount?: number
  /** Re-run display when parent refreshes probes. */
  probeToken?: number | null
}

export function AdminSelfTestCenterPanel({
  bridgeErrorCount,
  auditEntryCount,
  unifiedEventCount = 0,
  probeToken,
}: Props) {
  const log = useAdminAccessStore((s) => s.log)
  const [report, setReport] = useState<SelfTestReport | null>(null)

  const baseline = useMemo(() => {
    void probeToken
    return runUteSelfTestSuite({ bridgeErrorCount, auditEntryCount, unifiedEventCount })
  }, [auditEntryCount, bridgeErrorCount, probeToken, unifiedEventCount])

  const display = report ?? baseline

  const runSuite = useCallback(() => {
    const next = runUteSelfTestSuite({ bridgeErrorCount, auditEntryCount, unifiedEventCount })
    setReport(next)
    log({
      action: 'self_test_run',
      resource: 'AdminSelfTestCenter',
      result: next.issueCount.fail > 0 ? 'denied' : 'ok',
      detail: `pass=${next.issueCount.pass} warn=${next.issueCount.warn} fail=${next.issueCount.fail}`,
    })
  }, [auditEntryCount, bridgeErrorCount, log, unifiedEventCount])

  const lastChecked = new Date(display.asOf).toLocaleString('ko-KR', { hour12: false })
  const issues = display.issueCount.warn + display.issueCount.fail

  return (
    <div className="rounded-lg border border-so-border/80 bg-so-surface/40">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-so-border/60 px-3 py-2">
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-so-muted">
            Self-Test Center
          </h2>
          <p className="mt-0.5 text-[9px] text-so-muted">
            mock diagnostics · no live execution · schema {display.schemaVersion}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded border border-so-warn/40 bg-so-warn/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-so-warn">
            mock only
          </span>
          <span className="rounded border border-so-border/60 bg-so-bg/40 px-2 py-0.5 font-mono text-[9px] text-so-muted">
            issues {issues} · last {lastChecked}
          </span>
          <button
            type="button"
            onClick={() => runSuite()}
            className="rounded-md border border-so-accent/40 bg-so-accent/10 px-2.5 py-1 text-[10px] font-semibold text-so-accent hover:bg-so-accent/20"
          >
            Run self-test
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 border-b border-so-border/40 px-3 py-2 text-center text-[10px]">
        <div>
          <div className="font-bold text-so-bid">{display.issueCount.pass}</div>
          <div className="text-so-muted">PASS</div>
        </div>
        <div>
          <div className="font-bold text-so-warn">{display.issueCount.warn}</div>
          <div className="text-so-muted">WARN</div>
        </div>
        <div>
          <div className="font-bold text-so-ask">{display.issueCount.fail}</div>
          <div className="text-so-muted">FAIL</div>
        </div>
      </div>

      <div className="max-h-[280px] overflow-y-auto p-2">
        <ul className="space-y-1">
          {display.checks.map((c) => (
            <li
              key={c.id}
              className="flex items-start justify-between gap-2 rounded-md border border-so-border/40 bg-so-bg/30 px-2 py-1.5"
            >
              <div className="min-w-0">
                <div className="text-[10px] font-medium text-so-text">{c.label}</div>
                {c.detail ? (
                  <p className="mt-0.5 truncate text-[9px] text-so-muted" title={c.detail}>
                    {c.detail}
                  </p>
                ) : null}
              </div>
              <span
                className={`shrink-0 rounded px-1.5 py-0.5 text-[8px] font-bold ${VERDICT_BADGE[c.verdict]}`}
              >
                {c.verdict}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-so-border/40 px-3 py-2 text-[9px] text-so-muted">
        Smoke (local CLI): {display.smokeCommands.join(' · ')}
      </div>
    </div>
  )
}
