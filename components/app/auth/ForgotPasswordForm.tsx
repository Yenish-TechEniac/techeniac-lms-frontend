'use client';

import Link from 'next/link';
import React, { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { FieldError } from '@/components/ui/FieldError';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { H3, P, Span } from '@/components/ui/Typography';
import { useAuth } from '@/hooks/useAuth';
import { extractZodErrors, forgotPasswordSchema } from '@/lib/validation';

export function ForgotPasswordForm() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDispatched, setIsDispatched] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrors({});
    setResendStatus(null);

    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setErrors(extractZodErrors(result.error.issues));
      return;
    }

    setIsSubmitting(true);
    try {
      await forgotPassword(email);
    } catch {
      // Suppress server errors to prevent user account enumeration
    } finally {
      setIsSubmitting(false);
      setIsDispatched(true);
    }
  };

  const handleResend = async () => {
    if (isResending) return;
    setIsResending(true);
    setResendStatus(null);
    try {
      await forgotPassword(email);
    } catch {
      // Suppress server errors to prevent user account enumeration
    } finally {
      setIsResending(false);
      setResendStatus('A new reset link has been sent if this email is registered.');
    }
  };

  if (isDispatched) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-600">
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
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <div>
          <H3 className="mb-1 text-xl font-bold text-slate-900">Check your email</H3>
          <P className="text-sm leading-relaxed text-slate-600">
            We sent a password reset link to{' '}
            <Span className="font-semibold text-slate-800">{email}</Span>. The link is valid for 30
            minutes.
          </P>
        </div>

        {resendStatus ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-medium text-emerald-800">
            {resendStatus}
          </div>
        ) : null}

        <div className="space-y-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => {
              void handleResend();
            }}
            disabled={isResending}
            isLoading={isResending}
            className="w-full"
          >
            {isResending ? 'Resending link...' : 'Resend link'}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => {
              setIsDispatched(false);
              setResendStatus(null);
            }}
            className="w-full"
          >
            Use a different email
          </Button>

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

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        void handleSubmit(e);
      }}
      noValidate
    >
      <div className="space-y-1.5">
        <Label htmlFor="email">Work Email</Label>
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

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={isSubmitting}
        isLoading={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Sending link...' : 'Send reset link'}
      </Button>

      <div className="pt-4 text-center">
        <Link
          href="/login"
          className="text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
        >
          ← Back to sign in
        </Link>
      </div>
    </form>
  );
}
