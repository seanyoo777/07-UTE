import { useAppNavigation } from '../appNavigation'
import {
  shouldShowNotificationSlot,
  shouldShowUnifiedEventFeed,
  shouldShowWhitelabelThemeSwitcher,
} from '../config/layoutUiGuards'
import { useEffectiveLayoutFlags } from '../hooks/useEffectiveLayoutFlags'
import { resolveWhitelabelShellClasses } from '../whitelabel/resolveWhitelabelClasses'
import { TenantThemeSwitcher } from '../whitelabel/TenantThemeSwitcher'
import { useTenantWhitelabelStore } from '../whitelabel/tenantWhitelabelStore'
import type { MarketId } from '../markets/types'
import type { AdapterStatus } from '../store/types'
import { usePlatformTenantStore } from './platformTenantStore'
import { PlatformMockOnlyBadge } from './PlatformMockOnlyBadge'
import { PlatformNotificationSlot } from './PlatformNotificationSlot'
import { PlatformUnifiedEventFeed } from './PlatformUnifiedEventFeed'
import { PlatformTenantContextStrip } from './tenantContext/PlatformTenantContextStrip'

type Props = {
  activeMarketId?: MarketId
  adapterStatus?: AdapterStatus
  diagnosticsOpen: boolean
  onToggleDiagnostics: () => void
}

export function PlatformHeader({
  activeMarketId,
  adapterStatus,
  diagnosticsOpen,
  onToggleDiagnostics,
}: Props) {
  const tenant = usePlatformTenantStore((s) => s.tenant)
  const view = useAppNavigation((s) => s.view)
  const goAdmin = useAppNavigation((s) => s.goAdmin)
  const layoutFlags = useEffectiveLayoutFlags()
  const showNotifications = shouldShowNotificationSlot(layoutFlags)
  const showUnifiedFeed = shouldShowUnifiedEventFeed(layoutFlags)
  const showThemeSwitcher = shouldShowWhitelabelThemeSwitcher(layoutFlags)
  const preset = useTenantWhitelabelStore((s) => s.preset)
  const { topbarClass } = resolveWhitelabelShellClasses(preset)

  return (
    <header
      className={`flex shrink-0 flex-wrap items-center gap-2 px-3 py-2 ${topbarClass}`}
      data-ute-menu={preset.menu}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-so-muted">
            Universal Trading Exchange
          </p>
          <p className="truncate text-sm font-medium text-so-fg" title={tenant.id}>
            {tenant.displayName}
            <span className="ml-1.5 text-[10px] font-normal text-so-muted">· {tenant.tier}</span>
          </p>
        </div>
        <PlatformMockOnlyBadge />
        <PlatformTenantContextStrip />
      </div>

      {view === 'trading' && activeMarketId ? (
        <p className="hidden text-[10px] text-so-muted sm:block">
          {activeMarketId}
          {adapterStatus ? ` · ${adapterStatus}` : ''}
        </p>
      ) : null}

      <div className="flex flex-wrap items-end justify-end gap-2">
        {showNotifications || showUnifiedFeed ? (
          <div className="flex flex-col items-end gap-1">
            {showNotifications ? <PlatformNotificationSlot /> : null}
            {showUnifiedFeed ? <PlatformUnifiedEventFeed /> : null}
          </div>
        ) : null}
        {showThemeSwitcher ? <TenantThemeSwitcher /> : null}
        <button
          type="button"
          onClick={onToggleDiagnostics}
          className={`rounded-md border px-2.5 py-1 text-[10px] font-medium ${
            diagnosticsOpen
              ? 'border-so-bid/50 bg-so-bid/10 text-so-bid'
              : 'border-so-border/60 bg-so-bg/60 text-so-fg hover:bg-so-border/20'
          }`}
          aria-pressed={diagnosticsOpen}
        >
          Diagnostics
        </button>
        <button
          type="button"
          onClick={goAdmin}
          className="rounded-md border border-violet-500/40 bg-violet-500/10 px-2.5 py-1 text-[10px] font-medium text-violet-200 hover:bg-violet-500/20"
          title="Admin Self-Test Center"
        >
          Self-Test Center
        </button>
      </div>
    </header>
  )
}
