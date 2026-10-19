'use client';

import Link from 'next/link';
import React, { useMemo, useState } from 'react';

import { BulkImportModal } from '@/components/app/users/BulkImportModal';
import { ChangeRoleModal } from '@/components/app/users/ChangeRoleModal';
import { CreateUserDrawer } from '@/components/app/users/CreateUserDrawer';
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
  hasLoggedIn: boolean;
  activeMenteesCount?: number;
  isLastSuperAdmin?: boolean;
}

const INITIAL_USERS: UserItem[] = [
  {
    id: 'usr-1',
    name: 'Devon Vance',
    email: 'devon.vance@company.internal',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    hasLoggedIn: true,
    isLastSuperAdmin: true,
  },
  {
    id: 'usr-2',
    name: 'Alex Chen',
    email: 'alex.chen@enterprise.internal',
    role: 'MENTOR',
    status: 'ACTIVE',
    batch: 'FE-25Q1',
    hasLoggedIn: true,
    activeMenteesCount: 4,
  },
  {
    id: 'usr-3',
    name: 'Priya Patel',
    email: 'priya.patel@enterprise.internal',
    role: 'MENTEE',
    status: 'ACTIVE',
    batch: 'FE-25Q1',
    mentorName: 'Alex Chen',
    hasLoggedIn: true,
  },
  {
    id: 'usr-4',
    name: 'Marcus Brody',
    email: 'marcus.brody@enterprise.internal',
    role: 'MENTEE',
    status: 'ACTIVE',
    batch: 'FE-25Q1',
    mentorName: 'Alex Chen',
    hasLoggedIn: false,
  },
  {
    id: 'usr-5',
    name: 'Elena Rostova',
    email: 'elena.rostova@enterprise.internal',
    role: 'MENTOR',
    status: 'INACTIVE',
    hasLoggedIn: true,
    activeMenteesCount: 0,
  },
];

export function UsersTable() {
  const [users, setUsers] = useState<UserItem[]>(INITIAL_USERS);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedBatch, setSelectedBatch] = useState<string>('ALL');

  // Modal controls
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [userToChangeRole, setUserToChangeRole] = useState<UserItem | null>(null);

  // Filtered dataset
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = selectedRole === 'ALL' || u.role === selectedRole;
      const matchesStatus = selectedStatus === 'ALL' || u.status === selectedStatus;
      const matchesBatch = selectedBatch === 'ALL' || u.batch === selectedBatch;

      return matchesSearch && matchesRole && matchesStatus && matchesBatch;
    });
  }, [users, search, selectedRole, selectedStatus, selectedBatch]);

  // Telemetry counts
  const totalCount = users.length;
  const activeCount = users.filter((u) => u.status === 'ACTIVE').length;
  const inactiveCount = users.filter((u) => u.status === 'INACTIVE').length;

  const handleCreateUser = (data: CreateUserFormData) => {
    const newUser: UserItem = {
      id: `usr-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      status: 'ACTIVE',
      hasLoggedIn: false,
    };
    setUsers((prev) => [newUser, ...prev]);
  };

  const handleRoleChangeSuccess = (userId: string, data: ChangeRoleFormData) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: data.newRole } : u)));
  };

  const handleBulkImport = (rows: CsvUserRow[]) => {
    const importedUsers: UserItem[] = rows.map((r, i) => ({
      id: `usr-bulk-${Date.now()}-${i}`,
      name: r.name,
      email: r.email,
      role: r.role,
      status: 'ACTIVE',
      hasLoggedIn: false,
    }));
    setUsers((prev) => [...importedUsers, ...prev]);
  };

  const handleToggleStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus: UserStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
          return { ...u, status: nextStatus };
        }
        return u;
      }),
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
            <span>Administration</span>
            <span>/</span>
            <span className="text-blue-600">User Directory</span>
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
          onClick={() => setSelectedStatus('ALL')}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all ${
            selectedStatus === 'ALL'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Total Users</span>
          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono font-bold text-blue-600">
            {totalCount}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setSelectedStatus('ACTIVE')}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all ${
            selectedStatus === 'ACTIVE'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Active</span>
          <span className="font-mono text-slate-500">{activeCount}</span>
        </button>
        <button
          type="button"
          onClick={() => setSelectedStatus('INACTIVE')}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all ${
            selectedStatus === 'INACTIVE'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-slate-400" />
          <span>Inactive</span>
          <span className="font-mono text-slate-500">{inactiveCount}</span>
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pr-3 pl-9 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Role Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="h-10 w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 transition-all focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="MENTOR">Mentor</option>
              <option value="MENTEE">Mentee</option>
            </select>
          </div>

          {/* Batch Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="h-10 w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 transition-all focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">All Batches</option>
              <option value="FE-25Q1">FE-25Q1</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="text-right md:col-span-2">
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedRole('ALL');
                setSelectedStatus('ALL');
                setSelectedBatch('ALL');
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
                <th className="px-6 py-3.5">User</th>
                <th className="px-4 py-3.5">Email</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Batch</th>
                <th className="px-4 py-3.5">Mentor</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No users match your filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const initials = u.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr key={u.id} className="transition-colors hover:bg-slate-50/60">
                      {/* Name & Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                            {initials}
                          </div>
                          <div>
                            <Link
                              href={`/admin/users/${u.id}/360`}
                              className="font-semibold text-slate-900 transition-colors hover:text-blue-600"
                            >
                              {u.name}
                            </Link>
                            {!u.hasLoggedIn ? (
                              <span className="block text-[10px] font-medium text-amber-600">
                                Invite pending (Not logged in)
                              </span>
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
                            onClick={() => setUserToChangeRole(u)}
                            className="rounded-lg px-2.5 py-1 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50"
                          >
                            Change Role
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(u.id)}
                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                              u.status === 'ACTIVE'
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
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

      <ChangeRoleModal
        user={userToChangeRole}
        isOpen={Boolean(userToChangeRole)}
        onClose={() => setUserToChangeRole(null)}
        onSuccess={handleRoleChangeSuccess}
      />

      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onImportComplete={handleBulkImport}
      />
    </div>
  );
}
