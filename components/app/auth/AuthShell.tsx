import Link from 'next/link';
import React from 'react';

import { H1, Span } from '@/components/ui/Typography';

export interface AuthShellProps {
  readonly children: React.ReactNode;
  readonly title: string;
  readonly subtitle?: string;
  readonly footerContent?: React.ReactNode;
}

export function AuthShell({ children, title, footerContent }: Readonly<AuthShellProps>) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-900/90 p-3 selection:bg-blue-100 selection:text-[#0044D3] sm:p-6 lg:p-10">
      {/* Centered Main Canvas */}
      <div className="flex min-h-[660px] w-full max-w-6xl flex-col items-stretch justify-between gap-8 rounded-[32px] border border-slate-200/40 bg-slate-50/95 p-4 shadow-2xl sm:rounded-[36px] sm:p-8 md:flex-row lg:p-10">
        {/* Left Side: Solid Cobalt Blue Rounded Panel (#0044D3) */}
        <div className="relative flex min-h-[360px] w-full flex-col justify-between overflow-hidden rounded-[28px] bg-[#0044D3] p-8 text-white shadow-md sm:rounded-[32px] md:min-h-[580px] md:w-1/2">
          {/* Ambient Subtle Highlights */}
          <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="pointer-events-none absolute right-0 -bottom-20 h-80 w-80 rounded-full bg-blue-900/40 blur-2xl" />

          {/* Top Brand Tag inside blue card */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-base font-bold text-[#0044D3] shadow-sm">
              TL
            </div>
            <Span className="text-xl font-bold tracking-tight text-white">Techeniac LMS</Span>
          </div>

          {/* Bottom Trust Tag */}
          <div className="relative z-10 mt-auto pt-8">
            <Span className="block text-xs font-medium tracking-wide text-blue-100/80 uppercase">
              Enterprise Learning Management
            </Span>
            <Span className="mt-1 block text-lg font-semibold text-white">
              Secure Role-Governed Workspace
            </Span>
          </div>
        </div>

        {/* Right Side: Form Container */}
        <div className="flex flex-1 flex-col items-center justify-center py-4">
          {/* Logo & Product Name Header */}
          <Link
            href="/"
            className="mb-6 flex items-center gap-2.5 transition-transform hover:scale-102"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0044D3] text-sm font-bold text-white shadow-sm">
              TL
            </div>
            <Span className="text-xl font-bold tracking-tight text-slate-900">Techeniac LMS</Span>
          </Link>

          {/* White Rounded Form Card */}
          <div className="w-full max-w-[420px] rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
            <H1 className="mb-6 text-center text-2xl font-bold tracking-tight text-slate-900">
              {title}
            </H1>

            {children}
          </div>

          {/* Optional Footer Content */}
          {footerContent ? <div className="w-full max-w-[420px] pt-4">{footerContent}</div> : null}
        </div>
      </div>
    </div>
  );
}
