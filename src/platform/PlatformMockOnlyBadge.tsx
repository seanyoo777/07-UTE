/** Surfaces mock/demo mode — no live trading. */
export function PlatformMockOnlyBadge() {
  return (
    <span
      className="shrink-0 rounded border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-200/90"
      title="Mock / demo only — no real orders or exchange API"
    >
      mockOnly
    </span>
  )
}
