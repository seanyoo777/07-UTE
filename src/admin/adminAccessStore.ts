import { create } from 'zustand'

import type { AdminRole } from './adminAccessTypes'
import { buildMockAdminAuditSeed, createAdminAuditLogEntry, type AdminAuditLogEntry } from './adminAuditLog'

const MAX_AUDIT = 120

/** mock 기본 역할 — 엄격 읽기: `readonly`. 데모에서 새로고침·보내기 켜려면 `platform_admin` 등으로 변경. */
export const INITIAL_MOCK_ADMIN_ROLE: AdminRole = 'readonly'

const MOCK_ACTOR_ID = 'mock-ute-admin-session'
const MOCK_ACTOR_LABEL = 'MOCK UTE admin (no IdP)'

type AdminAccessStoreState = {
  role: AdminRole
  actorId: string
  actorLabel: string
  auditLog: AdminAuditLogEntry[]
  setMockRole: (role: AdminRole) => void
  appendAudit: (entry: AdminAuditLogEntry) => void
  /** 스토어 필드로부터 엔트리 생성 후 append */
  log: (input: Omit<AdminAuditLogEntry, 'id' | 'at' | 'actorId' | 'actorLabel' | 'role'> & { at?: number }) => void
}

export const useAdminAccessStore = create<AdminAccessStoreState>((set, get) => ({
  role: INITIAL_MOCK_ADMIN_ROLE,
  actorId: MOCK_ACTOR_ID,
  actorLabel: MOCK_ACTOR_LABEL,
  auditLog: buildMockAdminAuditSeed(Date.now()),
  setMockRole: (role) => set({ role }),
  appendAudit: (entry) =>
    set((s) => ({
      auditLog: [entry, ...s.auditLog].slice(0, MAX_AUDIT),
    })),
  log: (input) => {
    const { role, actorId, actorLabel, appendAudit } = get()
    appendAudit(
      createAdminAuditLogEntry({
        ...input,
        role,
        actorId,
        actorLabel,
      }),
    )
  },
}))
