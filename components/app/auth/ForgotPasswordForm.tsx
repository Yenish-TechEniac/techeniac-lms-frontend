'use client';

import Link from 'next/link';
import React, { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { FieldError } from '@/components/ui/FieldError';
import { Form } from '@/components/ui/Form';
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
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-[#0044D3]">
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
            <Span className="font-semibold text-slate-800">{email}</Span>.
          </P>
        </div>

        {resendStatus ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-medium text-emerald-800">
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
            className="h-11 w-full rounded-full text-xs font-bold"
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
            className="h-11 w-full rounded-full text-xs font-semibold"
          >
            Use a different email
          </Button>

          <Link
            href="/login"
            className="inline-block text-xs font-semibold text-[#0044D3] transition-colors hover:text-[#0036ab] hover:underline"
          >
            ← Return to sign in
          </Link>
        </div>
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

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting}
          isLoading={isSubmitting}
          className="h-12 w-full rounded-full bg-[#0044D3] text-sm font-bold shadow-md shadow-[#0044D3]/20 hover:bg-[#0036ab]"
        >
          {isSubmitting ? 'Sending link...' : 'Send Reset Link'}
        </Button>
      </div>

      <div className="pt-3 text-center">
        <Link
          href="/login"
          className="text-xs font-semibold text-[#0044D3] transition-colors hover:text-[#0036ab] hover:underline"
        >
          Remember your password? Sign In
        </Link>
      </div>
    </Form>
  );
}
