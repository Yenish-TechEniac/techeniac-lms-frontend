'use client';

import React, { useId, useState } from 'react';

import { Modal } from '@/components/patterns/Modal';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Form } from '@/components/ui/Form';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { P, Span } from '@/components/ui/Typography';
import { useRoleImpact } from '@/hooks/useRoleImpact';
import { type ChangeRoleFormData, changeRoleSchema, type UserRole } from '@/lib/validation';

import { ReassignWizardModal } from './ReassignWizardModal';

export interface UserToChangeRole {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  currentRole?: UserRole;
}

export interface ChangeRoleModalProps {
  user: UserToChangeRole | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userId: string, data: ChangeRoleFormData) => Promise<void>;
}

const ALL_ROLES: UserRole[] = ['SUPER_ADMIN', 'MENTOR', 'MENTEE'];

function getDefaultTargetRole(currentRole: UserRole): UserRole {
  if (currentRole === 'MENTEE') return 'MENTOR';
  if (currentRole === 'MENTOR') return 'MENTEE';
  return 'MENTOR';
}

function getRoleLabel(role: UserRole): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'Super Admin — Global configuration & policy controller';
    case 'MENTOR':
      return 'Mentor — Instructional oversight & queue evaluations';
    case 'MENTEE':
      return 'Mentee — Standard track learner & batch submissions';
  }
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
  const [newRole, setNewRole] = useState<UserRole>(getDefaultTargetRole(currentRole));
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const confirmCheckboxId = useId();

  const { roleImpact, isLoadingImpact } = useRoleImpact({
    userId: user.id,
    newRole,
    enabled: currentRole !== newRole,
  });

  const availableTargetRoles = ALL_ROLES.filter((r) => r !== currentRole);

  const isBlocked = roleImpact?.isBlocked ?? false;
  const blockReason = roleImpact?.blockReason;
  const hasActiveMentees = isBlocked && blockReason === 'ACTIVE_MENTEES';
  const isLastSuperAdmin = isBlocked && blockReason === 'LAST_SUPER_ADMIN';

  const canSubmit =
    !isLoadingImpact &&
    !isBlocked &&
    confirmed &&
    reason.trim().length >= 10 &&
    reason.trim().length <= 500 &&
    !isSubmitting;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (isLoadingImpact) {
      setError('Please wait while system checks live role impact.');
      return;
    }

    if (isBlocked) {
      setError(roleImpact?.impactSummary ?? 'Role change cannot proceed in this state.');
      return;
    }

    if (!confirmed) {
      setError('Please acknowledge and confirm the role change impact.');
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
    <>
      <Modal
        isOpen={true}
        onClose={onClose}
        title="Change Role"
        description="Reassign operational permissions and instructional scope."
        size="md"
        footer={
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Span className="font-mono">Audited action</Span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                form="change-role-form"
                variant="danger"
                size="sm"
                isLoading={isSubmitting}
                disabled={!canSubmit}
              >
                Change Role &rarr;
              </Button>
            </div>
          </div>
        }
      >
        <Form
          id="change-role-form"
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          className="space-y-4"
        >
          {error ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700"
            >
              <Span className="font-bold">Error:</Span>
              <Span>{error}</Span>
            </div>
          ) : null}

          {/* User Identity Ribbon */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 font-mono text-xs font-bold text-slate-700">
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>
              <div>
                <P className="font-semibold text-slate-900">{user.name}</P>
                <P className="font-mono text-slate-500">{user.email}</P>
              </div>
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
          <div className="space-y-1">
            <Label htmlFor="target-role" required>
              New Assigned Role
            </Label>
            <Select
              id="target-role"
              value={newRole}
              onChange={(e) => {
                setNewRole(e.target.value as UserRole);
                setConfirmed(false);
              }}
            >
              {availableTargetRoles.map((role) => (
                <option key={role} value={role}>
                  {getRoleLabel(role)}
                </option>
              ))}
            </Select>
          </div>

          {/* Blocked Alert: Active Mentees requiring Wizard */}
          {hasActiveMentees && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-950">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <Span>⚠️</Span>
                  <Span>Active Mentees Require Reassignment</Span>
                </div>
                <Span className="rounded-full bg-amber-200 px-2 py-0.5 font-mono text-[11px] font-bold text-amber-900">
                  {roleImpact?.activeMenteesCount} Mentees
                </Span>
              </div>
              <P className="mt-1.5 text-slate-700">
                This mentor is actively assigned to{' '}
                <Span className="font-bold">{roleImpact?.activeMenteesCount} mentee(s)</Span>. In
                accordance with the LMS PRD Section 4 policy, active mentees must be reassigned to
                other mentors before this role change can be completed.
              </P>
              <div className="mt-3 flex justify-end">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setIsWizardOpen(true)}
                >
                  Open Reassignment Wizard &rarr;
                </Button>
              </div>
            </div>
          )}

          {/* Blocked Alert: Last Super Admin */}
          {isLastSuperAdmin && (
            <div className="rounded-xl border border-red-300 bg-red-50 p-3.5 text-xs text-red-900">
              <div className="flex items-center gap-2 font-bold text-red-800">
                <Span>🛑</Span>
                <Span>Role Demotion Prohibited</Span>
              </div>
              <P className="mt-1.5 text-slate-700">
                This user is the <Span className="font-bold">last active Super Admin</Span> in the
                system. The last active Super Admin cannot be demoted or converted to another role.
              </P>
            </div>
          )}

          {/* "What will happen" Section */}
          {!isBlocked && (
            <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs">
              <div className="flex items-center justify-between">
                <Span className="font-semibold text-slate-800">What will happen:</Span>
                {isLoadingImpact ? (
                  <Span className="animate-pulse text-[11px] text-slate-400">
                    Assessing live impact...
                  </Span>
                ) : null}
              </div>
              <ul className="space-y-1.5 text-slate-600">
                {roleImpact?.impactPoints && roleImpact.impactPoints.length > 0 ? (
                  roleImpact.impactPoints.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <Span className="mt-0.5 text-blue-600">&bull;</Span>
                      <Span>{point}</Span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-start gap-2">
                      <Span className="mt-0.5 text-blue-600">&bull;</Span>
                      <Span>Operational permissions will update immediately upon commit</Span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Span className="mt-0.5 text-blue-600">&bull;</Span>
                      <Span>Active user sessions will be revoked (tokenVersion incremented)</Span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          )}

          {/* Mandatory Reason Field (FR-2.3) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="role-reason" required>
                Reason for Role Change
              </Label>
              <Span
                className={`font-mono text-[11px] ${
                  reason.length < 10 ? 'font-semibold text-amber-800' : 'text-slate-400'
                }`}
              >
                {reason.length} / 500 (min 10)
              </Span>
            </div>
            <Textarea
              id="role-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a mandatory justification for auditing purposes (min 10 characters)..."
            />
          </div>

          {/* Confirmation Checkbox */}
          {!isBlocked && (
            <Label
              htmlFor={confirmCheckboxId}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-2.5 hover:bg-slate-50"
            >
              <Checkbox
                id={confirmCheckboxId}
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              <Span className="text-xs font-medium text-slate-700">
                I understand and confirm this role change and its operational impacts
              </Span>
            </Label>
          )}
        </Form>
      </Modal>

      {/* Reassignment Wizard Modal when active mentees exist */}
      {hasActiveMentees && isWizardOpen && (
        <ReassignWizardModal
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          sourceMentor={{
            id: user.id,
            name: user.name,
            email: user.email,
          }}
          activeMentees={roleImpact?.activeMentees ?? []}
          onComplete={() => {
            setIsWizardOpen(false);
          }}
        />
      )}
    </>
  );
}

export function ChangeRoleModal({ user, isOpen, onClose, onSuccess }: ChangeRoleModalProps) {
  if (!isOpen || !user) return null;
  return (
    <ChangeRoleModalContent key={user.id} user={user} onClose={onClose} onSuccess={onSuccess} />
  );
}
