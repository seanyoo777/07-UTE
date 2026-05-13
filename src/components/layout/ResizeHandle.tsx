import { useCallback, useRef } from 'react'

type Orientation = 'vertical' | 'horizontal'

type Props = {
  orientation: Orientation
  onDragDelta: (delta: number) => void
  onDoubleClickReset: () => void
  label: string
}

/**
 * 드래그 스플리터.
 * - 더블클릭 시 기본값 복원
 * - pointer capture 사용 (모바일 터치 호환)
 */
export function ResizeHandle({ orientation, onDragDelta, onDoubleClickReset, label }: Props) {
  const lastRef = useRef(0)

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault()
      const el = e.currentTarget
      el.setPointerCapture(e.pointerId)
      lastRef.current = orientation === 'vertical' ? e.clientX : e.clientY

      const onMove = (ev: PointerEvent) => {
        const cur = orientation === 'vertical' ? ev.clientX : ev.clientY
        const d = cur - lastRef.current
        lastRef.current = cur
        if (d !== 0) onDragDelta(d)
      }
      const onUp = (ev: PointerEvent) => {
        try {
          el.releasePointerCapture(ev.pointerId)
        } catch {
          /* already released */
        }
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        window.removeEventListener('pointercancel', onUp)
      }
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
      window.addEventListener('pointercancel', onUp)
    },
    [onDragDelta, orientation],
  )

  const base =
    orientation === 'vertical'
      ? 'w-1.5 shrink-0 cursor-col-resize border-x border-transparent hover:border-so-accent/40 hover:bg-so-accent/15'
      : 'h-1.5 shrink-0 cursor-row-resize border-y border-transparent hover:border-so-accent/40 hover:bg-so-accent/15'

  return (
    <div
      role="separator"
      aria-label={label}
      aria-orientation={orientation === 'vertical' ? 'vertical' : 'horizontal'}
      title={`${label} · 드래그로 조절 · 더블클릭 시 기본 크기`}
      onPointerDown={onPointerDown}
      onDoubleClick={(e) => {
        e.preventDefault()
        onDoubleClickReset()
      }}
      className={`group relative z-10 flex items-center justify-center bg-so-bg/30 ${base}`}
    >
      <span
        className={`pointer-events-none rounded-full bg-so-border-2 opacity-70 group-hover:bg-so-accent group-hover:opacity-100 ${
          orientation === 'vertical' ? 'h-10 w-px' : 'h-px w-10'
        }`}
        aria-hidden
      />
    </div>
  )
}
