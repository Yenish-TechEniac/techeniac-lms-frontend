'use client';

import {
  useRoleRedirect,
  type UseRoleRedirectReturn,
  type UserRole,
} from '@/hooks/useRoleRedirect';

export { getRolePortalPath, redirectUserByRole } from '@/hooks/useRoleRedirect';
export type { UseRoleRedirectReturn as UseRoleGuardReturn, UserRole };

export function useRoleGuard(requiredRole?: UserRole | UserRole[]): UseRoleRedirectReturn {
  const allowedRoles = requiredRole
    ? Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole]
    : undefined;
  return useRoleRedirect(allowedRoles ? { allowedRoles } : {});
}
