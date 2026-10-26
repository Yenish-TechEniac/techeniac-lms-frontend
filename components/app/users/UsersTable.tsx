'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { BulkImportModal, type CsvUserRowWithLine } from '@/components/app/users/BulkImportModal';
import { ChangeRoleModal } from '@/components/app/users/ChangeRoleModal';
import { CreateUserDrawer } from '@/components/app/users/CreateUserDrawer';
import { EditUserModal } from '@/components/app/users/EditUserModal';
import { Modal } from '@/components/patterns/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { H1, P, Span, Typography } from '@/components/ui/Typography';
import { useAuth } from '@/hooks/useAuth';
import { type UserQueryFilters, useUsers } from '@/hooks/useUsers';
import {
  type ChangeRoleFormData,
  type CreateUserFormData,
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
  if (!isOpen || !user) return null;

  const isDeactivating = user.status === 'ACTIVE';

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={
        <Span className="inline-flex items-center gap-2">
          <Span className="text-xl">{isDeactivating ? '⚠️' : '🔄'}</Span>
          <Span>{isDeactivating ? 'Deactivate Account' : 'Activate Account'}</Span>
        </Span>
      }
      size="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant={isDeactivating ? 'danger' : 'primary'}
            size="sm"
            onClick={() => void onConfirm()}
            isLoading={isSubmitting}
          >
            {isDeactivating ? 'Yes, Deactivate' : 'Yes, Activate'}
          </Button>
        </>
      }
    >
      <Typography as="p" className="text-sm text-slate-600">
        {isDeactivating ? (
          <>
            Are you sure you want to deactivate{' '}
            <strong className="text-slate-900">{user.name}</strong> ({user.email})? They will
            immediately lose platform access until reactivated.
          </>
        ) : (
          <>
            Are you sure you want to reactivate{' '}
            <strong className="text-slate-900">{user.name}</strong> ({user.email})? They will regain
            platform access.
          </>
        )}
      </Typography>
    </Modal>
  );
}

interface UserSearchInputProps {
  value: string;
  onSearchChange: (val: string) => void;
}

function UserSearchInput({ value, onSearchChange }: Readonly<UserSearchInputProps>) {
  const [localValue, setLocalValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onSearchChangeRef = useRef(onSearchChange);

  useEffect(() => {
    onSearchChangeRef.current = onSearchChange;
  });

  if (prevValue !== value) {
    setPrevValue(value);
    setLocalValue(value);
  }

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    setLocalValue(nextVal);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      onSearchChangeRef.current(nextVal);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <Span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm text-slate-400">
        🔍
      </Span>
      <Input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder="Search by name or email..."
        className="h-10 pl-9 text-sm"
      />
    </div>
  );
}

const MENTOR_ROSTER_FILTERS: UserQueryFilters = {
  role: 'MENTOR',
  limit: 100,
};

interface FilterUpdateOptions {
  role?: string;
  status?: string;
  search?: string;
  mentorId?: string;
}

export function UsersTable() {
  const router = useRouter();
  const { user: currentUser, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedMentor, setSelectedMentor] = useState<string>('ALL');

  const filtersRef = useRef({
    role: selectedRole,
    status: selectedStatus,
    search,
    mentorId: selectedMentor,
  });

  useEffect(() => {
    filtersRef.current = {
      role: selectedRole,
      status: selectedStatus,
      search,
      mentorId: selectedMentor,
    };
  }, [selectedRole, selectedStatus, search, selectedMentor]);

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

  const { users: mentorUsers, isLoading: isMentorsLoading } = useUsers(MENTOR_ROSTER_FILTERS);

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

  const mentors = useMemo(() => {
    return mentorUsers.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      isActive: m.isActive,
    }));
  }, [mentorUsers]);

  const isMentorFilterDisabled = selectedRole === 'SUPER_ADMIN' || selectedRole === 'MENTOR';

  const handleFilterUpdate = ({
    role = filtersRef.current.role,
    status = filtersRef.current.status,
    search: searchVal = filtersRef.current.search,
    mentorId = filtersRef.current.mentorId,
  }: FilterUpdateOptions = {}) => {
    filtersRef.current = {
      role,
      status,
      search: searchVal,
      mentorId,
    };

    void fetchUsers({
      role: role !== 'ALL' ? role : undefined,
      status: status !== 'ALL' ? status : undefined,
      search: searchVal.trim() || undefined,
      mentorId: mentorId !== 'ALL' ? mentorId : undefined,
    });
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    handleFilterUpdate({ search: val });
  };

  const isInitialLoading = isLoading && apiUsers.length === 0;

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
    rows: CsvUserRowWithLine[],
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
          <P className="text-sm font-medium text-slate-500">Verifying administrator access...</P>
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
            <Span>/</Span>
            <Span className="text-purple-700">User Directory</Span>
          </div>
          <H1 className="text-3xl font-extrabold tracking-tight text-slate-900">Users</H1>
          <P variant="muted" className="mt-1 max-w-2xl text-sm text-slate-600">
            Manage system access, initial onboarding invites, and audited role changes.
          </P>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsBulkImportOpen(true)}
          >
            <Span>📥</Span>
            <Span>Bulk Import CSV</Span>
          </Button>
          <Button type="button" variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
            <Span>+</Span>
            <Span>Create User</Span>
          </Button>
        </div>
      </div>

      {/* Summary Telemetry Badges */}
      <div className="flex w-fit items-center gap-2 rounded-xl bg-slate-100 p-1 text-xs font-semibold">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedStatus('ALL');
            handleFilterUpdate({ status: 'ALL' });
          }}
          className={`h-8 gap-2 rounded-lg px-3 text-xs ${
            selectedStatus === 'ALL'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Span>Total Users</Span>
          <Span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono font-bold text-blue-600">
            {counts.total || totalCount}
          </Span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedStatus('ACTIVE');
            handleFilterUpdate({ status: 'ACTIVE' });
          }}
          className={`h-8 gap-2 rounded-lg px-3 text-xs ${
            selectedStatus === 'ACTIVE'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Span className="h-2 w-2 rounded-full bg-emerald-500" />
          <Span>Active</Span>
          <Span className="font-mono text-slate-500">{counts.active}</Span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedStatus('INACTIVE');
            handleFilterUpdate({ status: 'INACTIVE' });
          }}
          className={`h-8 gap-2 rounded-lg px-3 text-xs ${
            selectedStatus === 'INACTIVE'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Span className="h-2 w-2 rounded-full bg-slate-400" />
          <Span>Inactive</Span>
          <Span className="font-mono text-slate-500">{counts.inactive}</Span>
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-12">
          {/* Search Box */}
          <div className="md:col-span-5">
            <UserSearchInput value={search} onSearchChange={handleSearchChange} />
          </div>

          {/* Role Filter */}
          <div className="md:col-span-2">
            <Select
              value={selectedRole}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedRole(val);
                const isMentorRestricted = val === 'SUPER_ADMIN' || val === 'MENTOR';
                if (isMentorRestricted && selectedMentor !== 'ALL') {
                  setSelectedMentor('ALL');
                  handleFilterUpdate({ role: val, mentorId: 'ALL' });
                } else {
                  handleFilterUpdate({ role: val });
                }
              }}
              aria-label="Filter by role"
              className="h-10 text-sm font-normal"
            >
              <option value="ALL">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="MENTOR">Mentor</option>
              <option value="MENTEE">Mentee</option>
            </Select>
          </div>

          {/* Mentor Filter */}
          <div className="md:col-span-3">
            <Select
              value={selectedMentor}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedMentor(val);
                handleFilterUpdate({ mentorId: val });
              }}
              aria-label="Filter by mentor"
              disabled={isMentorFilterDisabled}
              title={
                isMentorFilterDisabled
                  ? `Mentor filter is not applicable for ${selectedRole === 'SUPER_ADMIN' ? 'Super Admins' : 'Mentors'}`
                  : undefined
              }
              className="h-10 text-sm font-normal"
            >
              {isMentorFilterDisabled ? (
                <option value="ALL">
                  N/A for {selectedRole === 'SUPER_ADMIN' ? 'Super Admins' : 'Mentors'}
                </option>
              ) : (
                <>
                  <option value="ALL">
                    {isMentorsLoading && mentorUsers.length === 0
                      ? 'Loading mentors...'
                      : 'All Mentors'}
                  </option>
                  {selectedMentor !== 'ALL' && !mentors.some((m) => m.id === selectedMentor) && (
                    <option value={selectedMentor} disabled>
                      Selected Mentor
                    </option>
                  )}
                  {mentors.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.email}){!m.isActive ? ' (Inactive)' : ''}
                    </option>
                  ))}
                </>
              )}
            </Select>
          </div>

          {/* Reset Filters */}
          <div className="text-right md:col-span-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('');
                setSelectedRole('ALL');
                setSelectedStatus('ALL');
                setSelectedMentor('ALL');
                handleFilterUpdate({
                  role: 'ALL',
                  status: 'ALL',
                  search: '',
                  mentorId: 'ALL',
                });
              }}
              className="p-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Reset Filters
            </Button>
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
                  <Span className="text-[10px] font-normal text-slate-400 normal-case">(Soon)</Span>
                </th>
                <th className="px-4 py-3.5">
                  Mentor{' '}
                  <Span className="text-[10px] font-normal text-slate-400 normal-case">(Soon)</Span>
                </th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y divide-slate-100 ${isLoading && !isInitialLoading ? 'opacity-60 transition-opacity' : ''}`}
            >
              {isInitialLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
                      <Span>Loading user directory...</Span>
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
                        <P className="text-sm font-semibold text-slate-900">Failed to load users</P>
                        <P variant="muted" className="mt-1 text-xs text-slate-500">
                          {usersError}
                        </P>
                      </div>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          handleFilterUpdate();
                        }}
                      >
                        Retry Fetch
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Span>No users match your filters.</Span>
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
                            <Span className="block font-semibold text-slate-900">
                              {u.name || '—'}
                            </Span>
                            {u.mustChangePassword ? (
                              <div className="mt-1 flex items-center gap-2">
                                <Span className="text-[11px] font-semibold text-amber-800">
                                  Invite pending
                                </Span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  disabled={inFlightAction[u.id] === 'resend'}
                                  onClick={() => {
                                    void handleResendInvite(u.id, u.name);
                                  }}
                                  className="min-h-11 px-2.5 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-50 hover:text-purple-900 disabled:opacity-50"
                                >
                                  {inFlightAction[u.id] === 'resend' ? 'Sending...' : 'Resend'}
                                </Button>
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
                        <Span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-xs font-medium ${
                            u.role === 'SUPER_ADMIN'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'MENTOR'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {u.role}
                        </Span>
                      </td>

                      {/* Batch */}
                      <td className="px-4 py-4 font-mono text-xs text-slate-700">
                        {u.batch || '—'}
                      </td>

                      {/* Mentor */}
                      <td className="px-4 py-4 text-xs text-slate-700">{u.mentorName || '—'}</td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <Span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <Span
                            className={`h-1.5 w-1.5 rounded-full ${
                              u.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {u.status}
                        </Span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setUserToEdit(u)}
                            className="min-h-11 min-w-11 text-xs text-slate-700 hover:bg-slate-100"
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setUserToChangeRole(u)}
                            className="min-h-11 min-w-11 text-xs text-blue-600 hover:bg-blue-50"
                          >
                            Change Role
                          </Button>
                          <Button
                            type="button"
                            variant={u.status === 'ACTIVE' ? 'danger' : 'outline'}
                            size="sm"
                            disabled={isDeactivateDisabled || isRowPending}
                            title={deactivateTooltip}
                            onClick={() => handleRequestToggleStatus(u)}
                            className="min-h-11 min-w-11 text-xs"
                          >
                            {inFlightAction[u.id] === 'status'
                              ? 'Updating...'
                              : u.status === 'ACTIVE'
                                ? 'Deactivate'
                                : 'Activate'}
                          </Button>
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
          <Span>{toast.type === 'error' ? '⚠️' : '✅'}</Span>
          <Span>{toast.message}</Span>
        </div>
      ) : null}
    </div>
  );
}
