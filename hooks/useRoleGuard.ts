'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/hooks/useAuth';
import type { AuthUser, UserRole } from '@/services/auth.service';

export type { UserRole };

export function getRolePortalPath(role: UserRole): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/admin';
    case 'MENTOR':
      return '/mentor';
    case 'MENTEE':
      return '/mentee';
  }
}

export interface UseRoleGuardReturn {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthorized: boolean;
}

export function useRoleGuard(requiredRole?: UserRole | UserRole[]): UseRoleGuardReturn {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const isRoleAuthorized = Boolean(
    user &&
    (!requiredRole ||
      (Array.isArray(requiredRole)
        ? requiredRole.includes(user.role)
        : user.role === requiredRole)),
  );

  const isAuthorized =
    !isLoading && isAuthenticated && Boolean(user) && !user?.mustChangePassword && isRoleAuthorized;

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.replace('/login');
      } else if (user.mustChangePassword) {
        router.replace('/change-password');
      } else if (requiredRole && !isRoleAuthorized) {
        router.replace(getRolePortalPath(user.role));
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRole, isRoleAuthorized, router]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isAuthorized,
  };
}
