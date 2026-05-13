import type { AdminAccessState, AdminCapabilityFlags, AdminPermission, AdminRole } from './adminAccessTypes'

const FALSE_CAP: Pick<
  AdminCapabilityFlags,
  'canChangeSettings' | 'canTriggerDangerAction'
> = {
  canChangeSettings: false,
  canTriggerDangerAction: false,
}

function permSet(role: AdminRole): Set<AdminPermission> {
  const p = new Set<AdminPermission>(['admin.view'])
  switch (role) {
    case 'super_admin':
    case 'hq_admin':
    case 'platform_admin':
    case 'risk_admin':
    case 'finance_admin':
      p.add('admin.refresh_probe')
      p.add('admin.view_security')
      p.add('admin.export_snapshot')
      break
    case 'operator':
      p.add('admin.refresh_probe')
      p.add('admin.view_security')
      break
    case 'support':
      p.add('admin.view_security')
      break
    case 'readonly':
      p.add('admin.view_security')
      break
    default:
      break
  }
  return p
}

export const ADMIN_ROLE_DISPLAY: Record<AdminRole, string> = {
  super_admin: 'Super admin',
  hq_admin: 'HQ admin',
  platform_admin: 'Platform admin',
  risk_admin: 'Risk admin',
  finance_admin: 'Finance admin',
  operator: 'Operator',
  support: 'Support',
  readonly: 'Read-only',
}

export function getPermissionsForRole(role: AdminRole): readonly AdminPermission[] {
  return [...permSet(role)].sort() as AdminPermission[]
}

export function getCapabilitiesForRole(role: AdminRole): AdminCapabilityFlags {
  const s = permSet(role)
  return {
    canViewAdmin: s.has('admin.view'),
    canRefreshProbe: s.has('admin.refresh_probe'),
    canViewSecurity: s.has('admin.view_security'),
    canExportSnapshot: s.has('admin.export_snapshot'),
    ...FALSE_CAP,
  }
}

export function buildAdminAccessState(role: AdminRole, actorId: string, actorLabel: string): AdminAccessState {
  const caps = getCapabilitiesForRole(role)
  const permissions = getPermissionsForRole(role)
  return { role, actorId, actorLabel, permissions, ...caps }
}
