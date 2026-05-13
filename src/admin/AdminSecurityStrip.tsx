import type { SecurityAdminStatusBundle } from '../bridges/shared/securityStatusTypes'

type Props = {
  bundle: SecurityAdminStatusBundle
}

export function AdminSecurityStrip({ bundle }: Props) {
  const rows: { k: string; v: string }[] = [
    { k: 'admin', v: bundle.adminAccessStatus },
    { k: 'audit', v: bundle.auditLogStatus },
    { k: 'secrets', v: bundle.secretsStatus },
    { k: 'env', v: bundle.environmentMode },
    { k: 'maint', v: bundle.maintenanceMode },
    { k: 'region', v: bundle.regionRestrictionStatus },
    { k: 'rate', v: bundle.rateLimitStatus },
    { k: 'waf', v: bundle.wafStatus },
    { k: 'ip', v: bundle.ipAllowlistStatus },
  ]
  return (
    <div className="rounded-lg border border-so-border bg-so-bg/40 px-3 py-2.5">
      <p className="mb-2 text-[10px] text-so-muted">
        Security / Admin — 읽기 전용 mock 번들. 실 WAF·시크릿·프로덕션 연동 없음.
      </p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {rows.map((r) => (
          <div key={r.k} className="min-w-0 font-mono text-[10px] text-so-muted">
            <span className="text-so-muted/80">{r.k}</span>{' '}
            <span className="break-all text-so-text">{r.v}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[9px] text-so-muted/90">
        asOf: {new Date(bundle.asOf).toLocaleString('ko-KR', { hour12: false })}
      </p>
    </div>
  )
}
