'use client';

import { useQuery } from '@tanstack/react-query';

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
  const isQueryEnabled = Boolean(enabled && userId && newRole);

  const { data: roleImpact = null, isLoading } = useQuery<RoleImpactData | null>({
    queryKey: ['users', 'role-impact', userId ?? '', newRole ?? ''],
    queryFn: () => usersService.getRoleImpact(userId!, newRole!),
    enabled: isQueryEnabled,
    staleTime: 60_000,
  });

  return {
    roleImpact,
    isLoadingImpact: isQueryEnabled && isLoading,
  };
}
