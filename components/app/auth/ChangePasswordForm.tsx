'use client';

import Link from 'next/link';
import React, { useState } from 'react';

import { Button, getButtonClassName } from '@/components/ui/Button';
import { FieldError } from '@/components/ui/FieldError';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { PASSWORD_RULES, usePasswordCriteria } from '@/hooks/usePasswordCriteria';
import { ApiError } from '@/lib/errors';
import { changePasswordSchema } from '@/lib/validation';

import { PasswordVisibilityToggle } from './PasswordVisibilityToggle';

export function ChangePasswordForm() {
  const { changePassword, refreshUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const criteria = usePasswordCriteria(newPassword);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrors({});

    const result = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!result.success) {
      const fieldErrors: {
        currentPassword?: string;
        newPassword?: string;
        confirmPassword?: string;
      } = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field === 'currentPassword' && !fieldErrors.currentPassword) {
          fieldErrors.currentPassword = issue.message;
        } else if (field === 'newPassword' && !fieldErrors.newPassword) {
          fieldErrors.newPassword = issue.message;
        } else if (field === 'confirmPassword' && !fieldErrors.confirmPassword) {
          fieldErrors.confirmPassword = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      await refreshUser();
      setIsSuccess(true);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to update password. Please try again.';
      setErrors({ general: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div>
          <h3 className="mb-1 text-xl font-bold text-slate-900">Password updated successfully</h3>
          <p className="text-sm leading-relaxed text-slate-600">
            Your initial temporary password has been replaced. You can now access your dashboard.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/" className={getButtonClassName('primary', 'lg', 'w-full')}>
            Continue to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        void handleSubmit(e);
      }}
      noValidate
    >
      {errors.general ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errors.general}
        </div>
      ) : null}

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
        <strong>First-time sign in:</strong> Please create a permanent password to secure your
        account.
      </div>

      {/* Current Password */}
      <div className="space-y-1">
        <label htmlFor="currentPassword" className="block text-sm font-semibold text-slate-900">
          Temporary Password
        </label>
        <div className="relative">
          <Input
            id="currentPassword"
            type={showCurrentPassword ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••••••"
            hasError={Boolean(errors.currentPassword)}
            disabled={isSubmitting}
            className="pr-12"
          />
          <PasswordVisibilityToggle
            visible={showCurrentPassword}
            onToggle={() => setShowCurrentPassword((prev) => !prev)}
          />
        </div>
        <FieldError id="currentPassword-error" error={errors.currentPassword} />
      </div>

      {/* New Password */}
      <div className="space-y-1">
        <label htmlFor="newPassword" className="block text-sm font-semibold text-slate-900">
          New Permanent Password
        </label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••••••"
            hasError={Boolean(errors.newPassword)}
            disabled={isSubmitting}
            className="pr-12"
          />
          <PasswordVisibilityToggle
            visible={showNewPassword}
            onToggle={() => setShowNewPassword((prev) => !prev)}
          />
        </div>
        <FieldError id="newPassword-error" error={errors.newPassword} />
      </div>

      {/* Criteria Checklist */}
      <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
        <p className="font-semibold text-slate-700">Password Requirements</p>
        <div className="grid grid-cols-1 gap-0.5 text-slate-600">
          <div className={criteria.length ? 'font-medium text-emerald-600' : ''}>
            {criteria.length ? '✓' : '•'} At least {PASSWORD_RULES.minLength} characters
          </div>
          <div className={criteria.upper ? 'font-medium text-emerald-600' : ''}>
            {criteria.upper ? '✓' : '•'} At least one uppercase letter (A-Z)
          </div>
          <div className={criteria.lower ? 'font-medium text-emerald-600' : ''}>
            {criteria.lower ? '✓' : '•'} At least one lowercase letter (a-z)
          </div>
          <div className={criteria.number ? 'font-medium text-emerald-600' : ''}>
            {criteria.number ? '✓' : '•'} At least one number (0-9)
          </div>
          <div className={criteria.special ? 'font-medium text-emerald-600' : ''}>
            {criteria.special ? '✓' : '•'} At least one special character
          </div>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="space-y-1">
        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-900">
          Confirm New Password
        </label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••••••"
            hasError={Boolean(errors.confirmPassword)}
            disabled={isSubmitting}
            className="pr-12"
          />
          <PasswordVisibilityToggle
            visible={showConfirmPassword}
            onToggle={() => setShowConfirmPassword((prev) => !prev)}
          />
        </div>
        <FieldError id="confirmPassword-error" error={errors.confirmPassword} />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={isSubmitting}
        isLoading={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Updating...' : 'Set new password & continue'}
      </Button>
    </form>
  );
}
