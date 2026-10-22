'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { BulkImportModal } from '@/components/app/users/BulkImportModal';
import { ChangeRoleModal } from '@/components/app/users/ChangeRoleModal';
import { CreateUserDrawer } from '@/components/app/users/CreateUserDrawer';
import { EditUserModal } from '@/components/app/users/EditUserModal';
import { useAuth } from '@/hooks/useAuth';
import { useDialogAccessibility } from '@/hooks/useDialogAccessibility';
import { useUsers } from '@/hooks/useUsers';
import {
  type ChangeRoleFormData,
  type CreateUserFormData,
  type CsvUserRow,
  type UserRole,
  type UserStatus,
} from '@/lib/validation';

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  batch?: string;
  mentorName?: string;
  hasLoggedIn?: boolean;
  mustChangePassword?: boolean;
  activeMenteesCount?: number;
  isLastSuperAdmin?: boolean;
}

interface ConfirmStatusModalProps {
  user: UserItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isSubmitting: boolean;
}

function ConfirmStatusModal({
  user,
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}: ConfirmStatusModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useDialogAccessibility({
    isOpen,
    onClose,
    dialogRef,
  });

  if (!isOpen || !user) return null;

  const isDeactivating = user.status === 'ACTIVE';

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm duration-150">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-status-modal-title"
        className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{isDeactivating ? '⚠️' : '🔄'}</span>
            <h3 id="confirm-status-modal-title" className="text-lg font-bold text-slate-900">
              {isDeactivating ? 'Deactivate Account' : 'Activate Account'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close dialog"
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40"
          >
            ✕
          </button>
        </div>

        <p className="mt-3 text-sm text-slate-600">
          {isDeactivating ? (
            <>
              Are you sure you want to deactivate{' '}
              <strong className="text-slate-900">{user.name}</strong> ({user.email})? They will
              immediately lose platform access until reactivated.
            </>
          ) : (
            <>
              Are you sure you want to reactivate{' '}
              <strong className="text-slate-900">{user.name}</strong> ({user.email})? They will
              regain platform access.
            </>
          )}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void onConfirm()}
            disabled={isSubmitting}
            className={`rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-50 ${
              isDeactivating ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isSubmitting
              ? isDeactivating
                ? 'Deactivating...'
                : 'Activating...'
              : isDeactivating
                ? 'Yes, Deactivate'
                : 'Yes, Activate'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function UsersTable() {
  const router = useRouter();
  const { user: currentUser, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  useEffect(() => {
    if (!isAuthLoading) {
      if (!isAuthenticated || !currentUser) {
        router.replace('/login');
      } else if (currentUser.mustChangePassword) {
        router.replace('/change-password');
      } else if (currentUser.role !== 'SUPER_ADMIN') {
        router.replace(currentUser.role === 'MENTOR' ? '/mentor' : '/mentee');
      }
    }
  }, [isAuthLoading, isAuthenticated, currentUser, router]);

  const {
    users: apiUsers,
    total: totalCount,
    counts,
    isLoading,
    error: usersError,
    fetchUsers,
    createUser,
    createUsersBulk,
    updateUser,
    changeRole,
    toggleStatus,
    resendInvite,
  } = useUsers();

  // Modal controls
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [userToChangeRole, setUserToChangeRole] = useState<UserItem | null>(null);
  const [userToEdit, setUserToEdit] = useState<UserItem | null>(null);
  const [userToConfirmStatus, setUserToConfirmStatus] = useState<UserItem | null>(null);
  const [isStatusSubmitting, setIsStatusSubmitting] = useState(false);

  // In-flight row actions tracking
  const [inFlightAction, setInFlightAction] = useState<Record<string, 'resend' | 'status'>>({});

  // Toast notification state with unmount cleanup
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 4000);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const activeAdminsCount = useMemo(
    () => apiUsers.filter((u) => u.role === 'SUPER_ADMIN' && u.isActive).length,
    [apiUsers],
  );

  const users: UserItem[] = useMemo(() => {
    return apiUsers.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.isActive ? 'ACTIVE' : 'INACTIVE',
      hasLoggedIn: u.lastLoginAt !== null,
      mustChangePassword: u.mustChangePassword,
      isLastSuperAdmin: u.role === 'SUPER_ADMIN' && activeAdminsCount <= 1,
    }));
  }, [apiUsers, activeAdminsCount]);

  // Search debounce ref
  const searchDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleFilterUpdate = (newRole: string, newStatus: string, newSearch: string) => {
    void fetchUsers({
      role: newRole !== 'ALL' ? newRole : undefined,
      status: newStatus !== 'ALL' ? newStatus : undefined,
      search: newSearch.trim() || undefined,
    });
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (searchDebounceTimerRef.current) {
      clearTimeout(searchDebounceTimerRef.current);
    }
    searchDebounceTimerRef.current = setTimeout(() => {
      handleFilterUpdate(selectedRole, selectedStatus, val);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (searchDebounceTimerRef.current) {
        clearTimeout(searchDebounceTimerRef.current);
      }
    };
  }, []);

  // Filtered dataset
  const filteredUsers = users;

  const handleCreateUser = async (data: CreateUserFormData) => {
    try {
      const newUser = await createUser(data);
      showToast(`User ${newUser.name} created successfully.`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create user';
      showToast(msg, 'error');
      throw err;
    }
  };

  const handleRoleChangeSuccess = async (userId: string, data: ChangeRoleFormData) => {
    try {
      await changeRole(userId, data);
      showToast(`Role updated to ${data.newRole}.`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update role';
      showToast(msg, 'error');
      throw err;
    }
  };

  const handleEditUserSuccess = async (userId: string, data: { name: string; email: string }) => {
    try {
      await updateUser(userId, data);
      showToast(`User ${data.name} updated successfully.`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update user';
      showToast(msg, 'error');
      throw err;
    }
  };

  const handleResendInvite = async (userId: string, userName: string) => {
    if (inFlightAction[userId]) return;
    setInFlightAction((prev) => ({ ...prev, [userId]: 'resend' }));
    try {
      const res = await resendInvite(userId);
      showToast(res.message, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Failed to resend invite to ${userName}`;
      showToast(msg, 'error');
    } finally {
      setInFlightAction((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    }
  };

  const handleBulkImport = async (
    rows: CsvUserRow[],
    onProgress?: (progress: { current: number; total: number }) => void,
  ) => {
    const result = await createUsersBulk(rows, onProgress);
    if (result.failures.length === 0) {
      showToast(`Bulk import complete: ${result.successCount} user(s) created.`, 'success');
    } else {
      showToast(
        `Bulk import finished: ${result.successCount} created, ${result.failures.length} failed.`,
        'error',
      );
    }
    return result;
  };

  const handleRequestToggleStatus = (user: UserItem) => {
    if (user.status === 'ACTIVE') {
      if (currentUser && user.id === currentUser.id) {
        showToast('You cannot deactivate your own administrative account.', 'error');
        return;
      }
      if (user.isLastSuperAdmin) {
        showToast('Cannot deactivate the last active Super Admin on the platform.', 'error');
        return;
      }
    }
    setUserToConfirmStatus(user);
  };

  const handleConfirmToggleStatus = async () => {
    if (!userToConfirmStatus) return;
    const user = userToConfirmStatus;
    const nextActivate = user.status !== 'ACTIVE';
    setIsStatusSubmitting(true);
    setInFlightAction((prev) => ({ ...prev, [user.id]: 'status' }));
    try {
      await toggleStatus(user.id, nextActivate);
      showToast(
        `User ${user.name} ${nextActivate ? 'activated' : 'deactivated'} successfully.`,
        'success',
      );
      setUserToConfirmStatus(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to toggle status';
      showToast(msg, 'error');
    } finally {
      setIsStatusSubmitting(false);
      setInFlightAction((prev) => {
        const next = { ...prev };
        delete next[user.id];
        return next;
      });
    }
  };

  if (isAuthLoading || !isAuthenticated || !currentUser || currentUser.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Verifying administrator access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
            <Link href="/admin" className="transition-colors hover:text-purple-700">
              Administration
            </Link>
            <span>/</span>
            <span className="text-purple-700">User Directory</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Users</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Manage system access, initial onboarding invites, and audited role changes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsBulkImportOpen(true)}
            className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <span>📥</span>
            <span>Bulk Import CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <span>+</span>
            <span>Create User</span>
          </button>
        </div>
      </div>

      {/* Summary Telemetry Badges */}
      <div className="flex w-fit items-center gap-2 rounded-xl bg-slate-100 p-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setSelectedStatus('ALL');
            handleFilterUpdate(selectedRole, 'ALL', search);
          }}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all ${
            selectedStatus === 'ALL'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Total Users</span>
          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono font-bold text-blue-600">
            {counts.total || totalCount}
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            setSelectedStatus('ACTIVE');
            handleFilterUpdate(selectedRole, 'ACTIVE', search);
          }}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all ${
            selectedStatus === 'ACTIVE'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Active</span>
          <span className="font-mono text-slate-500">{counts.active}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setSelectedStatus('INACTIVE');
            handleFilterUpdate(selectedRole, 'INACTIVE', search);
          }}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all ${
            selectedStatus === 'INACTIVE'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-slate-400" />
          <span>Inactive</span>
          <span className="font-mono text-slate-500">{counts.inactive}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-12">
          {/* Search Box */}
          <div className="relative md:col-span-5">
            <span className="absolute top-2.5 left-3.5 text-sm text-slate-400">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name or email..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pr-3 pl-9 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Role Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedRole}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedRole(val);
                handleFilterUpdate(val, selectedStatus, search);
              }}
              className="h-10 w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 transition-all focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="MENTOR">Mentor</option>
              <option value="MENTEE">Mentee</option>
            </select>
          </div>

          {/* Batch Filter (Coming Soon) */}
          <div className="md:col-span-3">
            <select
              value="ALL"
              disabled
              aria-label="Batch filter coming soon"
              className="h-10 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3 text-sm text-slate-400 focus:outline-none"
            >
              <option value="ALL">Batches (Coming soon)</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="text-right md:col-span-2">
            <button
              type="button"
              onClick={() => {
                if (searchDebounceTimerRef.current) {
                  clearTimeout(searchDebounceTimerRef.current);
                }
                setSearch('');
                setSelectedRole('ALL');
                setSelectedStatus('ALL');
                handleFilterUpdate('ALL', 'ALL', '');
              }}
              className="p-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-slate-200/80 bg-slate-50/80 text-xs font-semibold tracking-wider text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-3.5">Name</th>
                <th className="px-4 py-3.5">Email</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">
                  Batch{' '}
                  <span className="text-[10px] font-normal text-slate-400 normal-case">(Soon)</span>
                </th>
                <th className="px-4 py-3.5">
                  Mentor{' '}
                  <span className="text-[10px] font-normal text-slate-400 normal-case">(Soon)</span>
                </th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
                      <span>Loading user directory...</span>
                    </div>
                  </td>
                </tr>
              ) : usersError ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-lg text-red-600">
                        ⚠️
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Failed to load users</p>
                        <p className="mt-1 text-xs text-slate-500">{usersError}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          void fetchUsers({
                            role: selectedRole !== 'ALL' ? selectedRole : undefined,
                            status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
                            search: search.trim() || undefined,
                          });
                        }}
                        className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                      >
                        Retry Fetch
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No users match your filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const initials =
                    (u.name || 'User')
                      .split(' ')
                      .filter(Boolean)
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase() || 'U';

                  const isSelf = currentUser?.id === u.id;
                  const isBlockedAdmin = Boolean(u.isLastSuperAdmin && u.status === 'ACTIVE');
                  const isDeactivateDisabled = (isSelf || isBlockedAdmin) && u.status === 'ACTIVE';
                  const isRowPending = Boolean(inFlightAction[u.id]);
                  const deactivateTooltip = isSelf
                    ? 'Cannot deactivate your own account'
                    : isBlockedAdmin
                      ? 'Cannot deactivate the last active Super Admin'
                      : undefined;

                  return (
                    <tr key={u.id} className="transition-colors hover:bg-slate-50/60">
                      {/* Name & Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
                            {initials}
                          </div>
                          <div>
                            <span className="block font-semibold text-slate-900">
                              {u.name || '—'}
                            </span>
                            {u.mustChangePassword ? (
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-[11px] font-semibold text-amber-800">
                                  Invite pending
                                </span>
                                <button
                                  type="button"
                                  disabled={inFlightAction[u.id] === 'resend'}
                                  onClick={() => {
                                    void handleResendInvite(u.id, u.name);
                                  }}
                                  className="min-h-7 rounded px-2 py-0.5 text-[11px] font-semibold text-purple-700 transition-colors hover:bg-purple-50 hover:text-purple-900 disabled:opacity-50"
                                >
                                  {inFlightAction[u.id] === 'resend' ? 'Sending...' : 'Resend'}
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-4 font-mono text-xs text-slate-600 select-all">
                        {u.email}
                      </td>

                      {/* Role Badge */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-xs font-medium ${
                            u.role === 'SUPER_ADMIN'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'MENTOR'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      {/* Batch */}
                      <td className="px-4 py-4 font-mono text-xs text-slate-700">
                        {u.batch || '—'}
                      </td>

                      {/* Mentor */}
                      <td className="px-4 py-4 text-xs text-slate-700">{u.mentorName || '—'}</td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              u.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {u.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setUserToEdit(u)}
                            className="min-h-9.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setUserToChangeRole(u)}
                            className="min-h-9.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50"
                          >
                            Change Role
                          </button>
                          <button
                            type="button"
                            disabled={isDeactivateDisabled || isRowPending}
                            title={deactivateTooltip}
                            onClick={() => handleRequestToggleStatus(u)}
                            className={`min-h-9.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                              u.status === 'ACTIVE'
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {inFlightAction[u.id] === 'status'
                              ? 'Updating...'
                              : u.status === 'ACTIVE'
                                ? 'Deactivate'
                                : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawers and Modals */}
      <CreateUserDrawer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreateUser}
      />

      <EditUserModal
        user={userToEdit}
        isOpen={Boolean(userToEdit)}
        onClose={() => setUserToEdit(null)}
        onSuccess={handleEditUserSuccess}
      />

      <ChangeRoleModal
        user={userToChangeRole}
        isOpen={Boolean(userToChangeRole)}
        onClose={() => setUserToChangeRole(null)}
        onSuccess={handleRoleChangeSuccess}
      />

      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onImport={handleBulkImport}
      />

      <ConfirmStatusModal
        user={userToConfirmStatus}
        isOpen={Boolean(userToConfirmStatus)}
        onClose={() => setUserToConfirmStatus(null)}
        onConfirm={handleConfirmToggleStatus}
        isSubmitting={isStatusSubmitting}
      />

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className={`animate-in fade-in fixed right-6 bottom-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
            toast.type === 'error'
              ? 'border border-red-300 bg-red-900 text-white'
              : 'bg-slate-900 text-white'
          }`}
        >
          <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>
          <span>{toast.message}</span>
        </div>
      ) : null}
    </div>
  );
}
