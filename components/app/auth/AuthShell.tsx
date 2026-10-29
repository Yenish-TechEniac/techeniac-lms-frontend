import Link from 'next/link';
import React from 'react';

import { H1, H2, Span } from '@/components/ui/Typography';

export interface AuthShellProps {
  readonly children: React.ReactNode;
  readonly title: string;
  readonly subtitle?: string;
  readonly footerContent?: React.ReactNode;
}

export function AuthShell({ children, title, footerContent }: Readonly<AuthShellProps>) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-white selection:bg-blue-100 selection:text-[#0044D3] md:flex-row">
      {/* Mobile-Only Top Brand Bar (< md) */}
      <div className="flex w-full items-center justify-between border-b border-blue-600 bg-[#0044D3] px-6 py-4 text-white md:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-black text-[#0044D3] shadow-sm">
            TL
          </div>
          <Span className="text-lg font-bold tracking-tight text-white">Techeniac LMS</Span>
        </Link>
        <Span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-blue-100">
          Enterprise
        </Span>
      </div>

      {/* Left 50%: Solid Cobalt Blue Full-Height Panel (#0044D3) for Tablet, Laptop, Desktop (>= md) */}
      <div className="relative hidden w-full flex-col justify-between overflow-hidden bg-[#0044D3] p-8 text-white shadow-xl md:flex md:min-h-screen md:w-1/2 md:p-10 lg:p-16">
        {/* Ambient Subtle Depth Highlights */}
        <div className="animate-glow pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-blue-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 -bottom-20 h-96 w-96 animate-pulse rounded-full bg-blue-900/40 blur-2xl" />

        {/* Top Header Brand inside blue panel */}
        <div className="relative z-10 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-102">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-base font-extrabold text-[#0044D3] shadow-md">
              TL
            </div>
            <div className="flex flex-col">
              <Span className="text-xl font-bold tracking-tight text-white">Techeniac LMS</Span>
              <Span className="font-mono text-[10px] tracking-wider text-blue-200 uppercase">
                Enterprise Platform
              </Span>
            </div>
          </Link>
        </div>

        {/* Center Hero Messaging inside blue panel (visible on tablet, laptop, desktop) */}
        <div className="relative z-10 my-auto max-w-lg py-10 lg:py-14">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
            <Span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Enterprise Learning Platform
          </div>
          <H2 className="mb-4 text-3xl leading-tight font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Empower Learning, Mentorship & Growth
          </H2>
          <Span className="block text-base leading-relaxed text-blue-100 sm:text-lg">
            A centralized operational system connecting administrators, mentors, and mentees with
            structured cohorts and real-time tracking.
          </Span>

          <div className="mt-10 flex items-center gap-8 border-t border-white/15 pt-8 text-xs font-medium text-blue-100">
            <div className="flex items-center gap-2.5">
              <Span className="h-2 w-2 rounded-full bg-emerald-400" />
              <Span>Multi-Role RBAC</Span>
            </div>
            <div className="flex items-center gap-2.5">
              <Span className="h-2 w-2 rounded-full bg-white" />
              <Span>Real-Time Auditing</Span>
            </div>
          </div>
        </div>

        {/* Bottom Trust Tag */}
        <div className="relative z-10 flex items-center justify-between pt-6 font-mono text-xs text-blue-200/80">
          <Span>OPERATIONAL CONSOLE</Span>
          <Span>v2.0 ENTERPRISE SPEC</Span>
        </div>
      </div>

      {/* Right 50%: Form Workspace Container (Full-height edge-to-edge, fully responsive) */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-10 sm:px-12 md:min-h-screen md:w-1/2 md:p-12 lg:p-16">
        <div className="w-full max-w-[420px] lg:max-w-[460px]">
          {/* Form Title */}
          <div className="mb-8 text-center sm:text-left">
            <H1 className="text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">
              {title}
            </H1>
          </div>

          {/* Main Form Body */}
          <div className="w-full">{children}</div>

          {/* Optional Footer Content (below the form) */}
          {footerContent ? <div className="w-full pt-6">{footerContent}</div> : null}
        </div>
      </div>
    </div>
  );
}
