import React from 'react';

export interface AuthShellProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthShell({ children, title, subtitle }: AuthShellProps) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-white selection:bg-blue-100 selection:text-blue-700 md:flex-row">
      {/* Left 50%: Calm Sky Soft Branding Panel */}
      <div className="relative flex min-h-[380px] w-full flex-col justify-between overflow-hidden border-r border-[#DBEAFE] bg-[#EFF6FF] p-8 sm:p-12 md:min-h-screen md:w-1/2 lg:p-16">
        {/* Ambient Decorative Geometry */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#DBEAFE]/40 blur-3xl" />
        <div className="pointer-events-none absolute right-0 -bottom-20 h-80 w-80 rounded-full bg-[#BFDBFE]/30 blur-2xl" />

        {/* Top Header Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#3B82F6] text-lg font-bold text-white shadow-sm">
            T
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-slate-900">Techeniac LMS</span>
            <span className="inline-flex items-center rounded-full border border-[#BFDBFE] bg-[#DBEAFE] px-2 py-0.5 font-mono text-xs font-medium text-[#1D4ED8]">
              ENTERPRISE
            </span>
          </div>
        </div>

        {/* Center Hero Messaging */}
        <div className="relative z-10 my-auto max-w-lg py-8">
          <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-[20px] border border-[#BFDBFE] bg-white shadow-[0_8px_24px_rgba(59,130,246,0.08)]">
            <svg
              className="h-10 w-10 text-[#3B82F6]"
              viewBox="0 0 54 54"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M7 38.5C12 36.5 19 36.5 25 39V15C19 12.5 12 12.5 7 14.5V38.5Z"
                stroke="#3B82F6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M47 38.5C42 36.5 35 36.5 29 39V15C35 12.5 42 12.5 47 14.5V38.5Z"
                stroke="#3B82F6"
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
              <circle cx="27" cy="14" r="1.5" fill="#3B82F6" />
            </svg>
          </div>

          <h1 className="mb-3 text-3xl leading-tight font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Techeniac LMS
          </h1>
          <p className="text-lg leading-relaxed font-normal text-slate-600">
            Learn, build, and grow with your mentors and peers.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-5 border-t border-[#BFDBFE]/60 pt-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Multi-Role Access Control</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span>Permanent Learning History</span>
            </div>
          </div>
        </div>

        {/* Bottom Footer Meta */}
        <div className="relative z-10 flex items-center justify-between pt-4 font-mono text-xs text-slate-400">
          <span>OPERATIONAL CONSOLE</span>
          <span>ENTERPRISE SPEC v2.0</span>
        </div>
      </div>

      {/* Right 50%: Content Layout */}
      <div className="flex min-h-screen w-full items-center justify-center bg-white p-6 sm:p-10 md:w-1/2 lg:p-16">
        <div className="flex w-full max-w-[440px] flex-col justify-center">
          <div className="mb-8">
            <h2 className="mb-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {title}
            </h2>
            <p className="text-sm leading-normal text-slate-600 sm:text-base">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
