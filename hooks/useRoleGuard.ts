'use client';

import {
  useRoleRedirect,
  type UseRoleRedirectReturn,
  type UserRole,
} from '@/hooks/useRoleRedirect';

export { getRolePortalPath, redirectUserByRole } from '@/hooks/useRoleRedirect';
export type { UseRoleRedirectReturn as UseRoleGuardReturn, UserRole };

export function useRoleGuard(requiredRole?: UserRole | UserRole[]): UseRoleRedirectReturn {
  let allowedRoles: UserRole[] | undefined;
  if (Array.isArray(requiredRole)) {
    allowedRoles = requiredRole;
  } else if (requiredRole) {
    allowedRoles = [requiredRole];
  }
  return useRoleRedirect(allowedRoles ? { allowedRoles } : {});
}
