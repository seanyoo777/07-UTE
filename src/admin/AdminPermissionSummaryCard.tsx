import { ADMIN_ROLE_DISPLAY } from './adminAccessPolicy'
import type { AdminCapabilityFlags } from './adminAccessTypes'
import type { AdminRole } from './adminAccessTypes'

type Props = {
  role: AdminRole
  caps: AdminCapabilityFlags
}

function Flag({ on, label }: { on: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between gap-2 text-[10px]">
      <span className="text-so-muted">{label}</span>
      <span className={on ? 'font-semibold text-so-bid' : 'text-so-muted/80'}>{on ? 'ON' : 'off'}</span>
    </div>
  )
}

export function AdminPermissionSummaryCard({ role, caps }: Props) {
  return (
    <div className="rounded-lg border border-so-border/80 bg-so-surface/50 px-3 py-2.5">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-so-muted">RBAC (mock)</h2>
        <span
          className="rounded border border-so-accent/40 bg-so-accent/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-so-accent"
          title="IdP 미연동 — 코드 상수 INITIAL_MOCK_ADMIN_ROLE"
        >
          role: {ADMIN_ROLE_DISPLAY[role]}
        </span>
      </div>
      <p className="mb-2 text-[9px] leading-snug text-so-muted">
        읽기 전용 mock 모드 — <span className="text-so-warn">canChangeSettings</span> /{' '}
        <span className="text-so-warn">canTriggerDangerAction</span> 는 본 빌드에서 항상 비활성.
      </p>
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
        <Flag on={caps.canViewAdmin} label="관리자 화면 조회" />
        <Flag on={caps.canRefreshProbe} label="스냅샷 새로고침(프로브)" />
        <Flag on={caps.canViewSecurity} label="Security/Admin 영역" />
        <Flag on={caps.canExportSnapshot} label="스냅샷 JSON 복사" />
        <Flag on={caps.canChangeSettings} label="설정 변경 (비활성)" />
        <Flag on={caps.canTriggerDangerAction} label="위험 액션 (비활성)" />
      </div>
    </div>
  )
}
