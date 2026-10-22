'use client';

import React, { useMemo, useState } from 'react';

import { Modal } from '@/components/patterns/Modal';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Code, P, Span } from '@/components/ui/Typography';
import { useRoleImpact } from '@/hooks/useRoleImpact';
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
  const currentRole: UserRole = user.currentRole ?? user.role;
  const isRestrictedRole = currentRole === 'MENTOR' || currentRole === 'SUPER_ADMIN';
  const [newRole, setNewRole] = useState<UserRole>(getDefaultTargetRole(currentRole));
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEnabledImpact = !isRestrictedRole && currentRole !== newRole;
  const { roleImpact, isLoadingImpact } = useRoleImpact({
    userId: user.id,
    newRole,
    enabled: isEnabledImpact,
  });

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
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Change User Role"
      description={
        <>
          Modify operational role and permissions for{' '}
          <Span className="font-semibold text-slate-800">{user.name}</Span>
        </>
      }
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="change-role-form"
            variant="danger"
            size="sm"
            isLoading={isSubmitting}
            disabled={
              Boolean(isBlocked) || isRestrictedRole || isSubmitting || reason.trim().length < 10
            }
          >
            {isRestrictedRole ? 'Role Change Restricted' : 'Confirm Role Change'}
          </Button>
        </>
      }
    >
      <form
        id="change-role-form"
        onSubmit={(e) => {
          void handleSubmit(e);
        }}
        className="space-y-5"
        noValidate
      >
        {error ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700"
          >
            <Span className="font-bold">Error:</Span>
            <Span>{error}</Span>
          </div>
        ) : null}

        {/* User Details Overview */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs">
          <div>
            <P className="font-semibold text-slate-900">{user.name}</P>
            <P className="font-mono text-slate-500">{user.email}</P>
          </div>
          <div className="text-right">
            <Span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Current Role
            </Span>
            <Span className="mt-0.5 inline-block rounded-full bg-slate-200 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-800">
              {currentRole}
            </Span>
          </div>
        </div>

        {/* Target Role Selector */}
        <div className="space-y-1.5">
          <Label htmlFor="target-role">New Assigned Role</Label>
          <select
            id="target-role"
            value={newRole}
            disabled={isRestrictedRole}
            onChange={(e) => setNewRole(e.target.value as UserRole)}
            className={`h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none ${
              isRestrictedRole ? 'cursor-not-allowed bg-slate-100 text-slate-500' : 'cursor-pointer'
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
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs leading-relaxed text-amber-950 shadow-xs">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <Span className="text-base">⚠️</Span>
              <Span>Role Transition Restricted (LMS PRD Policy)</Span>
            </div>
            <P className="mt-1.5 text-slate-700">
              Mentor accounts <strong>cannot be converted to Mentee or Super Admin</strong> roles.
              Mentorship assignments, student evaluations, and authored curriculum remain
              permanently bound to this mentor profile.
            </P>
          </div>
        )}

        {currentRole === 'SUPER_ADMIN' && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs leading-relaxed text-amber-950 shadow-xs">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <Span className="text-base">⚠️</Span>
              <Span>Role Transition Restricted (LMS PRD Policy)</Span>
            </div>
            <P className="mt-1.5 text-slate-700">
              Super Admin accounts <strong>cannot be changed into Mentor or Mentee</strong> roles.
              System governance and security administrator identities cannot be converted.
            </P>
          </div>
        )}

        {currentRole === 'MENTEE' && (
          <div
            aria-live="polite"
            className="space-y-2 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs leading-relaxed text-amber-900"
          >
            <div className="flex items-center justify-between">
              <P className="flex items-center gap-1.5 font-bold text-amber-800">
                <Span>⚠️</Span> Role Change Impact Preview:
              </P>
              {isLoadingImpact ? (
                <Span className="animate-pulse text-[10px] font-semibold text-amber-700">
                  Assessing live impact...
                </Span>
              ) : null}
            </div>

            {roleImpact?.impactSummary ? (
              <div className="rounded-lg bg-amber-100/70 p-2.5 text-slate-800">
                <P className="font-semibold text-amber-950">System Assessment:</P>
                <P className="mt-0.5 text-slate-700">{roleImpact.impactSummary}</P>
                {roleImpact.willRevokeSessions ? (
                  <P className="mt-1 font-medium text-amber-900">
                    ⚡ Immediate session invalidation: active access tokens and refresh tokens will
                    be revoked upon commit.
                  </P>
                ) : null}
              </div>
            ) : null}

            <ul className="list-disc space-y-1 pl-4 text-slate-700">
              {newRole === 'MENTOR' && (
                <>
                  <li>
                    Active batch mentee membership ends with status reason{' '}
                    <Code className="rounded bg-amber-100 px-1">ROLE_CHANGE</Code>.
                  </li>
                  <li>
                    Open course allocations transition to{' '}
                    <Code className="rounded bg-amber-100 px-1">CLOSED_ROLE_CHANGE</Code>{' '}
                    (read-only).
                  </li>
                  <li>
                    Past progress and submissions are preserved permanently in learning history.
                  </li>
                  <li>
                    User sessions will be immediately invalidated (
                    <Code className="rounded bg-amber-100 px-1">tokenVersion</Code> incremented).
                  </li>
                </>
              )}
              {newRole === 'SUPER_ADMIN' && (
                <>
                  <li>
                    Active batch mentee membership ends with status reason{' '}
                    <Code className="rounded bg-amber-100 px-1">ROLE_CHANGE</Code>.
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
            <Label htmlFor="role-reason" required>
              Audit Reason
            </Label>
            <Span
              className={`font-mono text-[11px] ${
                reason.length < 10 && !isRestrictedRole
                  ? 'font-semibold text-amber-800'
                  : 'text-slate-400'
              }`}
            >
              {reason.length} / 500 (min 10)
            </Span>
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
            className={`w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none ${
              isRestrictedRole ? 'cursor-not-allowed bg-slate-100 text-slate-400' : ''
            }`}
          />
        </div>
      </form>
    </Modal>
  );
}

export function ChangeRoleModal({ user, isOpen, onClose, onSuccess }: ChangeRoleModalProps) {
  if (!isOpen || !user) return null;
  return (
    <ChangeRoleModalContent key={user.id} user={user} onClose={onClose} onSuccess={onSuccess} />
  );
}
