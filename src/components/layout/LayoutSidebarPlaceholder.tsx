/** HTS market sidebar hidden — market switching via premium deck or ticker. */
export function LayoutSidebarPlaceholder() {
  return (
    <div className="flex h-full flex-col items-center justify-center border-r border-so-border/40 bg-so-bg/30 px-2 text-center">
      <p className="text-[10px] font-semibold text-so-muted">Sidebar hidden</p>
      <p className="mt-1 text-[9px] leading-snug text-so-muted/75">
        mock · use market tabs or ticker to switch
      </p>
    </div>
  )
}
