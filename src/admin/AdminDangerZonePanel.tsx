export function AdminDangerZonePanel() {
  const rows = [
    { k: '실주문 라우팅', reason: 'BrokerAdapter mock 고정' },
    { k: '송금 / 정산 실행', reason: '실행 경로 없음' },
    { k: '코인 release / escrow 해제', reason: 'TetherGet surface 읽기 전용' },
    { k: '운영 설정 변경', reason: 'canChangeSettings=false (mock)' },
    { k: '위험 배치 트리거', reason: 'canTriggerDangerAction=false (mock)' },
  ]
  return (
    <div className="rounded-lg border border-so-ask/30 bg-so-ask/5 px-3 py-2.5">
      <h2 className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-so-ask">위험 기능 (전부 비활성)</h2>
      <p className="mb-2 text-[9px] text-so-muted">표시만 — 버튼은 비활성, 실제 액션 없음.</p>
      <ul className="space-y-1.5">
        {rows.map((r) => (
          <li key={r.k} className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
            <span className="text-so-text">{r.k}</span>
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded border border-so-border/60 bg-so-bg/40 px-2 py-0.5 text-[9px] font-semibold text-so-muted opacity-70"
              title={r.reason}
            >
              비활성화됨
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
