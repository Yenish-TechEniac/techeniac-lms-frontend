'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { type LoginFormData, loginSchema } from '@/lib/validation';

export interface LoginFormProps {
  onSubmitSuccess?: (data: LoginFormData) => void;
}

export function LoginForm({ onSubmitSuccess }: LoginFormProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.mustChangePassword) {
        router.replace('/change-password');
      } else if (user.role === 'SUPER_ADMIN') {
        router.replace('/admin');
      } else if (user.role === 'MENTOR') {
        router.replace('/mentor');
      } else {
        router.replace('/mentee');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field === 'email' && !fieldErrors.email) {
          fieldErrors.email = issue.message;
        } else if (field === 'password' && !fieldErrors.password) {
          fieldErrors.password = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const loggedInUser = await login(result.data);
      if (onSubmitSuccess) {
        onSubmitSuccess(result.data);
      } else if (loggedInUser.mustChangePassword) {
        router.push('/change-password');
      } else if (loggedInUser.role === 'SUPER_ADMIN') {
        router.push('/admin');
      } else if (loggedInUser.role === 'MENTOR') {
        router.push('/mentor');
      } else {
        router.push('/mentee');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid email or password';
      setErrors({ general: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="space-y-5"
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

      {/* Email Field */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-semibold text-slate-900">
          Work Email
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          autoComplete="email"
          hasError={Boolean(errors.email)}
          disabled={isSubmitting}
        />
        {errors.email ? (
          <p className="mt-1 text-xs font-medium text-red-500">{errors.email}</p>
        ) : null}
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-semibold text-slate-900">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700"
          >
            Forgot password?
          </Link>
        </div>

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
            className="pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400 transition-colors hover:text-slate-600 focus:outline-none"
            title={showPassword ? 'Hide password' : 'Show password'}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                />
              </svg>
            ) : (
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
            )}
          </button>
        </div>
        {errors.password ? (
          <p className="mt-1 text-xs font-medium text-red-500">{errors.password}</p>
        ) : null}
      </div>

      {/* Action Section */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] bg-[#3B82F6] text-base font-semibold text-white shadow-[0_4px_16px_rgba(59,130,246,0.25)] transition-all duration-150 hover:bg-[#2563EB] active:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign in</span>
          )}
        </button>
      </div>

      <div className="mt-8 border-t border-slate-100 pt-4 text-center">
        <p className="text-xs text-slate-500">
          Need access or role change?{' '}
          <span className="font-semibold text-blue-600">Contact System Admin</span>
        </p>
      </div>
    </form>
  );
}
