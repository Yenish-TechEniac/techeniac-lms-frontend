'use client';

import React, { useState } from 'react';

import { PasswordCriteriaChecklist } from '@/components/app/auth/PasswordCriteriaChecklist';
import { PasswordVisibilityToggle } from '@/components/app/auth/PasswordVisibilityToggle';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { FieldError } from '@/components/ui/FieldError';
import { Form } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { H1, H2, H3, P, Span } from '@/components/ui/Typography';
import { useAuth } from '@/hooks/useAuth';
import { usePasswordCriteria } from '@/hooks/usePasswordCriteria';
import { formatDateIST } from '@/lib/date';
import { ApiError } from '@/lib/errors';
import { formatRoleLabel } from '@/lib/roles';
import { changePasswordSchema, extractZodErrors } from '@/lib/validation';
import type { AuthUser } from '@/services/auth.service';

function getUserInitials(name?: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    const first = parts[0]?.charAt(0) ?? '';
    const last = parts[parts.length - 1]?.charAt(0) ?? '';
    return `${first}${last}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getRoleBadgeColor(role?: string): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'MENTOR':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'MENTEE':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

export interface ProfileViewProps {
  readonly user: AuthUser;
}

export function ProfileView({ user }: Readonly<ProfileViewProps>) {
  const { changePassword, refreshUser } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const criteria = usePasswordCriteria(newPassword);
  const userInitials = getUserInitials(user.name);
  const roleBadgeStyle = getRoleBadgeColor(user.role);

  const handlePasswordSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrors({});
    setSuccessMessage(null);

    const result = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!result.success) {
      setErrors(extractZodErrors(result.error.issues));
      return;
    }

    setIsSubmitting(true);
    try {
      const msg = await changePassword(currentPassword, newPassword);
      await refreshUser();
      setSuccessMessage(msg || 'Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Failed to update password. Please verify current password and try again.';
      setErrors({ general: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Breadcrumb Header */}
      <div className="rounded-2xl border border-[#E1E6EC] bg-white p-6 shadow-xs sm:p-8">
        <H1 className="text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">
          Account Profile
        </H1>
        <P className="mt-1 text-sm text-[#667085] sm:text-base">
          View your authenticated account credentials and manage your portal access security.
        </P>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Card: User Details & Identity */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-2xl border border-[#E1E6EC] bg-white p-6 shadow-xs sm:p-8">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#0044D3] text-2xl font-black text-white shadow-md shadow-[#0044D3]/20">
                {userInitials}
              </div>
              <H2 className="mt-4 text-xl font-bold text-[#111827]">{user.name}</H2>
              <P className="text-sm text-[#667085]">{user.email}</P>
              <div className="mt-3 flex items-center gap-2">
                <Span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${roleBadgeStyle}`}
                >
                  {formatRoleLabel(user.role)}
                </Span>
                <Span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <Span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Active
                </Span>
              </div>
            </div>

            <div className="mt-8 border-t border-[#E1E6EC] pt-6">
              <H3 className="text-sm font-bold tracking-wide text-[#111827] uppercase">
                Account Information
              </H3>
              <dl className="mt-4 space-y-4 text-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <dt className="text-[#667085]">Full Name</dt>
                  <dd className="font-semibold text-[#111827]">{user.name}</dd>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <dt className="text-[#667085]">Email Address</dt>
                  <dd className="font-semibold text-[#111827]">{user.email}</dd>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <dt className="text-[#667085]">Role</dt>
                  <dd className="font-semibold text-[#111827]">{formatRoleLabel(user.role)}</dd>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <dt className="text-[#667085]">Member Since</dt>
                  <dd className="font-semibold text-[#111827]">
                    {user.createdAt ? formatDateIST(user.createdAt) : 'Platform Active'}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-[#667085]">Account Status</dt>
                  <dd className="font-semibold text-emerald-600">Active & Verified</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Right Card: Change Password Form */}
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-2xl border border-[#E1E6EC] bg-white p-6 shadow-xs sm:p-8">
            <div>
              <H2 className="text-lg font-bold text-[#111827] sm:text-xl">Change Password</H2>
              <P className="mt-1 text-sm text-[#667085]">
                Ensure your account is using a long, random password to stay secure.
              </P>
            </div>

            {successMessage ? (
              <div className="mt-6">
                <Alert variant="success" title="Password Updated" message={successMessage} />
              </div>
            ) : null}

            {errors.general ? (
              <div className="mt-6">
                <Alert variant="error" title="Update Failed" message={errors.general} />
              </div>
            ) : null}

            <Form
              onSubmit={(e) => {
                void handlePasswordSubmit(e);
              }}
              className="mt-6 space-y-5"
            >
              {/* Current Password Field */}
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword" required>
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      if (errors.currentPassword) {
                        setErrors((prev) => ({ ...prev, currentPassword: '' }));
                      }
                    }}
                    placeholder="Enter current password"
                    hasError={Boolean(errors.currentPassword)}
                    errorId="currentPassword-error"
                    disabled={isSubmitting}
                    autoComplete="current-password"
                  />
                  <PasswordVisibilityToggle
                    isVisible={showCurrentPassword}
                    onToggle={() => setShowCurrentPassword((prev) => !prev)}
                  />
                </div>
                {errors.currentPassword ? (
                  <FieldError id="currentPassword-error" error={errors.currentPassword} />
                ) : null}
              </div>

              {/* New Password Field */}
              <div className="space-y-1.5">
                <Label htmlFor="newPassword" required>
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errors.newPassword) {
                        setErrors((prev) => ({ ...prev, newPassword: '' }));
                      }
                    }}
                    placeholder="Enter new strong password"
                    hasError={Boolean(errors.newPassword)}
                    errorId="newPassword-error"
                    disabled={isSubmitting}
                    autoComplete="new-password"
                  />
                  <PasswordVisibilityToggle
                    isVisible={showNewPassword}
                    onToggle={() => setShowNewPassword((prev) => !prev)}
                  />
                </div>
                {errors.newPassword ? (
                  <FieldError id="newPassword-error" error={errors.newPassword} />
                ) : null}
              </div>

              {/* Password Requirements Checklist */}
              {newPassword.length > 0 ? <PasswordCriteriaChecklist criteria={criteria} /> : null}

              {/* Confirm Password Field */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" required>
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) {
                        setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                      }
                    }}
                    placeholder="Re-enter new password"
                    hasError={Boolean(errors.confirmPassword)}
                    errorId="confirmPassword-error"
                    disabled={isSubmitting}
                    autoComplete="new-password"
                  />
                  <PasswordVisibilityToggle
                    isVisible={showConfirmPassword}
                    onToggle={() => setShowConfirmPassword((prev) => !prev)}
                  />
                </div>
                {errors.confirmPassword ? (
                  <FieldError id="confirmPassword-error" error={errors.confirmPassword} />
                ) : null}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  className="rounded-full bg-[#0044D3] px-6 text-sm font-semibold shadow-sm hover:bg-[#0036ab]"
                >
                  {isSubmitting ? 'Updating Password...' : 'Update Password'}
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
