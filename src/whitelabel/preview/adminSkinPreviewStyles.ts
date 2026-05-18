import type { TenantAdminPresetId } from '../tenantPresetTypes'

/** Mini admin shell backgrounds for skin preview cards (mock UI only). */
export const ADMIN_SHELL_PREVIEW: Record<TenantAdminPresetId, string> = {
  'dark-professional': 'bg-[#0a0d11]',
  banking: 'bg-[#0a0f14]',
  'trading-desk': 'bg-gradient-to-br from-[#0a0d11] to-[#11161d]',
  'modern-glass': 'bg-[#0a0d11]/80 backdrop-blur-sm',
}
