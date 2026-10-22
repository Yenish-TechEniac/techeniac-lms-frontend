'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { FieldError } from '@/components/ui/FieldError';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { redirectUserByRole, useRoleRedirect } from '@/hooks/useRoleRedirect';
import { type LoginFormData, loginSchema } from '@/lib/validation';

export interface LoginFormProps {
  onSubmitSuccess?: (data: LoginFormData) => void;
}

export function LoginForm({ onSubmitSuccess }: LoginFormProps) {
  const router = useRouter();
  const { login } = useAuth();
  useRoleRedirect({ redirectAuthenticatedToPortal: true, requireAuth: false });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
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
      } else {
        redirectUserByRole(router, loggedInUser, 'push');
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
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
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
        <FieldError id="email-error" error={errors.email} />
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
            className="absolute inset-y-0 right-0 my-auto mr-1.5 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:text-slate-600 focus:outline-none focus-visible:text-slate-700 focus-visible:ring-2 focus-visible:ring-blue-500"
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
        <FieldError id="password-error" error={errors.password} />
      </div>

      {/* Action Section */}
      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting}
          isLoading={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </div>

      <div className="mt-8 border-t border-slate-100 pt-4 text-center">
        <p className="text-xs text-slate-500">
          Need access or role change?{' '}
          <span className="font-medium text-slate-700">Contact System Admin</span>
        </p>
      </div>
    </form>
  );
}
