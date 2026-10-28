'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { FieldError } from '@/components/ui/FieldError';
import { Form } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useAuth } from '@/hooks/useAuth';
import { redirectUserByRole, useRoleRedirect } from '@/hooks/useRoleRedirect';
import { ApiError } from '@/lib/errors';
import { extractZodErrors, type LoginFormData, loginSchema } from '@/lib/validation';

import { PasswordVisibilityToggle } from './PasswordVisibilityToggle';

export interface LoginFormProps {
  readonly onSubmitSuccess?: (data: LoginFormData) => void;
}

export function LoginForm({ onSubmitSuccess }: Readonly<LoginFormProps>) {
  const router = useRouter();
  const { login, isLoading, isAuthenticated } = useAuth();
  useRoleRedirect({ redirectAuthenticatedToPortal: true, requireAuth: false });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrors({});

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setErrors(extractZodErrors(result.error.issues));
      return;
    }

    setIsSubmitting(true);
    try {
      const loggedInUser = await login(result.data);
      if (onSubmitSuccess) {
        onSubmitSuccess(result.data);
      } else {
        redirectUserByRole(router, loggedInUser, 'push');
      }
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Invalid email or password. Please try again.';
      setErrors({ general: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0044D3] border-t-transparent" />
      </div>
    );
  }

  return (
    <Form
      className="space-y-4"
      onSubmit={(e) => {
        void handleSubmit(e);
      }}
    >
      {errors.general ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {errors.general}
        </div>
      ) : null}

      {/* Email Field with Mail Icon */}
      <div className="space-y-1.5">
        <Label
          htmlFor="email"
          className="flex items-center gap-2 text-xs font-semibold text-slate-700"
        >
          <svg
            className="h-4 w-4 text-[#0044D3]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          Username / Email
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Johnadams@gmail.com"
          autoComplete="email"
          hasError={Boolean(errors.email)}
          disabled={isSubmitting}
          className="rounded-2xl border-slate-200/90 bg-slate-50 text-sm focus:bg-white"
        />
        <FieldError id="email-error" error={errors.email} />
      </div>

      {/* Password Field with Lock Icon */}
      <div className="space-y-1.5">
        <Label
          htmlFor="password"
          className="flex items-center gap-2 text-xs font-semibold text-slate-700"
        >
          <svg
            className="h-4 w-4 text-[#0044D3]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            autoComplete="current-password"
            hasError={Boolean(errors.password)}
            disabled={isSubmitting}
            className="rounded-2xl border-slate-200/90 bg-slate-50 pr-12 text-sm focus:bg-white"
          />
          <PasswordVisibilityToggle
            visible={showPassword}
            onToggle={() => setShowPassword((prev) => !prev)}
            className="text-[#0044D3] hover:bg-blue-50 hover:text-[#0036ab]"
          />
        </div>
        <div className="flex justify-end pt-0.5">
          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-[#0044D3] transition-colors hover:text-[#0036ab] hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
        <FieldError id="password-error" error={errors.password} />
      </div>

      {/* Submit Button: Solid #0044D3 Full Pill */}
      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting}
          isLoading={isSubmitting}
          className="h-12 w-full rounded-full bg-[#0044D3] text-sm font-bold shadow-md shadow-[#0044D3]/20 hover:bg-[#0036ab]"
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </Button>
      </div>
    </Form>
  );
}
