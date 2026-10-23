'use client';

import { useEffect, useState } from 'react';

import { type RoleImpactData, usersService } from '@/services/users.service';

export interface UseRoleImpactOptions {
  userId?: string | undefined;
  newRole?: string | undefined;
  enabled?: boolean | undefined;
}

export function useRoleImpact({ userId, newRole, enabled = true }: UseRoleImpactOptions): {
  roleImpact: RoleImpactData | null;
  isLoadingImpact: boolean;
} {
  const [state, setState] = useState<{
    key: string | null;
    data: RoleImpactData | null;
  }>({
    key: null,
    data: null,
  });

  const queryKey = enabled && userId && newRole ? `${userId}:${newRole}` : null;

  useEffect(() => {
    if (!queryKey || !userId || !newRole) {
      return;
    }

    let ignore = false;

    void usersService
      .getRoleImpact(userId, newRole)
      .then((data) => {
        if (!ignore) {
          setState({ key: queryKey, data });
        }
      })
      .catch(() => {
        if (!ignore) {
          setState({ key: queryKey, data: null });
        }
      });

    return () => {
      ignore = true;
    };
  }, [queryKey, userId, newRole]);

  const isLoadingImpact = Boolean(queryKey && state.key !== queryKey);

  return {
    roleImpact: state.key === queryKey ? state.data : null,
    isLoadingImpact,
  };
}
