'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { ChangeRoleFormData, CreateUserFormData, EditUserFormData } from '@/lib/validation';
import {
  type ApiUser,
  type UserDirectoryCounts,
  type UserQueryFilters,
  usersService,
} from '@/services/users.service';

export type BulkImportRowData = CreateUserFormData & { rowNumber?: number };

export interface BulkImportFailure {
  row: BulkImportRowData;
  error: string;
}

export interface BulkImportResult {
  successCount: number;
  failures: BulkImportFailure[];
}

export interface UseUsersReturn {
  users: ApiUser[];
  total: number;
  counts: UserDirectoryCounts;
  isLoading: boolean;
  error: string | null;
  fetchUsers: (filters?: UserQueryFilters) => Promise<void>;
  createUser: (data: CreateUserFormData) => Promise<ApiUser>;
  createUsersBulk: (
    rows: BulkImportRowData[],
    onProgress?: (progress: { current: number; total: number }) => void,
  ) => Promise<BulkImportResult>;
  updateUser: (id: string, data: Partial<EditUserFormData>) => Promise<ApiUser>;
  changeRole: (id: string, data: ChangeRoleFormData) => Promise<ApiUser>;
  toggleStatus: (id: string, activate: boolean) => Promise<ApiUser>;
  resendInvite: (id: string) => Promise<{ message: string }>;
}

const DEFAULT_FILTERS: UserQueryFilters = {};

export function useUsers(initialFilters: UserQueryFilters = DEFAULT_FILTERS): UseUsersReturn {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<UserDirectoryCounts>({
    total: 0,
    active: 0,
    inactive: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active filters and request sequencing guards
  const activeFiltersRef = useRef<UserQueryFilters>(initialFilters);
  const requestSeqRef = useRef<number>(0);

  const fetchUsers = useCallback(async (filters?: UserQueryFilters) => {
    const currentSeq = ++requestSeqRef.current;
    setIsLoading(true);
    try {
      const targetFilters = filters ?? activeFiltersRef.current;
      activeFiltersRef.current = targetFilters;
      const data = await usersService.listUsers(targetFilters);
      if (currentSeq !== requestSeqRef.current) return;
      setUsers(data.users);
      setTotal(data.total);
      if (data.counts) {
        setCounts(data.counts);
      } else {
        setCounts((prev) =>
          prev.total > 0
            ? prev
            : {
                total: data.total,
                active: data.users.filter((u) => u.isActive).length,
                inactive: data.users.filter((u) => !u.isActive).length,
              },
        );
      }
      setError(null);
    } catch (err: unknown) {
      if (currentSeq !== requestSeqRef.current) return;
      const message = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(message);
    } finally {
      if (currentSeq === requestSeqRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const filterKey = `${initialFilters.page ?? ''}-${initialFilters.limit ?? ''}-${initialFilters.role ?? ''}-${initialFilters.status ?? ''}-${initialFilters.search ?? ''}`;

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const data = await usersService.listUsers(initialFilters);
        if (!ignore) {
          setUsers(data.users);
          setTotal(data.total);
          if (data.counts) {
            setCounts(data.counts);
          } else {
            setCounts({
              total: data.total,
              active: data.users.filter((u) => u.isActive).length,
              inactive: data.users.filter((u) => !u.isActive).length,
            });
          }
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
    await fetchUsers(activeFiltersRef.current);
    return newUser;
  };

  const createUsersBulk = async (
    rows: BulkImportRowData[],
    onProgress?: (progress: { current: number; total: number }) => void,
  ): Promise<BulkImportResult> => {
    let successCount = 0;
    const failures: BulkImportFailure[] = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r) continue;
      onProgress?.({ current: i + 1, total: rows.length });
      try {
        await usersService.createUser({ name: r.name, email: r.email, role: r.role });
        successCount++;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to create user';
        failures.push({ row: r, error: message });
      }
    }

    await fetchUsers(activeFiltersRef.current);
    return { successCount, failures };
  };

  const updateUser = async (id: string, data: Partial<EditUserFormData>): Promise<ApiUser> => {
    const updated = await usersService.updateUser(id, data);
    await fetchUsers(activeFiltersRef.current);
    return updated;
  };

  const changeRole = async (id: string, data: ChangeRoleFormData): Promise<ApiUser> => {
    const updated = await usersService.changeRole(id, data);
    await fetchUsers(activeFiltersRef.current);
    return updated;
  };

  const toggleStatus = async (id: string, activate: boolean): Promise<ApiUser> => {
    const updated = await usersService.toggleStatus(id, activate);
    await fetchUsers(activeFiltersRef.current);
    return updated;
  };

  const resendInvite = async (id: string): Promise<{ message: string }> => {
    return usersService.resendInvite(id);
  };

  return {
    users,
    total,
    counts,
    isLoading,
    error,
    fetchUsers,
    createUser,
    createUsersBulk,
    updateUser,
    changeRole,
    toggleStatus,
    resendInvite,
  };
}
