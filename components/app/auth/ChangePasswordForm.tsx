'use client';

import Link from 'next/link';
import React, { useMemo, useState } from 'react';

import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { changePasswordSchema } from '@/lib/validation';

export function ChangePasswordForm() {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const criteria = useMemo(() => {
    return {
      length: newPassword.length >= 8,
      upper: /[A-Z]/.test(newPassword),
      lower: /[a-z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      special: /[^A-Za-z0-9\s]/.test(newPassword),
    };
  }, [newPassword]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
      setIsSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update password';
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
          <Link
            href="/"
            className="flex h-12 w-full items-center justify-center rounded-[12px] bg-[#3B82F6] text-base font-semibold text-white transition-colors hover:bg-[#2563EB]"
          >
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
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {errors.general}
        </div>
      ) : null}

      <div className="rounded-[12px] border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
        <strong>First-time sign in:</strong> Please create a permanent password to secure your
        account.
      </div>

      {/* Current Password */}
      <div className="space-y-1">
        <label htmlFor="currentPassword" className="block text-sm font-semibold text-slate-900">
          Temporary Password
        </label>
        <Input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="••••••••••••"
          hasError={Boolean(errors.currentPassword)}
          disabled={isSubmitting}
        />
        {errors.currentPassword ? (
          <p className="mt-0.5 text-xs font-medium text-red-500">{errors.currentPassword}</p>
        ) : null}
      </div>

      {/* New Password */}
      <div className="space-y-1">
        <label htmlFor="newPassword" className="block text-sm font-semibold text-slate-900">
          New Permanent Password
        </label>
        <Input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="••••••••••••"
          hasError={Boolean(errors.newPassword)}
          disabled={isSubmitting}
        />
        {errors.newPassword ? (
          <p className="mt-0.5 text-xs font-medium text-red-500">{errors.newPassword}</p>
        ) : null}
      </div>

      {/* Criteria Checklist */}
      <div className="space-y-1 rounded-[12px] border border-slate-200 bg-slate-50 p-3 text-xs">
        <p className="font-semibold text-slate-700">Password Requirements</p>
        <div className="grid grid-cols-1 gap-0.5 text-slate-600">
          <div className={criteria.length ? 'font-medium text-emerald-600' : ''}>
            {criteria.length ? '✓' : '•'} At least 8 characters
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
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••••••"
          hasError={Boolean(errors.confirmPassword)}
          disabled={isSubmitting}
        />
        {errors.confirmPassword ? (
          <p className="mt-0.5 text-xs font-medium text-red-500">{errors.confirmPassword}</p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] bg-[#3B82F6] text-base font-semibold text-white shadow-[0_4px_16px_rgba(59,130,246,0.25)] transition-all duration-150 hover:bg-[#2563EB] active:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Updating...' : 'Set new password & continue'}
      </button>
    </form>
  );
}
