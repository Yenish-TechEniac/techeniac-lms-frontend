'use client';

import Link from 'next/link';
import React, { useState } from 'react';

import { Input } from '@/components/ui/Input';
import { env } from '@/lib/config';
import { forgotPasswordSchema } from '@/lib/validation';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDispatched, setIsDispatched] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Invalid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as {
          error?: { message?: string };
          message?: string;
        } | null;
        setError(json?.error?.message || json?.message || 'Failed to dispatch reset email.');
        return;
      }

      setIsDispatched(true);
    } catch {
      setError('Unable to connect to authentication server. Please check your network.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDispatched) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-600">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <div>
          <h3 className="mb-1 text-xl font-bold text-slate-900">Check your email</h3>
          <p className="text-sm leading-relaxed text-slate-600">
            We sent a password reset link to{' '}
            <span className="font-semibold text-slate-800">{email}</span>. The link is valid for 15
            minutes.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={() => setIsDispatched(false)}
            className="h-11 w-full rounded-[12px] border border-slate-200 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Send again
          </button>

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
          hasError={Boolean(error)}
          disabled={isSubmitting}
        />
        {error ? <p className="mt-1 text-xs font-medium text-red-500">{error}</p> : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] bg-[#3B82F6] text-base font-semibold text-white shadow-[0_4px_16px_rgba(59,130,246,0.25)] transition-all duration-150 hover:bg-[#2563EB] active:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Sending link...' : 'Send reset link'}
      </button>

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
