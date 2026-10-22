'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

import { Button, getButtonClassName } from '@/components/ui/Button';
import { FieldError } from '@/components/ui/FieldError';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { H3, P } from '@/components/ui/Typography';
import { useAuth } from '@/hooks/useAuth';
import { usePasswordCriteria } from '@/hooks/usePasswordCriteria';
import { ApiError } from '@/lib/errors';
import { extractZodErrors, resetPasswordSchema } from '@/lib/validation';

import { PasswordCriteriaChecklist } from './PasswordCriteriaChecklist';
import { PasswordVisibilityToggle } from './PasswordVisibilityToggle';

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const criteria = usePasswordCriteria(password);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrors({});

    const result = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      setErrors(extractZodErrors(result.error.issues));
      return;
    }

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
      const message =
        err instanceof ApiError ? err.message : 'Failed to reset password. Please try again.';
      setErrors({ general: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token?.trim()) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-600">
          <svg
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <div>
          <H3 className="mb-1 text-xl font-bold text-slate-900">Invalid or expired link</H3>
          <P className="text-sm leading-relaxed text-slate-600">
            This password reset link is invalid or has expired. Please request a new link to reset
            your password.
          </P>
        </div>

        <div className="space-y-3 pt-2">
          <Link href="/forgot-password" className={getButtonClassName('primary', 'lg', 'w-full')}>
            Request new link
          </Link>

          <Link
            href="/login"
            className="inline-block text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
          >
            ← Return to sign in
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600">
          <svg
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div>
          <H3 className="mb-1 text-xl font-bold text-slate-900">Password updated</H3>
          <P className="text-sm leading-relaxed text-slate-600">
            Your new password has been set. You can now sign in with your updated credentials.
          </P>
        </div>

        <div className="pt-2">
          <Link href="/login" className={getButtonClassName('primary', 'lg', 'w-full')}>
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
        <Label htmlFor="newPassword">New Password</Label>
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
          <PasswordVisibilityToggle
            visible={showPassword}
            onToggle={() => setShowPassword((prev) => !prev)}
          />
        </div>
        <FieldError id="newPassword-error" error={errors.password} />
      </div>

      {/* Real-time Checklist */}
      <PasswordCriteriaChecklist criteria={criteria} />

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••••••"
            autoComplete="new-password"
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
        {isSubmitting ? 'Updating password...' : 'Update password'}
      </Button>

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
