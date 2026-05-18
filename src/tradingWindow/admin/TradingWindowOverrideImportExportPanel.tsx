import { useState } from 'react'
import {
  exportOverridesToClipboardText,
  parseOverridesImport,
} from '../override/tradingWindowOverrideImportExport'
import { useTradingWindowOverrideStore } from '../override/tradingWindowOverrideStore'

type Props = {
  tenantPresetId: string
}

export function TradingWindowOverrideImportExportPanel({ tenantPresetId }: Props) {
  const overrides = useTradingWindowOverrideStore((s) => s.overrides)
  const importOverrides = useTradingWindowOverrideStore((s) => s.importOverrides)
  const [importText, setImportText] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const onExport = async () => {
    const text = exportOverridesToClipboardText(overrides)
    try {
      await navigator.clipboard.writeText(text)
      setMessage('Exported to clipboard (mockOnly JSON)')
    } catch {
      setMessage(text.slice(0, 120) + '… (copy from console)')
      console.info('[UTE] trading window export', text)
    }
  }

  const onImport = () => {
    const result = parseOverridesImport(importText)
    if (!result.ok || !result.overrides) {
      setMessage(result.warn ? `WARN: ${result.message}` : `FAIL: ${result.message}`)
      return
    }
    importOverrides(result.overrides)
    setMessage(result.warn ? `WARN: ${result.message}` : result.message)
  }

  return (
    <div
      className="rounded-md border border-so-border/50 bg-so-bg/60 p-2"
      data-testid="trading-window-import-export"
    >
      <p className="text-[10px] font-semibold text-so-fg">Override JSON import / export</p>
      <p className="mt-0.5 text-[9px] text-so-muted">Clipboard + textarea only · no file API · no fetch</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onExport}
          className="rounded border border-so-border/60 px-2 py-1 text-[10px] font-semibold text-so-fg hover:bg-so-surface/40"
        >
          Export all to clipboard
        </button>
      </div>
      <textarea
        value={importText}
        onChange={(e) => setImportText(e.target.value)}
        placeholder={`Paste mockOnly JSON blob for ${tenantPresetId} or full overrides map`}
        className="mt-2 h-20 w-full rounded border border-so-border/60 bg-so-bg/80 p-2 font-mono text-[9px] text-so-fg"
      />
      <button
        type="button"
        onClick={onImport}
        className="mt-1 rounded border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-so-fg"
      >
        Import JSON
      </button>
      {message ? <p className="mt-1 text-[9px] text-so-muted">{message}</p> : null}
    </div>
  )
}
