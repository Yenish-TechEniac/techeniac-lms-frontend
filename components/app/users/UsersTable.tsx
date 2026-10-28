'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { BulkImportModal, type CsvUserRowWithLine } from '@/components/app/users/BulkImportModal';
import { ChangeRoleModal } from '@/components/app/users/ChangeRoleModal';
import { CreateUserDrawer } from '@/components/app/users/CreateUserDrawer';
import { EditUserModal } from '@/components/app/users/EditUserModal';
import { Modal } from '@/components/patterns/Modal';
import { PaginationControls } from '@/components/patterns/PaginationControls';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { H1, P, Span, Typography } from '@/components/ui/Typography';
import { useAuth } from '@/hooks/useAuth';
import { useAllBatchMembers } from '@/hooks/useBatches';
import { DEFAULT_USERS_PAGE_SIZE, type UserQueryFilters, useUsers } from '@/hooks/useUsers';
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
  batch?: string | undefined;
  mentorName?: string | undefined;
  hasLoggedIn?: boolean | undefined;
  mustChangePassword?: boolean | undefined;
  activeMenteesCount?: number | undefined;
  isLastSuperAdmin?: boolean | undefined;
}

interface ToggleSwitchProps {
  checked: boolean;
  disabled?: boolean | undefined;
  onChange: () => void;
  title?: string | undefined;
  ariaLabel: string;
}

function ToggleSwitch({ checked, disabled, onChange, title, ariaLabel }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      title={title}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0044D3] focus-visible:ring-offset-2 ${
        checked ? 'bg-[#0044D3]' : 'bg-slate-300'
      } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
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
  isSearching?: boolean;
}

function UserSearchInput({
  value,
  onSearchChange,
  isSearching = false,
}: Readonly<UserSearchInputProps>) {
  const [localValue, setLocalValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const [isDebouncing, setIsDebouncing] = useState(false);
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
    setIsDebouncing(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setIsDebouncing(false);
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
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
        {isDebouncing || isSearching ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0044D3] border-t-transparent" />
        ) : (
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        )}
      </div>
      <Input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder="Search by name or email..."
        className="h-11 w-full rounded-xl pl-10 text-sm font-medium"
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
  page?: number;
  limit?: number;
}

export function UsersTable() {
  const router = useRouter();
  const { user: currentUser, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedMentor, setSelectedMentor] = useState<string>('ALL');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(DEFAULT_USERS_PAGE_SIZE);

  const filtersRef = useRef({
    role: selectedRole,
    status: selectedStatus,
    search,
    mentorId: selectedMentor,
    page,
    limit,
  });

  useEffect(() => {
    filtersRef.current = {
      role: selectedRole,
      status: selectedStatus,
      search,
      mentorId: selectedMentor,
      page,
      limit,
    };
  }, [selectedRole, selectedStatus, search, selectedMentor, page, limit]);

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

  const { users: mentorUsers } = useUsers(MENTOR_ROSTER_FILTERS);

  // Load batch roster and live member mappings so batch and mentor are always displayed accurately
  const { userBatchMap, userMentorMap } = useAllBatchMembers();

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
    return apiUsers.map((u) => {
      const mappedBatch =
        userBatchMap.get(u.id) ??
        (u as unknown as { batchName?: string; batch?: string }).batchName ??
        (u as unknown as { batchName?: string; batch?: string }).batch;

      const mappedMentor =
        userMentorMap.get(u.id) ??
        (u as unknown as { mentorName?: string; mentor?: { name: string } }).mentorName ??
        (u as unknown as { mentorName?: string; mentor?: { name: string } }).mentor?.name;

      let displayBatch: string;
      if (mappedBatch) {
        displayBatch = mappedBatch;
      } else if (u.role === 'SUPER_ADMIN') {
        displayBatch = 'System (All)';
      } else {
        displayBatch = 'Unassigned';
      }

      let displayMentor: string;
      if (mappedMentor) {
        displayMentor = mappedMentor;
      } else if (u.role === 'SUPER_ADMIN') {
        displayMentor = 'N/A (Admin)';
      } else if (u.role === 'MENTOR') {
        displayMentor = 'Self (Mentor)';
      } else {
        displayMentor = 'Unassigned';
      }

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.isActive ? 'ACTIVE' : 'INACTIVE',
        batch: displayBatch,
        mentorName: displayMentor,
        hasLoggedIn: u.lastLoginAt !== null,
        mustChangePassword: u.mustChangePassword,
        isLastSuperAdmin: u.role === 'SUPER_ADMIN' && activeAdminsCount <= 1,
      };
    });
  }, [apiUsers, userBatchMap, userMentorMap, activeAdminsCount]);

  const mentors = useMemo(() => {
    return mentorUsers.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      isActive: m.isActive,
    }));
  }, [mentorUsers]);

  const isMentorFilterDisabled = selectedRole === 'SUPER_ADMIN' || selectedRole === 'MENTOR';

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  const handleFilterUpdate = ({
    role = filtersRef.current.role,
    status = filtersRef.current.status,
    search: searchVal = filtersRef.current.search,
    mentorId = filtersRef.current.mentorId,
    page: newPage = filtersRef.current.page,
    limit: newLimit = filtersRef.current.limit,
  }: FilterUpdateOptions = {}) => {
    filtersRef.current = {
      role,
      status,
      search: searchVal,
      mentorId,
      page: newPage,
      limit: newLimit,
    };

    void fetchUsers({
      page: newPage,
      limit: newLimit,
      role: role !== 'ALL' ? role : undefined,
      status: status !== 'ALL' ? status : undefined,
      search: searchVal.trim() || undefined,
      mentorId: mentorId !== 'ALL' ? mentorId : undefined,
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    handleFilterUpdate({ page: newPage });
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    handleFilterUpdate({ page: 1, limit: newLimit });
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
    handleFilterUpdate({ search: val, page: 1 });
  };

  const isInitialLoading = isLoading && apiUsers.length === 0;

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
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0044D3] border-t-transparent" />
          <P className="text-sm font-medium text-slate-500">Verifying administrator access...</P>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Shifted Middle Buttons & Action Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Left: Breadcrumbs & Title */}
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
            <Link href="/admin" className="transition-colors hover:text-[#0044D3]">
              Administration
            </Link>
            <Span>/</Span>
            <Span className="text-[#0044D3]">User Directory</Span>
          </div>
          <H1 className="text-3xl font-extrabold tracking-tight text-slate-900">Users</H1>
        </div>

        {/* Middle: Shifted Status Telemetry Buttons */}
        <div className="flex items-center justify-center gap-2 self-center rounded-2xl border border-[#E1E6EC] bg-white p-1.5 shadow-xs">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedStatus('ALL');
              setPage(1);
              handleFilterUpdate({ status: 'ALL', page: 1 });
            }}
            className={`h-9 gap-2 rounded-xl px-3.5 text-xs font-semibold transition-all ${
              selectedStatus === 'ALL'
                ? 'bg-[#0044D3] text-white shadow-xs hover:bg-[#0039B3]'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Span>Total Users</Span>
            {isLoading ? (
              <Skeleton className="inline-block h-4 w-6 rounded-md bg-slate-300" />
            ) : (
              <Span
                className={`font-mono font-bold ${
                  selectedStatus === 'ALL' ? 'text-white' : 'text-[#0044D3]'
                }`}
              >
                {counts.total || totalCount}
              </Span>
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedStatus('ACTIVE');
              setPage(1);
              handleFilterUpdate({ status: 'ACTIVE', page: 1 });
            }}
            className={`h-9 gap-2 rounded-xl px-3.5 text-xs font-semibold transition-all ${
              selectedStatus === 'ACTIVE'
                ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Span
              className={`h-2 w-2 rounded-full ${
                selectedStatus === 'ACTIVE' ? 'bg-white' : 'bg-emerald-500'
              }`}
            />
            <Span>Active</Span>
            {isLoading ? (
              <Skeleton className="inline-block h-4 w-6 rounded-md bg-slate-300" />
            ) : (
              <Span
                className={`font-mono font-bold ${
                  selectedStatus === 'ACTIVE' ? 'text-white' : 'text-slate-600'
                }`}
              >
                {counts.active}
              </Span>
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedStatus('INACTIVE');
              setPage(1);
              handleFilterUpdate({ status: 'INACTIVE', page: 1 });
            }}
            className={`h-9 gap-2 rounded-xl px-3.5 text-xs font-semibold transition-all ${
              selectedStatus === 'INACTIVE'
                ? 'bg-slate-800 text-white shadow-xs hover:bg-slate-900'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Span
              className={`h-2 w-2 rounded-full ${
                selectedStatus === 'INACTIVE' ? 'bg-white' : 'bg-slate-400'
              }`}
            />
            <Span>Inactive</Span>
            {isLoading ? (
              <Skeleton className="inline-block h-4 w-6 rounded-md bg-slate-300" />
            ) : (
              <Span
                className={`font-mono font-bold ${
                  selectedStatus === 'INACTIVE' ? 'text-white' : 'text-slate-600'
                }`}
              >
                {counts.inactive}
              </Span>
            )}
          </Button>
        </div>

        {/* Right: Primary Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsBulkImportOpen(true)}
            className="h-11 gap-2 rounded-xl border-[#E1E6EC] px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            <Span>Bulk Import CSV</Span>
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="h-11 gap-2 rounded-xl bg-[#0044D3] px-5 text-sm font-semibold text-white shadow-xs hover:bg-[#0039B3]"
          >
            <Span className="text-base font-bold">+</Span>
            <Span>Create User</Span>
          </Button>
        </div>
      </div>

      {/* Filter Row with Search, Role Dropdown, Status Dropdown, and Mentor Dropdown */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#E1E6EC] bg-white p-3.5 shadow-xs">
        {/* Search Input */}
        <div className="min-w-[240px] flex-1">
          <UserSearchInput
            value={search}
            onSearchChange={handleSearchChange}
            isSearching={isLoading}
          />
        </div>

        {/* Role Filter Dropdown */}
        <div className="w-48">
          <Select
            value={selectedRole}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedRole(val);
              setPage(1);
              const isMentorRestricted = val === 'SUPER_ADMIN' || val === 'MENTOR';
              if (isMentorRestricted && selectedMentor !== 'ALL') {
                setSelectedMentor('ALL');
                handleFilterUpdate({ role: val, mentorId: 'ALL', page: 1 });
              } else {
                handleFilterUpdate({ role: val, page: 1 });
              }
            }}
            aria-label="Filter by role"
            className="h-11 text-xs font-semibold"
          >
            <option value="ALL">All Roles</option>
            <option value="SUPER_ADMIN">Super Admins</option>
            <option value="MENTOR">Mentors</option>
            <option value="MENTEE">Mentees</option>
          </Select>
        </div>

        {/* Status Dropdown */}
        <div className="w-40">
          <Select
            value={selectedStatus}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedStatus(val);
              setPage(1);
              handleFilterUpdate({ status: val, page: 1 });
            }}
            aria-label="Filter by status"
            className="h-11 text-xs font-semibold"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Users</option>
            <option value="INACTIVE">Inactive Users</option>
          </Select>
        </div>

        {/* Mentor Dropdown (when applicable) */}
        {!isMentorFilterDisabled ? (
          <div className="w-48">
            <Select
              value={selectedMentor}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedMentor(val);
                setPage(1);
                handleFilterUpdate({ mentorId: val, page: 1 });
              }}
              aria-label="Filter by assigned mentor"
              className="h-11 text-xs font-semibold"
            >
              <option value="ALL">All Mentors</option>
              {mentors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </div>
        ) : null}

        {/* Reset Filter Button */}
        {search ||
        selectedRole !== 'ALL' ||
        selectedStatus !== 'ALL' ||
        selectedMentor !== 'ALL' ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch('');
              setSelectedRole('ALL');
              setSelectedStatus('ALL');
              setSelectedMentor('ALL');
              setPage(1);
              handleFilterUpdate({
                role: 'ALL',
                status: 'ALL',
                search: '',
                mentorId: 'ALL',
                page: 1,
              });
            }}
            className="h-11 px-3.5 text-xs font-semibold text-[#0044D3] hover:bg-blue-50"
          >
            Reset Filters
          </Button>
        ) : null}
      </div>

      {/* Users Data Table */}
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Mentor</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && !isInitialLoading ? (
              // 5 Realistic Skeleton Rows while Querying/Searching
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-row-${i}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-32 rounded-md" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40 rounded-md" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24 rounded-md" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28 rounded-md" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <Skeleton className="h-8 w-20 rounded-lg" />
                      <Skeleton className="h-6 w-11 rounded-full" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : isInitialLoading ? (
              // Initial Loading Skeleton Rows
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`initial-skel-${i}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-4 w-32 rounded-md" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40 rounded-md" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24 rounded-md" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28 rounded-md" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <Skeleton className="h-8 w-20 rounded-lg" />
                      <Skeleton className="h-6 w-11 rounded-full" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : usersError ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center">
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
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-slate-400">
                  <Span>No users match your filters.</Span>
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => {
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
                  <TableRow key={u.id}>
                    {/* User Column (Avatar + Name + Status Badges) */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-[#0044D3] shadow-xs">
                          {initials}
                        </div>
                        <div>
                          <Span className="block text-base font-semibold text-slate-900">
                            {u.name || '—'}
                          </Span>
                          {u.mustChangePassword ? (
                            <div className="mt-1 flex items-center gap-2">
                              <Span className="text-xs font-semibold text-amber-700">
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
                                className="h-6 px-2 text-xs font-semibold text-[#0044D3] hover:bg-blue-50 disabled:opacity-50"
                              >
                                {inFlightAction[u.id] === 'resend' ? 'Sending...' : 'Resend'}
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>

                    {/* Email Column */}
                    <TableCell className="font-mono text-sm text-slate-600 select-all">
                      {u.email}
                    </TableCell>

                    {/* Batch Column */}
                    <TableCell className="text-sm font-medium">
                      {u.batch === 'Unassigned' ? (
                        <Span className="inline-flex items-center rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                          Unassigned
                        </Span>
                      ) : u.batch === 'System (All)' ? (
                        <Span className="inline-flex items-center rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700">
                          System (All)
                        </Span>
                      ) : (
                        <Span className="font-semibold text-slate-800">{u.batch}</Span>
                      )}
                    </TableCell>

                    {/* Mentor Column */}
                    <TableCell className="text-sm font-medium">
                      {u.mentorName === 'Unassigned' ? (
                        <Span className="inline-flex items-center rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                          Unassigned
                        </Span>
                      ) : u.mentorName === 'N/A (Admin)' ? (
                        <Span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                          N/A
                        </Span>
                      ) : u.mentorName === 'Self (Mentor)' ? (
                        <Span className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#0044D3]">
                          Self (Mentor)
                        </Span>
                      ) : (
                        <Span className="font-semibold text-slate-800">{u.mentorName}</Span>
                      )}
                    </TableCell>

                    {/* Actions Column (Pencil Edit Icon + Change Role + Toggle Switch) */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        {/* Edit Action - Pencil SVG Icon */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setUserToEdit(u)}
                          title="Edit user"
                          aria-label={`Edit ${u.name}`}
                          className="h-9 w-9 rounded-lg p-0 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.75}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                            />
                          </svg>
                        </Button>

                        {/* Change Role Button */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setUserToChangeRole(u)}
                          className="h-9 rounded-lg px-2.5 text-xs font-semibold text-[#0044D3] hover:bg-blue-50"
                        >
                          Change Role
                        </Button>

                        {/* Interactive Toggle Switch for Activate / Deactivate */}
                        <div className="pl-1">
                          <ToggleSwitch
                            checked={u.status === 'ACTIVE'}
                            disabled={isDeactivateDisabled || isRowPending}
                            title={deactivateTooltip}
                            ariaLabel={`${u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} account for ${u.name}`}
                            onChange={() => handleRequestToggleStatus(u)}
                          />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* LeadNest-Style Pagination Controls */}
        {!usersError && (
          <PaginationControls
            page={page}
            limit={limit}
            total={totalCount}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            itemLabel="entries"
            pageSizeOptions={[10, 20, 50, 100]}
          />
        )}
      </TableContainer>

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
