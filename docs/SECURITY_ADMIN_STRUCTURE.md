# Security / Admin Structure (Mock)

**Project:** 07-UTE  
**Scope:** Type-only and **mock-valued** operational security posture for future dashboards. **No** real WAF, secrets manager, IP allowlist, or production environment integration in this repository.

---

## Goals

| Goal | Implementation |
|------|------------------|
| Schema-first | `src/bridges/shared/securityStatusTypes.ts` defines all status enums / unions. |
| Mock data | `buildMockSecurityAdminBundle()` in `src/bridges/shared/securityMockBundle.ts` returns a demo `SecurityAdminStatusBundle`. |
| UI hook | BRG panel (`BridgeIntegrationPanel`) renders **Security / Admin (mock)** after bridge cards; values refresh when **Refresh** completes successfully (`useBridgeDashboardStore`). |
| No execution | Types do **not** imply any transfer, settlement, order routing, or admin unlock in production. |

---

## Types (`securityStatusTypes.ts`)

| Field | Type name | Meaning (mock labels) |
|-------|-----------|------------------------|
| Admin access | `AdminAccessStatus` | Simulated console access tier. |
| Audit log | `AuditLogStatus` | Simulated log pipeline health. |
| Secrets | `SecretsStatus` | Simulated key / vault posture (no real keys). |
| Environment | `EnvironmentMode` | Simulated environment label; includes **`production_blocked_mock`**. |
| Maintenance | `MaintenanceMode` | Simulated maintenance window. |
| Region | `RegionRestrictionStatus` | Simulated geo policy. |
| Rate limit | `RateLimitStatus` | Simulated throttle / trip. |
| WAF | `WafStatus` | Simulated edge policy. |
| IP allowlist | `IpAllowlistStatus` | Simulated IP policy. |

Aggregated as **`SecurityAdminStatusBundle`** with `asOf: number` (epoch ms).

---

## Relation to bridges

- **TetherGet (01)** and other product bridges (`src/bridges/tetherget`, …) handle **product-shaped** mock DTOs (P2P, escrow, etc.).  
- **Security / Admin** is **cross-cutting**: same bundle is shown regardless of which bridge card is expanded; it is regenerated on each successful full probe for demo freshness.

---

## TetherGet `ute-surface` consumer (mock, no live HTTP)

| Entry | Behavior |
|-------|----------|
| `fetchTethergetUteSurfaceMock` | Returns **`buildDefaultUteSurfacePayload()`** with `meta.source: 'mock'`. |
| `fetchTethergetUteSurfaceFromApi` | **Stub only** — throws `TethergetSurfaceApiDisabledError`; **no** `fetch` to 01 TetherGet in this repo. |
| `fetchTethergetUteSurfaceWithMockFallback` | **Mock-first** — same as mock path; does not attempt HTTP. |
| `fetchTethergetUteSurfaceTryApiThenMockFallback` | Intended policy demo: try API → on any failure (including stub), return the default payload with `meta.source: 'mock_fallback'` and `reason` for BRG **`fallbackState`**. |

**Principle:** UTE default builds must never depend on 01 TetherGet uptime; admin P2P surface is **read-shaped** only — no transfers, no coin release, no escrow mutation from 07-UTE.

---

## Unified admin dashboard (read-only mock)

| Concern | Implementation |
|---------|------------------|
| UI | `UnifiedAdminDashboard` + KPI, `AdminBridgeHealthTable`, `AdminRiskAlertList`, **`AdminPermissionSummaryCard`**, **`AdminSystemHealthPanel`**, **`AdminNotificationCenter`**, **`AdminAuditLogPanel`**, **`AdminDangerZonePanel`**, `AdminSecurityStrip`. |
| RBAC (mock) | `src/admin/adminAccessTypes.ts` (`AdminRole`, `AdminPermission`, `AdminAccessState`), `adminAccessPolicy.ts` (`getCapabilitiesForRole`), **`useAdminAccessStore`** / **`INITIAL_MOCK_ADMIN_ROLE`** (`adminAccessStore.ts`) — IdP 없음; 기본 역할 **`readonly`** (스냅샷 버튼·보내기 비활성). 데모 시 `platform_admin` 등으로 상수 변경. |
| Audit (mock) | `src/admin/adminAuditLog.ts` — `AdminAuditLogEntry`, `createAdminAuditLogEntry`, 브라우저 내 `auditLog` 배열만; **`canChangeSettings` / `canTriggerDangerAction` 는 항상 false**. 읽기 이벤트에 **`notification_view`**, **`health_view`**, **`export_snapshot_masked`** 포함. |
| Notifications (mock) | `adminNotificationTypes.ts` — `buildMockAdminNotifications` (리스크·헬스·시스템 안내). |
| System health (mock) | `adminSystemHealth.ts` — `buildAdminSystemHealthSnapshot` (`ADMIN_SYSTEM_HEALTH_SCHEMA_VERSION`). |
| Data | `useBridgeDashboardStore`, **`buildAdminRiskAlerts`**. |
| Entry | URL **`/admin`**, HTS **ADM**, BRG **「관리자 대시보드」** (`src/appNavigation.ts`). |
| Safety | 최초 **bootstrap** 시에만 자동 `refresh`(데이터 적재); 이후 **`canRefreshProbe`** 가 true일 때만 수동 새로고침·**`canExportSnapshot`** 시 **마스킹된** 클립보드 JSON만 (`adminSnapshotExport.ts`). 서버 저장·업로드 없음. |

> **Note:** `SecurityAdminStatusBundle`의 **`AdminAccessStatus`**(콘솔 시뮬)와 `/admin`의 **`AdminRole`**(제품 RBAC mock)은 **별개 개념**입니다.

---

## Snapshot export masking (mock)

| 항목 | 정책 |
|------|------|
| 위치 | `src/admin/adminSnapshotExport.ts` — `maskAdminExportPayload`, `ADMIN_EXPORT_SCHEMA_VERSION`, `ADMIN_EXPORT_MASKING_POLICY_VERSION`. |
| 출력 | 최상위 **`schemaVersion`** (`ADMIN_EXPORT_SCHEMA_VERSION`) + 마스킹 후 **`masked: true`**, **`maskingPolicyVersion`**. |
| 필드 | 각 bridge `lastError.message` → **`[masked]`**; `capabilitiesSummary`·TetherGet `summaryLine`/`fallbackReason`·ticker/marketSync 긴 문자열·`uteIntegration.headline` 등 → **길이 상한(160자) 초과 시 잘라 `[truncated]`** 표기. |
| 전송 | **없음** — `navigator.clipboard.writeText` 만. |

---

## Future work (non-binding)

- Wire `SecurityAdminStatusBundle` to a read-only admin API **only** behind explicit feature flags and compliance review.  
- Separate **audit log viewer** component using `AuditLogStatus` as a gate.  
- Never mix **real secrets** into the client bundle.

---

## Related documents

- `MASTER_MANUAL.md` — BRG panel and file paths.  
- `docs/UTE_ARCHITECTURE.md` — Layering.  
- `docs/MARKET_INTEGRATION.md` — Bridges table.
