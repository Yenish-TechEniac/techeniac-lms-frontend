import React from 'react';

import { H1, H2, P, Span } from '@/components/ui/Typography';

export interface AuthShellProps {
  readonly children: React.ReactNode;
  readonly title: string;
  readonly subtitle: string;
}

export function AuthShell({ children, title, subtitle }: Readonly<AuthShellProps>) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-white selection:bg-blue-100 selection:text-blue-700 md:flex-row">
      {/* Left 50%: Calm Sky Soft Branding Panel (Collapses to compact header on mobile) */}
      <div className="relative flex w-full flex-col justify-between overflow-hidden border-b border-blue-100 bg-blue-50 p-4 sm:p-6 md:min-h-screen md:w-1/2 md:border-r md:border-b-0 md:p-12 lg:p-16">
        {/* Ambient Decorative Geometry */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-100/40 blur-3xl" />
        <div className="pointer-events-none absolute right-0 -bottom-20 h-80 w-80 rounded-full bg-blue-200/30 blur-2xl" />

        {/* Top Header Brand (Compact on mobile, top bar on desktop) */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-lg font-bold text-white shadow-sm">
            T
          </div>
          <div className="flex items-center gap-2">
            <Span className="text-xl font-bold tracking-tight text-slate-900">Techeniac LMS</Span>
            <Span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-2 py-0.5 font-mono text-xs font-medium text-blue-700">
              ENTERPRISE
            </Span>
          </div>
        </div>

        {/* Center Hero Messaging (Desktop only, hidden on mobile to keep form above the fold) */}
        <div className="relative z-10 my-auto hidden max-w-lg py-8 md:block">
          <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-blue-200 bg-white shadow-[0_8px_24px_rgba(59,130,246,0.08)]">
            <svg
              className="h-10 w-10 text-blue-500"
              viewBox="0 0 54 54"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M7 38.5C12 36.5 19 36.5 25 39V15C19 12.5 12 12.5 7 14.5V38.5Z"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M47 38.5C42 36.5 35 36.5 29 39V15C35 12.5 42 12.5 47 14.5V38.5Z"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M27 7L30 14C30 14 32.5 16 32.5 19.5L27 18L21.5 19.5C21.5 16 24 14 24 14L27 7Z"
                stroke="#1D4ED8"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="#DBEAFE"
              />
              <circle cx="27" cy="14" r="1.5" fill="currentColor" />
            </svg>
          </div>

          <H1 className="mb-3 text-3xl leading-tight font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Techeniac LMS
          </H1>
          <P className="text-lg leading-relaxed font-normal text-slate-600">
            Learn, build, and grow with your mentors and peers.
          </P>

          <div className="mt-8 flex flex-wrap items-center gap-5 border-t border-blue-200/60 pt-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <Span>Multi-Role Access Control</Span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <Span>Permanent Learning History</Span>
            </div>
          </div>
        </div>

        {/* Bottom Footer Meta (Desktop only) */}
        <div className="relative z-10 hidden items-center justify-between pt-4 font-mono text-xs text-slate-400 md:flex">
          <Span>OPERATIONAL CONSOLE</Span>
          <Span>ENTERPRISE SPEC v2.0</Span>
        </div>
      </div>

      {/* Right 50%: Content Layout */}
      <div className="flex w-full flex-1 items-center justify-center bg-white p-6 sm:p-10 md:min-h-screen md:w-1/2 lg:p-16">
        <div className="flex w-full max-w-[440px] flex-col justify-center">
          <div className="mb-8">
            <H2 className="mb-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {title}
            </H2>
            <P className="text-sm leading-normal text-slate-600 sm:text-base">{subtitle}</P>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
