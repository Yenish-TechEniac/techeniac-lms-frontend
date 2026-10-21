'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { useMemo, useState } from 'react';

import { FieldError } from '@/components/ui/FieldError';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { resetPasswordSchema } from '@/lib/validation';

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Real-time criteria verification
  const criteria = useMemo(() => {
    return {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9\s]/.test(password),
    };
  }, [password]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrors({});

    const result = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      const fieldErrors: { password?: string; confirmPassword?: string } = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field === 'password' && !fieldErrors.password) {
          fieldErrors.password = issue.message;
        } else if (field === 'confirmPassword' && !fieldErrors.confirmPassword) {
          fieldErrors.confirmPassword = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    const token = searchParams.get('token');
    if (!token) {
      setErrors({
        general: 'Invalid or missing password reset token. Please request a new link.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(token, password);
      setIsSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reset password';
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
          <h3 className="mb-1 text-xl font-bold text-slate-900">Password updated</h3>
          <p className="text-sm leading-relaxed text-slate-600">
            Your new password has been set. You can now sign in with your updated credentials.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/login"
            className="flex h-12 w-full items-center justify-center rounded-[12px] bg-[#3B82F6] text-base font-semibold text-white transition-colors hover:bg-[#2563EB]"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      className="space-y-5"
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

      {/* New Password */}
      <div className="space-y-1.5">
        <label htmlFor="newPassword" className="block text-sm font-semibold text-slate-900">
          New Password
        </label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            autoComplete="new-password"
            hasError={Boolean(errors.password)}
            disabled={isSubmitting}
            className="pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 my-auto mr-1.5 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:text-slate-600 focus:outline-none focus-visible:text-slate-700 focus-visible:ring-2 focus-visible:ring-blue-500"
            title={showPassword ? 'Hide password' : 'Show password'}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
        </div>
        <FieldError error={errors.password} />
      </div>

      {/* Real-time Checklist */}
      <div className="space-y-2 rounded-[12px] border border-slate-200 bg-slate-50 p-3.5">
        <p className="text-xs font-semibold text-slate-700">Password Requirements</p>
        <div className="grid grid-cols-1 gap-1 text-xs">
          <div
            className={`flex items-center gap-2 ${criteria.length ? 'font-medium text-emerald-600' : 'text-slate-500'}`}
          >
            <span>{criteria.length ? '✓' : '•'}</span>
            <span>At least 8 characters</span>
          </div>
          <div
            className={`flex items-center gap-2 ${criteria.upper ? 'font-medium text-emerald-600' : 'text-slate-500'}`}
          >
            <span>{criteria.upper ? '✓' : '•'}</span>
            <span>At least one uppercase letter (A-Z)</span>
          </div>
          <div
            className={`flex items-center gap-2 ${criteria.lower ? 'font-medium text-emerald-600' : 'text-slate-500'}`}
          >
            <span>{criteria.lower ? '✓' : '•'}</span>
            <span>At least one lowercase letter (a-z)</span>
          </div>
          <div
            className={`flex items-center gap-2 ${criteria.number ? 'font-medium text-emerald-600' : 'text-slate-500'}`}
          >
            <span>{criteria.number ? '✓' : '•'}</span>
            <span>At least one number (0-9)</span>
          </div>
          <div
            className={`flex items-center gap-2 ${criteria.special ? 'font-medium text-emerald-600' : 'text-slate-500'}`}
          >
            <span>{criteria.special ? '✓' : '•'}</span>
            <span>At least one special character</span>
          </div>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-900">
          Confirm Password
        </label>
        <Input
          id="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••••••"
          autoComplete="new-password"
          hasError={Boolean(errors.confirmPassword)}
          disabled={isSubmitting}
        />
        <FieldError error={errors.confirmPassword} />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] bg-[#3B82F6] text-base font-semibold text-white shadow-[0_4px_16px_rgba(59,130,246,0.25)] transition-all duration-150 hover:bg-[#2563EB] active:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Updating password...' : 'Update password'}
      </button>

      <div className="pt-2 text-center">
        <Link
          href="/login"
          className="text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
        >
          Cancel and return to sign in
        </Link>
      </div>
    </form>
  );
}
