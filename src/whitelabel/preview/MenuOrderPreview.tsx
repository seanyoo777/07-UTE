import { useMemo } from 'react'
import { useEffectiveLayoutFlags } from '../../hooks/useEffectiveLayoutFlags'
import {
  buildMenuPreview,
  type MenuPreviewModel,
  type TenantMenuNavMapping,
} from '../tenantMenuNavMapping'
import type { TenantMenuPresetId } from '../tenantPresetTypes'

type Props = {
  menuPreset: TenantMenuPresetId
  navOverride?: TenantMenuNavMapping | null
}

function MenuPreviewBody({ preview }: { preview: MenuPreviewModel }) {
  return (
    <div className="space-y-2">
      <p className="text-[9px] text-so-muted">
        Visible order:{' '}
        <span className="font-mono text-so-fg">
          {preview.visibleOrder.length > 0 ? preview.visibleOrder.join(' → ') : '—'}
        </span>
      </p>
      <ul className="space-y-1">
        {preview.entries.map((entry) => (
          <li
            key={entry.navId}
            className={`flex items-center justify-between rounded border px-2 py-1 text-[9px] ${
              entry.visible
                ? entry.emphasized
                  ? 'border-so-accent/40 bg-so-accent/10'
                  : 'border-so-border/50 bg-so-bg/50'
                : 'border-so-border/30 bg-so-bg/30 opacity-60'
            }`}
          >
            <span className="font-medium text-so-fg">
              {entry.label}
              {entry.emphasized && entry.visible ? (
                <span className="ml-1 text-so-accent">★</span>
              ) : null}
            </span>
            <span className="text-so-muted">
              {entry.visible
                ? 'visible'
                : entry.hiddenByFeatureFlag
                  ? 'hidden (flag)'
                  : entry.hiddenByMenuPreset
                    ? 'hidden (menu)'
                    : 'hidden'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function MenuOrderPreview({ menuPreset, navOverride }: Props) {
  const layoutFlags = useEffectiveLayoutFlags()
  const preview = useMemo(
    () => buildMenuPreview(menuPreset, layoutFlags, navOverride),
    [menuPreset, layoutFlags, navOverride],
  )

  return (
    <div
      className="rounded-lg border border-so-border/60 bg-so-surface/40 p-3"
      data-testid="menu-order-preview"
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-so-muted">
        Menu order preview
      </p>
      <p className="mt-0.5 font-mono text-[9px] text-so-muted">preset={menuPreset}</p>
      <div className="mt-2">
        <MenuPreviewBody preview={preview} />
      </div>
    </div>
  )
}
