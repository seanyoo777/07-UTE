import { verdictDisplayLabel } from '@tetherget/diagnostics-ui'
import type { DiagnosticsTableRow } from '@tetherget/diagnostics-ui'

const VERDICT_TONE: Record<string, string> = {
  PASS: 'text-so-bid',
  WARN: 'text-so-warn',
  FAIL: 'text-so-ask',
}

type Props = {
  rows: DiagnosticsTableRow[]
  testIdPrefix?: string
}

/** Renders diagnostics-ui table rows with existing panel styling (presentational). */
export function DiagnosticsUiRowsList({ rows, testIdPrefix = 'diagnostics-ui-row' }: Props) {
  return (
    <ul className="space-y-1.5">
      {rows.map((row) => (
        <li
          key={row.id}
          data-testid={`${testIdPrefix}-${row.id}`}
          className="rounded border border-so-border/40 bg-so-bg/40 px-2 py-1.5"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[10px] text-so-fg">{row.label}</span>
            <span
              className={`shrink-0 text-[9px] font-semibold ${VERDICT_TONE[row.status]}`}
            >
              {verdictDisplayLabel(row.status)}
            </span>
          </div>
          {row.description ? (
            <p className="mt-0.5 truncate text-[9px] text-so-muted" title={row.description}>
              {row.description}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
