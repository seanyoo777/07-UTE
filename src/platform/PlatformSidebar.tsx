import { useAppNavigation } from '../appNavigation'
import { shouldEnableWhitelabelPresets } from '../config/layoutUiGuards'
import { useEffectiveLayoutFlags } from '../hooks/useEffectiveLayoutFlags'
import { resolveWhitelabelShellClasses } from '../whitelabel/resolveWhitelabelClasses'
import { useTenantWhitelabelStore } from '../whitelabel/tenantWhitelabelStore'
import { resolvePlatformNavForTenant } from './platformMenuGuards'
import type { PlatformNavId } from './platformShellConfig'

type Props = {
  activeNav: PlatformNavId
  onSelectNav: (id: PlatformNavId) => void
}

export function PlatformSidebar({ activeNav, onSelectNav }: Props) {
  const view = useAppNavigation((s) => s.view)
  const goTrading = useAppNavigation((s) => s.goTrading)
  const goAdmin = useAppNavigation((s) => s.goAdmin)
  const layoutFlags = useEffectiveLayoutFlags()
  const preset = useTenantWhitelabelStore((s) => s.preset)
  const navMapping = useTenantWhitelabelStore((s) => s.navMapping)
  const whitelabelOn = shouldEnableWhitelabelPresets(layoutFlags)
  const menuPreset = whitelabelOn ? preset.menu : 'trading-first'
  const items = resolvePlatformNavForTenant(
    layoutFlags,
    menuPreset,
    whitelabelOn ? navMapping : null,
  )
  const { sidebarWidthClass } = resolveWhitelabelShellClasses(preset)

  const handleClick = (id: PlatformNavId) => {
    if (id === 'trading') {
      goTrading()
    } else if (id === 'admin') {
      goAdmin()
    }
    onSelectNav(id)
  }

  const resolvedActive: PlatformNavId =
    view === 'admin' ? 'admin' : activeNav === 'diagnostics' ? 'diagnostics' : 'trading'

  return (
    <nav
      className={`flex shrink-0 flex-col gap-1 border-r border-so-border/80 bg-so-panel/50 py-2 ${sidebarWidthClass}`}
      aria-label="Platform navigation"
      data-ute-menu={preset.menu}
    >
      {items.map((item) => {
        const isActive = resolvedActive === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleClick(item.id)}
            data-ute-nav-emphasized={item.emphasized ? 'true' : 'false'}
            className={`mx-1 rounded-md px-2 py-2 text-left transition-colors ${
              isActive
                ? 'bg-so-bid/15 text-so-bid'
                : item.emphasized
                  ? 'border border-so-accent/30 bg-so-accent/5 text-so-fg'
                  : 'text-so-muted hover:bg-so-border/20 hover:text-so-fg'
            }`}
            title={item.hint}
          >
            <span className="block text-[10px] font-semibold md:text-xs">
              {item.label}
              {item.emphasized && !isActive ? (
                <span className="ml-1 text-[8px] font-normal text-so-accent">★</span>
              ) : null}
            </span>
            <span className="mt-0.5 hidden truncate text-[9px] opacity-70 md:block">{item.hint}</span>
          </button>
        )
      })}
    </nav>
  )
}
