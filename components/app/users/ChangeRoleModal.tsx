'use client';

import React, { useMemo, useRef, useState } from 'react';

import { useDialogAccessibility } from '@/hooks/useDialogAccessibility';
import { type ChangeRoleFormData, changeRoleSchema, type UserRole } from '@/lib/validation';

export interface UserToChangeRole {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  currentRole?: UserRole;
  activeMenteesCount?: number;
  isLastSuperAdmin?: boolean;
}

export interface ChangeRoleModalProps {
  user: UserToChangeRole | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userId: string, data: ChangeRoleFormData) => Promise<void>;
}

function getDefaultTargetRole(role: UserRole): UserRole {
  if (role === 'MENTEE') return 'MENTOR';
  if (role === 'MENTOR') return 'MENTOR';
  return 'SUPER_ADMIN';
}

function ChangeRoleModalContent({
  user,
  onClose,
  onSuccess,
}: {
  user: UserToChangeRole;
  onClose: () => void;
  onSuccess: (userId: string, data: ChangeRoleFormData) => Promise<void>;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogAccessibility({
    isOpen: true,
    onClose,
    dialogRef,
  });

  const currentRole: UserRole = user.currentRole ?? user.role;
  const isRestrictedRole = currentRole === 'MENTOR' || currentRole === 'SUPER_ADMIN';
  const [newRole, setNewRole] = useState<UserRole>(getDefaultTargetRole(currentRole));
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isBlocked = useMemo(() => {
    if (currentRole === 'MENTOR') {
      return 'Mentor role cannot be changed to Mentee or Super Admin as per LMS PRD policy.';
    }
    if (currentRole === 'SUPER_ADMIN') {
      return 'Super Admin role cannot be changed into Mentor or Mentee as per LMS PRD policy.';
    }
    if (currentRole === newRole) {
      return 'The user already holds this role.';
    }
    return false;
  }, [currentRole, newRole]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (isBlocked || isRestrictedRole) {
      setError(
        typeof isBlocked === 'string' ? isBlocked : 'Role change is restricted for this user.',
      );
      return;
    }

    const result = changeRoleSchema.safeParse({ newRole, reason });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Invalid role change parameters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSuccess(user.id, result.data);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update user role');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm duration-150">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-role-modal-title"
        className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <h3 id="change-role-modal-title" className="text-lg font-bold text-slate-900">
              Change User Role
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Modify operational role and permissions for{' '}
              <span className="font-semibold text-slate-800">{user.name}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <form
          id="change-role-form"
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          className="space-y-5 p-6"
          noValidate
        >
          {error ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-[12px] border border-red-200 bg-red-50 p-3.5 text-xs text-red-700"
            >
              <span className="font-bold">Error:</span>
              <span>{error}</span>
            </div>
          ) : null}

          {/* User Details Overview */}
          <div className="flex items-center justify-between rounded-[12px] border border-slate-200 bg-slate-50 p-3.5 text-xs">
            <div>
              <p className="font-semibold text-slate-900">{user.name}</p>
              <p className="font-mono text-slate-500">{user.email}</p>
            </div>
            <div className="text-right">
              <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Current Role
              </span>
              <span className="mt-0.5 inline-block rounded-full bg-slate-200 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-800">
                {currentRole}
              </span>
            </div>
          </div>

          {/* Target Role Selector */}
          <div className="space-y-1.5">
            <label htmlFor="target-role" className="block text-sm font-semibold text-slate-900">
              New Assigned Role
            </label>
            <select
              id="target-role"
              value={newRole}
              disabled={isRestrictedRole}
              onChange={(e) => setNewRole(e.target.value as UserRole)}
              className={`h-11 w-full rounded-[12px] border border-slate-200 bg-white px-4 text-sm text-slate-900 transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none ${
                isRestrictedRole
                  ? 'cursor-not-allowed bg-slate-100 text-slate-500'
                  : 'cursor-pointer'
              }`}
            >
              {currentRole === 'MENTEE' ? (
                <>
                  <option value="MENTOR">Mentor (Instructor / Reviewer)</option>
                  <option value="SUPER_ADMIN">Super Admin (System Administrator)</option>
                </>
              ) : currentRole === 'MENTOR' ? (
                <option value="MENTOR">Mentor (Role Conversion Restricted)</option>
              ) : (
                <option value="SUPER_ADMIN">Super Admin (Role Conversion Restricted)</option>
              )}
            </select>
          </div>

          {/* Policy Disclaimers & PRD Section 4 Role Change Impact Matrix Preview */}
          {currentRole === 'MENTOR' && (
            <div className="rounded-[12px] border border-amber-300 bg-amber-50 p-4 text-xs leading-relaxed text-amber-950 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <span className="text-base">⚠️</span>
                <span>Role Transition Restricted (LMS PRD Policy)</span>
              </div>
              <p className="mt-1.5 text-slate-700">
                Mentor accounts <strong>cannot be converted to Mentee or Super Admin</strong> roles.
                Mentorship assignments, student evaluations, and authored curriculum remain
                permanently bound to this mentor profile.
              </p>
            </div>
          )}

          {currentRole === 'SUPER_ADMIN' && (
            <div className="rounded-[12px] border border-amber-300 bg-amber-50 p-4 text-xs leading-relaxed text-amber-950 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <span className="text-base">⚠️</span>
                <span>Role Transition Restricted (LMS PRD Policy)</span>
              </div>
              <p className="mt-1.5 text-slate-700">
                Super Admin accounts <strong>cannot be changed into Mentor or Mentee</strong> roles.
                System governance and security administrator identities cannot be converted.
              </p>
            </div>
          )}

          {currentRole === 'MENTEE' && (
            <div
              aria-live="polite"
              className="space-y-1.5 rounded-[12px] border border-amber-200 bg-amber-50/70 p-3.5 text-xs leading-relaxed text-amber-900"
            >
              <p className="flex items-center gap-1.5 font-bold text-amber-800">
                <span>⚠️</span> Role Change Impact Preview:
              </p>
              <ul className="list-disc space-y-1 pl-4 text-slate-700">
                {newRole === 'MENTOR' && (
                  <>
                    <li>
                      Active batch mentee membership ends with status reason{' '}
                      <code className="rounded bg-amber-100 px-1">ROLE_CHANGE</code>.
                    </li>
                    <li>
                      Open course allocations transition to{' '}
                      <code className="rounded bg-amber-100 px-1">CLOSED_ROLE_CHANGE</code>{' '}
                      (read-only).
                    </li>
                    <li>
                      Past progress and submissions are preserved permanently in learning history.
                    </li>
                    <li>
                      User sessions will be immediately invalidated (
                      <code className="rounded bg-amber-100 px-1">tokenVersion</code> incremented).
                    </li>
                  </>
                )}
                {newRole === 'SUPER_ADMIN' && (
                  <>
                    <li>
                      Active batch mentee membership ends with status reason{' '}
                      <code className="rounded bg-amber-100 px-1">ROLE_CHANGE</code>.
                    </li>
                    <li>
                      Grants full system administration, user management, and cross-batch oversight
                      privileges.
                    </li>
                    <li>
                      Past progress and submissions are preserved permanently in learning history.
                    </li>
                  </>
                )}
              </ul>
            </div>
          )}

          {/* Mandatory Reason Field (FR-2.3) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="role-reason" className="block text-sm font-semibold text-slate-900">
                Audit Reason <span className="text-red-500">*</span>
              </label>
              <span
                className={`font-mono text-[11px] ${
                  reason.length < 10 && !isRestrictedRole ? 'text-amber-600' : 'text-slate-400'
                }`}
              >
                {reason.length} / 500 (min 10)
              </span>
            </div>
            <textarea
              id="role-reason"
              rows={3}
              value={reason}
              disabled={isRestrictedRole}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                isRestrictedRole
                  ? 'Role transitions for this user are restricted by system policy.'
                  : 'Provide a mandatory justification for auditing purposes (e.g. Completed mentee cohort, promoted to mentor)...'
              }
              className={`w-full rounded-[12px] border border-slate-200 bg-white p-3 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none ${
                isRestrictedRole ? 'cursor-not-allowed bg-slate-100 text-slate-400' : ''
              }`}
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 p-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-[10px] border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="change-role-form"
            disabled={
              Boolean(isBlocked) || isRestrictedRole || isSubmitting || reason.trim().length < 10
            }
            className="rounded-[10px] bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 active:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? 'Updating Role...'
              : isRestrictedRole
                ? 'Role Change Restricted'
                : 'Confirm Role Change'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ChangeRoleModal({ user, isOpen, onClose, onSuccess }: ChangeRoleModalProps) {
  if (!isOpen || !user) return null;
  return (
    <ChangeRoleModalContent key={user.id} user={user} onClose={onClose} onSuccess={onSuccess} />
  );
}
