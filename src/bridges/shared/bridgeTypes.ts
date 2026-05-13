/**
 * 외부 제품(01 TetherGet-P2P, 02 TGX-CEX, …)과 UTE 사이의 공통 Bridge 계약 타입.
 * 실 API/실거래/실 송금·정산 연결 없음 — mock·demo 전용.
 */

export type BridgeId = 'tetherget' | 'tgx' | 'oneai' | 'mockinvest' | 'speedorder'

/** BRG 카드 표시 순서 — 01번 우선 */
export const BRIDGE_ORDER: readonly BridgeId[] = ['tetherget', 'tgx', 'oneai', 'mockinvest', 'speedorder']

/** 물리/논리 연결 단계 (향후 live transport 대비) */
export type BridgeConnectionStatus = 'disconnected' | 'connecting' | 'connected'

/**
 * 통합 대시보드용 표시 상태.
 * - disabled: 운영자/설정에 의해 비활성
 * - error: 마지막 프로브 또는 세션 오류
 * - mock: 데모 파이프라인만 사용 (연결 전 초기·명시적 mock)
 * - connected: mock 세션이 정상적으로 열린 상태(실 API 아님)
 */
export type BridgeDashboardStatus = 'disabled' | 'error' | 'mock' | 'connected'

/** 데이터 출처 — 본 레포 기본값은 항상 mock */
export type BridgeDataSource = 'mock' | 'live'

/**
 * mock fallback 이유(향후 live 실패 시 구분용).
 * - none: 단순 데모
 * - explicit_demo: 의도적 데모 전용
 * - live_unavailable: live 경로 비가용(본 빌드에서는 설정만)
 * - circuit_open: 회로 차단(시뮬)
 */
export type MockFallbackKind = 'none' | 'explicit_demo' | 'live_unavailable' | 'circuit_open'

export type BridgeErrorState = {
  code: string
  message: string
  at: number
  retryable?: boolean
}

/** 01 TetherGet GET /api/admin/p2p/ute-surface 정렬 BRG 스냅샷 */
export type TethergetBrgPanelSnapshot = {
  schemaVersion: string
  p2pCount: number
  escrowLockedCount: number
  disputeCount: number
  referralPending: number
  walletRisk: string
  adminRisk: string
  /** mock | mock_fallback(API 비가용·실패 시 mock) | error */
  fallbackState: 'mock' | 'mock_fallback' | 'error'
  fallbackReason?: string
  /** headline·요약 한 줄 */
  summaryLine: string
}

/** 02 TGX-CEX `src/cex` mock surface 기반 BRG 요약 */
export type TgxBrgPanelSnapshot = {
  selectedSymbolLine: string
  symbolUniverseCount: number
  marketDataStatus: string
  positionsCount: number
  ordersCount: number
  tickerLine: string
}

/** 05 SpeedOrder `src/vendor` mock surface 기반 BRG 요약 */
export type SpeedorderBrgPanelSnapshot = {
  engineStatus: string
  registryCount: number
  marketSyncLine: string
  marketSyncState: string
  executionPolicy: string
}

/** 03 OneAI + `src/strategies` mock surface 기반 BRG 요약 */
export type OneaiBrgPanelSnapshot = {
  strategyCount: number
  recentSignalCount: number
  aggregateWinrate: string
  aggregatePnl: string
  riskLevel: string
}

/** 04 MockInvest + `src/mockinvest` mock surface 기반 BRG 요약 */
export type MockinvestBrgPanelSnapshot = {
  activeTournamentsCount: number
  activeParticipantsTotal: number
  topRankingCount: number
  rewardPoolsLine: string
  lifecycleLine: string
}

export type BridgeProbeResult = {
  capabilitiesSummary: string
  tethergetPanel?: TethergetBrgPanelSnapshot
  tgxPanel?: TgxBrgPanelSnapshot
  oneaiPanel?: OneaiBrgPanelSnapshot
  mockinvestPanel?: MockinvestBrgPanelSnapshot
  speedorderPanel?: SpeedorderBrgPanelSnapshot
}

/** 대시보드 한 줄 요약에 쓰는 스냅샷 */
export type BridgeAdapterSnapshot = {
  id: BridgeId
  /** UI 표시명 */
  displayName: string
  /** IntegrationSlot 등과 맞춘 제품 코드 */
  productCode: string
  connectionStatus: BridgeConnectionStatus
  dashboardStatus: BridgeDashboardStatus
  dataSource: BridgeDataSource
  mockFallback: MockFallbackKind
  lastError?: BridgeErrorState
  /** 준비된 mock 역량 한 줄 */
  capabilitiesSummary: string
  /** 부가 요약 (예: TetherGet P2P/지갑) */
  tethergetPanel?: TethergetBrgPanelSnapshot
  tgxPanel?: TgxBrgPanelSnapshot
  oneaiPanel?: OneaiBrgPanelSnapshot
  mockinvestPanel?: MockinvestBrgPanelSnapshot
  speedorderPanel?: SpeedorderBrgPanelSnapshot
  updatedAt: number
}

export type BridgeDisabledMap = Record<BridgeId, boolean>
