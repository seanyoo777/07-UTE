/** Emergency / safe mode — bottom dock hidden; history remains in mobile stack. */
export function LayoutDockPlaceholder() {
  return (
    <div className="flex h-full min-h-[120px] flex-col items-center justify-center border-t border-so-border/50 bg-so-bg/40 px-4 text-center">
      <p className="text-[11px] font-semibold text-so-muted">Safe mode</p>
      <p className="mt-1 max-w-xs text-[10px] leading-snug text-so-muted/80">
        하단 dock 숨김 (mock · emergency disable). 포지션·체결은 모바일 history 또는 관리자에서 확인.
      </p>
    </div>
  )
}
