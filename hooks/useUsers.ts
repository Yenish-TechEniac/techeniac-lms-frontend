'use client';

import { useCallback, useEffect, useState } from 'react';

import type { ChangeRoleFormData, CreateUserFormData, EditUserFormData } from '@/lib/validation';
import { type ApiUser, type UserQueryFilters, usersService } from '@/services/users.service';

export interface UseUsersReturn {
  users: ApiUser[];
  total: number;
  isLoading: boolean;
  error: string | null;
  fetchUsers: (filters?: UserQueryFilters) => Promise<void>;
  createUser: (data: CreateUserFormData) => Promise<ApiUser>;
  updateUser: (id: string, data: Partial<EditUserFormData>) => Promise<ApiUser>;
  changeRole: (id: string, data: ChangeRoleFormData) => Promise<ApiUser>;
  toggleStatus: (id: string, activate: boolean) => Promise<ApiUser>;
  resendInvite: (id: string) => Promise<{ message: string }>;
}

const DEFAULT_FILTERS: UserQueryFilters = {};

export function useUsers(initialFilters: UserQueryFilters = DEFAULT_FILTERS): UseUsersReturn {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(
    async (filters?: UserQueryFilters) => {
      try {
        const data = await usersService.listUsers(filters ?? initialFilters);
        setUsers(data.users);
        setTotal(data.total);
        setError(null);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to fetch users';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [initialFilters],
  );

  const filterKey = `${initialFilters.page ?? ''}-${initialFilters.limit ?? ''}-${initialFilters.role ?? ''}-${initialFilters.status ?? ''}-${initialFilters.search ?? ''}`;

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const data = await usersService.listUsers(initialFilters);
        if (!ignore) {
          setUsers(data.users);
          setTotal(data.total);
          setError(null);
        }
      } catch (err: unknown) {
        if (!ignore) {
          const message = err instanceof Error ? err.message : 'Failed to fetch users';
          setError(message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void load();
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  const createUser = async (data: CreateUserFormData): Promise<ApiUser> => {
    const newUser = await usersService.createUser(data);
    await fetchUsers();
    return newUser;
  };

  const updateUser = async (id: string, data: Partial<EditUserFormData>): Promise<ApiUser> => {
    const updated = await usersService.updateUser(id, data);
    await fetchUsers();
    return updated;
  };

  const changeRole = async (id: string, data: ChangeRoleFormData): Promise<ApiUser> => {
    const updated = await usersService.changeRole(id, data);
    await fetchUsers();
    return updated;
  };

  const toggleStatus = async (id: string, activate: boolean): Promise<ApiUser> => {
    const updated = await usersService.toggleStatus(id, activate);
    await fetchUsers();
    return updated;
  };

  const resendInvite = async (id: string): Promise<{ message: string }> => {
    return usersService.resendInvite(id);
  };

  return {
    users,
    total,
    isLoading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    changeRole,
    toggleStatus,
    resendInvite,
  };
}
