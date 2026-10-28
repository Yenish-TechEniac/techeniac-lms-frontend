'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

import { Button } from '@/components/ui/Button';
import { H1, H2, H3, Lead, Muted, P, Span } from '@/components/ui/Typography';
import { useAuth } from '@/hooks/useAuth';
import { getRolePortalPath } from '@/hooks/useRoleRedirect';

export function LandingView() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const handlePrimaryCta = () => {
    if (isAuthenticated && user) {
      router.push(getRolePortalPath(user.role));
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-700">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Product Name in Corner */}
          <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-102">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0044D3] text-base font-bold text-white shadow-sm">
              TL
            </div>
            <div className="flex items-center gap-2">
              <Span className="text-lg font-bold tracking-tight text-slate-900">Techeniac LMS</Span>
              <Span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-blue-700">
                ENTERPRISE
              </Span>
            </div>
          </Link>

          {/* Right Header Navigation & Actions */}
          <div className="flex items-center gap-5">
            <nav className="hidden items-center gap-6 sm:flex">
              <a
                href="#features"
                className="text-xs font-semibold text-slate-600 transition-colors hover:text-[#0044D3]"
              >
                Features
              </a>
              <a
                href="#portals"
                className="text-xs font-semibold text-slate-600 transition-colors hover:text-[#0044D3]"
              >
                Role Portals
              </a>
              <a
                href="#security"
                className="text-xs font-semibold text-slate-600 transition-colors hover:text-[#0044D3]"
              >
                Security & Compliance
              </a>
            </nav>

            {isAuthenticated && user ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handlePrimaryCta}
                disabled={isLoading}
                className="rounded-full px-5 py-2 text-xs font-bold shadow-sm shadow-blue-500/20"
              >
                Go to Workspace
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handlePrimaryCta}
                disabled={isLoading}
                className="rounded-full px-5 py-2 text-xs font-bold shadow-sm shadow-blue-500/20"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-b from-blue-50/60 via-slate-50/30 to-white py-20 sm:py-28">
          {/* Animated Ambient Glow Orbs */}
          <div className="animate-glow pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="pointer-events-none absolute top-1/2 right-10 h-72 w-72 animate-pulse rounded-full bg-blue-100/50 blur-3xl" />

          <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-100/70 px-4 py-1.5 text-xs font-semibold text-blue-800 shadow-2xs">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#0044D3]" />
              Unified Enterprise Learning Architecture
            </div>

            <H1 className="mb-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Modern Learning Governance for High-Performance Teams
            </H1>

            <Lead className="mx-auto mb-10 max-w-3xl text-lg leading-relaxed text-slate-600 sm:text-xl">
              Orchestrate cohorts, allocate structured curricula, and monitor mentee progression in
              a single, high-integrity platform engineered for enterprise scalability.
            </Lead>

            {/* Rounded Buttons */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                variant="primary"
                size="lg"
                onClick={handlePrimaryCta}
                className="w-full rounded-full bg-[#0044D3] px-8 py-3.5 text-sm font-bold shadow-lg shadow-[#0044D3]/25 transition-transform hover:scale-102 hover:bg-[#0036ab] active:scale-98 sm:w-auto"
              >
                {isAuthenticated && user ? 'Go to Your Workspace' : 'Sign In to Workspace'}
              </Button>
              <a href="#portals" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full rounded-full border-slate-300 px-8 py-3.5 text-sm font-semibold hover:bg-slate-100 sm:w-auto"
                >
                  Explore Role Portals
                </Button>
              </a>
            </div>

            {/* Floating Quick Metrics Bar */}
            <div className="animate-float mt-16 grid grid-cols-2 gap-4 rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-xl shadow-slate-100/80 backdrop-blur-sm sm:grid-cols-4 sm:p-8">
              <div className="flex flex-col items-center">
                <Span className="text-2xl font-bold tracking-tight text-[#0044D3] sm:text-3xl">
                  100%
                </Span>
                <Muted className="text-xs font-medium text-slate-500">RBAC Enforced</Muted>
              </div>
              <div className="flex flex-col items-center">
                <Span className="text-2xl font-bold tracking-tight text-[#0044D3] sm:text-3xl">
                  Tamper-Evident
                </Span>
                <Muted className="text-xs font-medium text-slate-500">Audit Logging</Muted>
              </div>
              <div className="flex flex-col items-center">
                <Span className="text-2xl font-bold tracking-tight text-[#0044D3] sm:text-3xl">
                  Multi-Cohort
                </Span>
                <Muted className="text-xs font-medium text-slate-500">Batch Allocations</Muted>
              </div>
              <div className="flex flex-col items-center">
                <Span className="text-2xl font-bold tracking-tight text-[#0044D3] sm:text-3xl">
                  Real-Time
                </Span>
                <Muted className="text-xs font-medium text-slate-500">Progress Tracking</Muted>
              </div>
            </div>
          </div>
        </section>

        {/* Role Portals Section */}
        <section
          id="portals"
          className="scroll-mt-16 border-b border-slate-100 bg-slate-50/50 py-20 sm:py-28"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-14 text-center">
              <H2 className="mb-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Dedicated Workspaces for Every Role
              </H2>
              <P className="mx-auto max-w-2xl text-base text-slate-600">
                Tailored views provide each stakeholder with the precise tools and permissions
                necessary to succeed.
              </P>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Super Admin Card */}
              <div className="group flex flex-col rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-purple-300 hover:shadow-xl">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 transition-transform group-hover:scale-110">
                  <svg
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <H3 className="mb-2 text-xl font-bold text-slate-900">
                  Governance & Administration
                </H3>
                <P className="mb-6 flex-1 text-sm leading-relaxed text-slate-600">
                  Manage user provisioning, organization cohorts, curriculum builder, course
                  allocations, and security audit logs.
                </P>
                <div className="mt-auto border-t border-slate-100 pt-4">
                  <Span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                    Enterprise Control & Compliance
                  </Span>
                </div>
              </div>

              {/* Mentor Card */}
              <div className="group flex flex-col rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-emerald-300 hover:shadow-xl">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-110">
                  <svg
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <H3 className="mb-2 text-xl font-bold text-slate-900">Mentorship & Review</H3>
                <P className="mb-6 flex-1 text-sm leading-relaxed text-slate-600">
                  Supervise assigned mentee cohorts, orchestrate modular courses, review
                  submissions, and provide actionable feedback.
                </P>
                <div className="mt-auto border-t border-slate-100 pt-4">
                  <Span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Cohort Orchestration & Guidance
                  </Span>
                </div>
              </div>

              {/* Mentee Card */}
              <div className="group flex flex-col rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-blue-300 hover:shadow-xl">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0044D3] transition-transform group-hover:scale-110">
                  <svg
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <H3 className="mb-2 text-xl font-bold text-slate-900">Learning & Mastery</H3>
                <P className="mb-6 flex-1 text-sm leading-relaxed text-slate-600">
                  Access enrolled curriculum tracks, view assigned mentors, track completion
                  percentages, and submit required milestones.
                </P>
                <div className="mt-auto border-t border-slate-100 pt-4">
                  <Span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#0044D3]">
                    Structured Skill Development
                  </Span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="scroll-mt-16 border-b border-slate-100 bg-white py-20 sm:py-28"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-14 text-center">
              <H2 className="mb-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Built for Enterprise Reliability
              </H2>
              <P className="mx-auto max-w-2xl text-base text-slate-600">
                Engineered with strict access boundaries, non-repudiation audit trails, and
                resilient cohort operations.
              </P>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-3xl border border-slate-200/80 bg-slate-50/50 p-8 transition-all hover:bg-white hover:shadow-lg">
                <Span className="mb-2 block text-base font-bold text-slate-900">
                  Role-Based Access Control
                </Span>
                <P className="text-xs leading-relaxed text-slate-600">
                  Strict authorization barriers prevent unauthorized access between administrative,
                  mentor, and learner domains.
                </P>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-slate-50/50 p-8 transition-all hover:bg-white hover:shadow-lg">
                <Span className="mb-2 block text-base font-bold text-slate-900">
                  Dynamic Batch Allocation
                </Span>
                <P className="text-xs leading-relaxed text-slate-600">
                  Assign entire batches or individual mentees to courses and mentors with automatic
                  conflict resolution.
                </P>
              </div>

              <div
                id="security"
                className="scroll-mt-20 rounded-3xl border border-slate-200/80 bg-slate-50/50 p-8 transition-all hover:bg-white hover:shadow-lg"
              >
                <Span className="mb-2 block text-base font-bold text-slate-900">
                  Audit & Observability
                </Span>
                <P className="text-xs leading-relaxed text-slate-600">
                  Full visibility into administrative mutations, member transfers, and security
                  events with permanent timestamp records.
                </P>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-slate-50/80 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0044D3] text-xs font-bold text-white shadow-sm">
              TL
            </div>
            <Span className="text-sm font-semibold text-slate-800">Techeniac LMS Enterprise</Span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <Span>All Systems Operational</Span>
            </div>
            <Span className="hidden sm:inline">•</Span>
            <Span className="font-mono text-[11px]">v2.0 Enterprise Spec</Span>
          </div>
        </div>
      </footer>
    </div>
  );
}
