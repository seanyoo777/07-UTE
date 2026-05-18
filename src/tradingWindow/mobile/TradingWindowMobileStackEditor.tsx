import { useCallback, useState } from 'react'
import type { MobileStackSlotId } from '../tradingWindowPresetTypes'
import {
  MOBILE_VISUAL_PRESET_IDS,
  MOBILE_VISUAL_PRESETS,
  applyMobileVisualPreset,
  normalizeStackOrder,
  type MobileVisualPresetId,
} from './mobileStackPreview'
import { slotLabel } from './mobileStackWireframe'

type Props = {
  stackOrder: MobileStackSlotId[]
  visualPreset: MobileVisualPresetId
  onChange: (next: { stackOrder: MobileStackSlotId[]; visualPreset: MobileVisualPresetId }) => void
}

export function TradingWindowMobileStackEditor({ stackOrder, visualPreset, onChange }: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const moveSlot = useCallback(
    (from: number, to: number) => {
      if (from === to || from < 0 || to < 0 || from >= stackOrder.length || to >= stackOrder.length) {
        return
      }
      const next = [...stackOrder]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      onChange({ stackOrder: normalizeStackOrder(next), visualPreset })
    },
    [onChange, stackOrder, visualPreset],
  )

  const applyPreset = (preset: MobileVisualPresetId) => {
    const m = MOBILE_VISUAL_PRESETS[preset]
    onChange({ visualPreset: preset, stackOrder: normalizeStackOrder([...m.stackOrder]) })
  }

  const mobile = applyMobileVisualPreset(visualPreset)

  return (
    <div
      className="rounded-md border border-so-border/50 bg-so-bg/60 p-2"
      data-testid="trading-window-mobile-stack-editor"
    >
      <p className="text-[10px] font-semibold text-so-fg">Mobile stack editor (mock)</p>
      <p className="mt-0.5 text-[9px] text-so-muted">Drag or use arrows to reorder · presets set thumb/sheet defaults</p>

      <div className="mt-2 flex flex-wrap gap-1">
        {MOBILE_VISUAL_PRESET_IDS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => applyPreset(id)}
            className={`rounded border px-2 py-0.5 text-[9px] font-semibold ${
              visualPreset === id
                ? 'border-so-accent/50 bg-so-accent/15 text-so-accent'
                : 'border-so-border/50 text-so-muted hover:bg-so-surface/40'
            }`}
          >
            {id}
          </button>
        ))}
      </div>

      <ul className="mt-2 space-y-1" aria-label="Stack order mock drag">
        {stackOrder.map((slot, index) => (
          <li
            key={slot}
            className={`flex items-center gap-1 rounded border px-2 py-1 text-[10px] ${
              dragIndex === index ? 'border-so-accent/50 bg-so-accent/10' : 'border-so-border/40 bg-so-surface/30'
            }`}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragEnd={() => setDragIndex(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null) moveSlot(dragIndex, index)
              setDragIndex(null)
            }}
          >
            <span className="cursor-grab text-so-muted" title="mock drag">
              ⋮⋮
            </span>
            <span className="flex-1 font-mono text-so-fg">{slotLabel(slot)}</span>
            <span className="text-[8px] text-so-muted">{index + 1}</span>
            <button
              type="button"
              className="rounded px-1 text-so-muted hover:bg-so-border/30"
              disabled={index === 0}
              onClick={() => moveSlot(index, index - 1)}
              aria-label="Move up"
            >
              ↑
            </button>
            <button
              type="button"
              className="rounded px-1 text-so-muted hover:bg-so-border/30"
              disabled={index === stackOrder.length - 1}
              onClick={() => moveSlot(index, index + 1)}
              aria-label="Move down"
            >
              ↓
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-2 rounded border border-dashed border-so-border/50 p-2">
        <p className="text-[8px] font-semibold uppercase tracking-wide text-so-muted">Sticky sheet preview</p>
        <div className="relative mt-1 h-16 overflow-hidden rounded bg-so-surface/50">
          <div className="absolute inset-x-0 top-0 h-3 bg-so-surface-2/90 text-center text-[7px] text-so-muted">
            {mobile.stickyHeader}
          </div>
          <div className="flex h-full flex-col justify-end">
            <div
              className={`border-t border-so-accent/30 bg-so-accent/10 text-center text-[8px] text-so-accent ${
                mobile.bottomSheetOrder === 'full' ? 'h-[85%]' : mobile.bottomSheetOrder === 'half' ? 'h-[45%]' : 'h-2'
              }`}
            >
              order sheet · {mobile.bottomSheetOrder}
            </div>
          </div>
          <div
            className={`pointer-events-none absolute bottom-1 top-4 w-2 rounded bg-so-warn/20 ${
              mobile.thumbZone === 'right'
                ? 'right-1'
                : mobile.thumbZone === 'left'
                  ? 'left-1'
                  : 'left-1/2 -translate-x-1/2'
            }`}
            title="thumb safe zone mock"
          />
        </div>
      </div>
    </div>
  )
}
