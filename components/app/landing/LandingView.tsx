'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { H1, H2, H3, Lead, Muted, P, Span } from '@/components/ui/Typography';
import { useAuth } from '@/hooks/useAuth';
import { getRolePortalPath } from '@/hooks/useRoleRedirect';

export function LandingView() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeStep, setActiveStep] = useState<number>(1);

  const handlePrimaryCta = () => {
    if (isAuthenticated && user) {
      router.push(getRolePortalPath(user.role));
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#111827] selection:bg-blue-100 selection:text-[#0044D3]">
      {/* 1. Full-Width Navbar (Spans full screen edge-to-edge, DESIGN_SYSTEM.md specs) */}
      <header className="sticky top-0 z-40 border-b border-[#E1E6EC] bg-white/95 backdrop-blur-md">
        <div className="flex h-20 w-full items-center justify-between px-6 sm:px-10 lg:px-16">
          {/* Left: Brand Logo & Enterprise Badge */}
          <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-102">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0044D3] text-base font-bold text-white shadow-md shadow-[#0044D3]/20">
              TL
            </div>
            <div className="flex flex-col">
              <Span className="text-xl font-bold tracking-tight text-[#111827]">Techeniac LMS</Span>
              <Span className="font-mono text-[10px] font-semibold tracking-wider text-[#0044D3] uppercase">
                Enterprise Platform
              </Span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#curricula"
              className="group flex items-center gap-1 text-sm font-medium text-[#667085] transition-colors hover:text-[#0044D3]"
            >
              Curricula Tracks
              <svg
                className="h-4 w-4 text-[#667085] transition-transform group-hover:rotate-180"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a
              href="#workflow"
              className="rounded-full bg-[#F6F8FC] px-4 py-1 text-sm font-medium text-[#0044D3] transition-colors hover:bg-blue-100/60"
            >
              Cohort Workflow
            </a>
            <a
              href="#features"
              className="text-sm font-medium text-[#667085] transition-colors hover:text-[#0044D3]"
            >
              Governance & RBAC
            </a>
            <a
              href="#testimonials"
              className="text-sm font-medium text-[#667085] transition-colors hover:text-[#0044D3]"
            >
              Outcomes
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <Button
                variant="primary"
                size="md"
                onClick={handlePrimaryCta}
                disabled={isLoading}
                className="h-10 rounded-full bg-[#0044D3] px-6 text-sm font-medium text-white shadow-md shadow-[#0044D3]/20 hover:bg-[#0036AB]"
              >
                Go to Workspace
              </Button>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="md"
                    className="h-10 rounded-full px-5 text-sm font-medium text-[#667085] hover:bg-[#F6F8FC] hover:text-[#111827]"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    variant="primary"
                    size="md"
                    className="h-10 rounded-full bg-[#0044D3] px-6 text-sm font-medium text-white shadow-md shadow-[#0044D3]/20 hover:bg-[#0036AB]"
                  >
                    Access Workspace
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* 2. Hero Section (Split Layout referencing user's uploaded screen structure) */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#F6F8FC] via-white to-white py-16 sm:py-24 lg:py-28">
          {/* Ambient Subtle Highlights */}
          <div className="animate-glow pointer-events-none absolute -top-40 right-1/4 h-[550px] w-[550px] rounded-full bg-blue-200/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-96 w-96 animate-pulse rounded-full bg-blue-100/40 blur-3xl" />

          <div className="relative w-full px-6 sm:px-10 lg:px-16">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
              {/* Left Column: Headline, Sunburst doodle, subtext, and CTA */}
              <div className="relative z-10 lg:col-span-6">
                {/* Cobalt Sunburst Spark Accent */}
                <div className="mb-4 inline-block text-[#0044D3]">
                  <svg
                    className="h-12 w-12 animate-pulse"
                    viewBox="0 0 48 48"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      strokeLinecap="round"
                      d="M24 4v6M24 38v6M4 24h6M38 24h6M9.86 9.86l4.24 4.24M33.9 33.9l4.24 4.24M9.86 38.14l4.24-4.24M33.9 14.1l4.24-4.24"
                    />
                    <circle cx="24" cy="24" r="8" strokeWidth="2" strokeDasharray="3 3" />
                  </svg>
                </div>

                <H1 className="mb-6 text-4xl leading-[1.14] font-bold tracking-tight text-[#111827] sm:text-5xl lg:text-[56px]">
                  Orchestrate Cohorts & Elevate Enterprise Engineering
                </H1>

                <Lead className="mb-8 max-w-xl text-base leading-relaxed text-[#667085] sm:text-lg">
                  A unified learning management system connecting administrators, mentors, and
                  mentees. Manage structured curricula, automate code assessments, and track cohort
                  progression in real time.
                </Lead>

                <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handlePrimaryCta}
                    className="h-12 rounded-full bg-[#0044D3] px-8 text-base font-medium text-white shadow-xl shadow-[#0044D3]/25 transition-transform hover:scale-103 hover:bg-[#0036AB] active:scale-98"
                  >
                    Access Workspace
                  </Button>
                  <a href="#workflow">
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-12 w-full rounded-full border border-[#0044D3] bg-white px-8 text-base font-medium text-[#0044D3] hover:bg-[#F6F8FC] sm:w-auto"
                    >
                      Explore Workflow
                    </Button>
                  </a>
                </div>

                {/* Hand-Drawn Wavy Scribble Doodle */}
                <div className="mt-8 text-[#0044D3]">
                  <svg
                    className="h-5 w-32"
                    viewBox="0 0 140 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  >
                    <path d="M4 12c12-8 24-8 36 0s24 8 36 0 24-8 36 0 16 6 24 2" />
                  </svg>
                </div>
              </div>

              {/* Right Column: Telemetry & Interactive Code Preview Card */}
              <div className="relative lg:col-span-6">
                <div className="relative mx-auto max-w-lg lg:max-w-none">
                  {/* IDE / Platform Workspace Preview Window */}
                  <div className="overflow-hidden rounded-3xl border border-[#33353B] bg-[#111827] p-6 text-white shadow-2xl shadow-blue-950/25">
                    {/* Top Window Bar */}
                    <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-[#D92D20]" />
                        <span className="h-3 w-3 rounded-full bg-[#F79009]" />
                        <span className="h-3 w-3 rounded-full bg-[#12B76A]" />
                        <Span className="ml-2 font-mono text-xs text-[#667085]">
                          techeniac-orchestrator.ts
                        </Span>
                      </div>
                      <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-blue-400">
                        COHORT MESH v2.4
                      </span>
                    </div>

                    {/* Simulated Code Body */}
                    <div className="font-mono text-xs leading-relaxed text-slate-300">
                      <p className="text-[#667085]">
                        {`// Configure enterprise cohort allocations & role guards`}
                      </p>
                      <p>
                        <span className="text-purple-400">const</span>{' '}
                        <span className="text-blue-400">cohort</span> ={' '}
                        <span className="text-purple-400">new</span>{' '}
                        <span className="text-[#F2C75C]">CurriculumTrack</span>(&apos;Full-Stack
                        Cloud Architecture&apos;);
                      </p>
                      <p className="text-slate-400">
                        cohort.allocateBatch(&apos;Batch-2026-Alpha&apos;, {'{'} capacity: 48 {'}'}
                        );
                      </p>
                      <p className="text-slate-400">
                        cohort.enforceRoleGuards([Role.MENTOR, Role.MENTEE]);
                      </p>
                      <p className="mt-2 text-[#12B76A]">
                        ✔ Verification passed: Zero conflict allocation
                      </p>
                    </div>

                    {/* Live Metric Cards Container */}
                    <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-6">
                      <div className="rounded-2xl border border-blue-500/20 bg-blue-950/40 p-4">
                        <Span className="text-[10px] font-bold tracking-wider text-blue-400 uppercase">
                          Active Enterprise Cohorts
                        </Span>
                        <div className="mt-1 flex items-baseline gap-2">
                          <Span className="text-2xl font-bold text-white">120+</Span>
                          <span className="inline-flex items-center text-xs font-semibold text-[#12B76A]">
                            +18% ↗
                          </span>
                        </div>
                        <Muted className="mt-0.5 text-[10px] text-[#667085]">
                          Batches in Active Progression
                        </Muted>
                      </div>

                      <div className="rounded-2xl border border-blue-500/20 bg-blue-950/40 p-4">
                        <Span className="text-[10px] font-bold tracking-wider text-blue-400 uppercase">
                          Security Standard
                        </Span>
                        <div className="mt-1 flex items-baseline gap-2">
                          <Span className="text-2xl font-bold text-white">100%</Span>
                          <span className="inline-flex items-center text-xs font-semibold text-[#12B76A]">
                            RBAC
                          </span>
                        </div>
                        <Muted className="mt-0.5 text-[10px] text-[#667085]">
                          Audit-Log Verified
                        </Muted>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Solid Cobalt Blue Enterprise Trust Strip (Matching Reference Image) */}
        <section className="relative w-full bg-[#0044D3] px-6 py-7 text-white shadow-lg sm:px-10 lg:px-16">
          <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
            <div className="flex shrink-0 items-center gap-3">
              <svg
                className="h-7 w-7 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="5" />
                <path
                  strokeLinecap="round"
                  d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                />
              </svg>
              <Span className="text-base font-bold tracking-tight text-white sm:text-lg">
                Collaborate with Top 100+ Universities and Engineering Organizations.
              </Span>
            </div>

            {/* Monochrome Brand Logos */}
            <div className="flex flex-wrap items-center justify-center gap-8 font-mono text-sm font-bold tracking-wider text-blue-100 lg:gap-12">
              <div className="flex items-center gap-2 opacity-95 transition-opacity hover:opacity-100">
                <span className="h-5 w-5 rounded-full border-2 border-white" />
                <span>LOGOIPSUM</span>
              </div>
              <div className="flex items-center gap-2 opacity-95 transition-opacity hover:opacity-100">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-white text-[10px] font-black text-[#0044D3]">
                  V
                </span>
                <span>VERTEX.AI</span>
              </div>
              <div className="flex items-center gap-2 opacity-95 transition-opacity hover:opacity-100">
                <span className="h-5 w-5 rotate-45 border border-white" />
                <span>CODESPHERE</span>
              </div>
              <div className="flex items-center gap-2 opacity-95 transition-opacity hover:opacity-100">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-black text-[#0044D3]">
                  Q
                </span>
                <span>QUANTUM</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. "Built for Scalable Learning Governance" (Feature Grid) */}
        <section id="features" className="scroll-mt-20 bg-white py-20 sm:py-28">
          <div className="w-full px-6 sm:px-10 lg:px-16">
            <div className="mb-16 text-center">
              <Span className="mb-2 block text-xs font-bold tracking-widest text-[#0044D3] uppercase">
                — Enterprise Learning Infrastructure
              </Span>
              <H2 className="mb-4 text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
                Engineered for High-Integrity Cohort Operations
              </H2>
              <P className="mx-auto max-w-2xl text-base text-[#667085]">
                Techeniac LMS provides enterprise-grade boundaries, batch conflict prevention, and
                comprehensive audit trails across all administrative workflows.
              </P>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Card 1: Modular Curriculum Studio */}
              <div className="group rounded-3xl border border-[#E1E6EC] bg-white p-8 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-300 hover:shadow-xl">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0044D3] transition-transform group-hover:scale-110">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <H3 className="mb-2 text-xl font-bold text-[#111827]">Modular Curriculum Studio</H3>
                <P className="text-sm leading-relaxed text-[#667085]">
                  Construct comprehensive courses divided into hierarchical modules, interactive
                  markdown notes, code repositories, and automated evaluation criteria.
                </P>
                <div className="mt-6 border-t border-[#E1E6EC] pt-4">
                  <span className="inline-flex items-center rounded-full bg-[#F6F8FC] px-3 py-1 text-xs font-medium text-[#0044D3]">
                    Curriculum Governance
                  </span>
                </div>
              </div>

              {/* Card 2: Batch Allocation & Mentorship */}
              <div className="group rounded-3xl border border-[#E1E6EC] bg-white p-8 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-300 hover:shadow-xl">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0044D3] transition-transform group-hover:scale-110">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <H3 className="mb-2 text-xl font-bold text-[#111827]">
                  Conflict-Free Batch Allocation
                </H3>
                <P className="text-sm leading-relaxed text-[#667085]">
                  Allocate entire cohorts or individual mentees to courses and mentors with
                  automatic scheduling validation, workload balancing, and capacity limits.
                </P>
                <div className="mt-6 border-t border-[#E1E6EC] pt-4">
                  <span className="inline-flex items-center rounded-full bg-[#F6F8FC] px-3 py-1 text-xs font-medium text-[#0044D3]">
                    Batch Automation
                  </span>
                </div>
              </div>

              {/* Card 3: Enterprise RBAC & Audit Trails */}
              <div className="group rounded-3xl border border-[#E1E6EC] bg-white p-8 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-300 hover:shadow-xl">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0044D3] transition-transform group-hover:scale-110">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <H3 className="mb-2 text-xl font-bold text-[#111827]">
                  Role-Based Access & Security
                </H3>
                <P className="text-sm leading-relaxed text-[#667085]">
                  Strict multi-role authorization separates Super Admin, Mentor, and Mentee
                  operations with permanent timestamped audit event logging.
                </P>
                <div className="mt-6 border-t border-[#E1E6EC] pt-4">
                  <span className="inline-flex items-center rounded-full bg-[#F6F8FC] px-3 py-1 text-xs font-medium text-[#0044D3]">
                    SOC2 & RBAC Ready
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. "Deploy & Run Cohorts in 3 Simple Steps" (Interactive Accordion Workflow) */}
        <section
          id="workflow"
          className="scroll-mt-20 border-y border-[#E1E6EC] bg-[#F6F8FC] py-20 sm:py-28"
        >
          <div className="w-full px-6 sm:px-10 lg:px-16">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
              {/* Left Column: Heading, description, CTA, and studio workstation visual */}
              <div className="lg:col-span-5">
                <Span className="mb-2 block text-xs font-bold tracking-widest text-[#0044D3] uppercase">
                  — Operational Workflow
                </Span>
                <H2 className="mb-4 text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
                  Deploy & Run Cohorts in 3 Simple Steps
                </H2>
                <P className="mb-8 text-base leading-relaxed text-[#667085]">
                  From curriculum structure to verified completion, Techeniac LMS automates every
                  phase of technical mentorship and batch delivery.
                </P>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handlePrimaryCta}
                  className="mb-8 h-12 rounded-full bg-[#0044D3] px-8 text-base font-medium text-white shadow-lg shadow-[#0044D3]/25 hover:bg-[#0036AB]"
                >
                  Launch Your Cohort
                </Button>

                {/* Studio Workstation Mockup Card */}
                <div className="relative overflow-hidden rounded-3xl border border-[#33353B] bg-[#111827] p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono text-xs text-[#667085]">
                    <span>Orchestration Console</span>
                    <span className="flex items-center gap-1.5 text-[#12B76A]">
                      <span className="h-2 w-2 animate-ping rounded-full bg-[#12B76A]" />
                      Active Sync
                    </span>
                  </div>
                  <div className="mt-4 flex h-36 items-center justify-center rounded-2xl border border-blue-900/30 bg-gradient-to-br from-blue-950/80 to-[#111827] p-4 text-center">
                    <div>
                      <svg
                        className="mx-auto h-10 w-10 text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <Span className="mt-2 block text-xs font-medium text-slate-200">
                        Automated Milestones & Pull Request Review Pipeline
                      </Span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: 3-Step Accordion Items */}
              <div className="space-y-4 lg:col-span-7">
                {/* Step 1 */}
                <div
                  onClick={() => setActiveStep(1)}
                  className={`cursor-pointer rounded-3xl border p-6 transition-all sm:p-8 ${
                    activeStep === 1
                      ? 'border-[#0044D3] bg-white shadow-xl shadow-blue-950/5'
                      : 'border-[#E1E6EC] bg-white/70 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <H3 className="text-xl font-bold text-[#111827]">
                      1. Architect Curricula & Module Milestones
                    </H3>
                    <span className="text-xl font-bold text-[#0044D3]">
                      {activeStep === 1 ? '—' : '+'}
                    </span>
                  </div>
                  {activeStep === 1 ? (
                    <P className="mt-4 text-sm leading-relaxed text-[#667085]">
                      Create hierarchical syllabi with modular lectures, integrated coding tasks,
                      and assessment criteria designed to evaluate real-world engineering
                      competency.
                    </P>
                  ) : null}
                </div>

                {/* Step 2 */}
                <div
                  onClick={() => setActiveStep(2)}
                  className={`cursor-pointer rounded-3xl border p-6 transition-all sm:p-8 ${
                    activeStep === 2
                      ? 'border-[#0044D3] bg-white shadow-xl shadow-blue-950/5'
                      : 'border-[#E1E6EC] bg-white/70 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <H3 className="text-xl font-bold text-[#111827]">
                      2. Provision Batches & Assign Mentors
                    </H3>
                    <span className="text-xl font-bold text-[#0044D3]">
                      {activeStep === 2 ? '—' : '+'}
                    </span>
                  </div>
                  {activeStep === 2 ? (
                    <P className="mt-4 text-sm leading-relaxed text-[#667085]">
                      Group learners into targeted batches, assign dedicated mentors, and establish
                      conflict-free schedule allocations with automated capacity guards.
                    </P>
                  ) : null}
                </div>

                {/* Step 3 */}
                <div
                  onClick={() => setActiveStep(3)}
                  className={`cursor-pointer rounded-3xl border p-6 transition-all sm:p-8 ${
                    activeStep === 3
                      ? 'border-[#0044D3] bg-white shadow-xl shadow-blue-950/5'
                      : 'border-[#E1E6EC] bg-white/70 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <H3 className="text-xl font-bold text-[#111827]">
                      3. Monitor Progression & Certify Outcomes
                    </H3>
                    <span className="text-xl font-bold text-[#0044D3]">
                      {activeStep === 3 ? '—' : '+'}
                    </span>
                  </div>
                  {activeStep === 3 ? (
                    <P className="mt-4 text-sm leading-relaxed text-[#667085]">
                      Track real-time mentee progress percentages, grade milestones, conduct 1-on-1
                      feedback sessions, and issue cryptographically verifiable completion
                      certificates.
                    </P>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Testimonials Section (Matching Reference Layout) */}
        <section id="testimonials" className="scroll-mt-20 bg-white py-20 sm:py-28">
          <div className="w-full px-6 text-center sm:px-10 lg:px-16">
            <Span className="mb-2 block text-xs font-bold tracking-widest text-[#0044D3] uppercase">
              — Proven Outcomes
            </Span>
            <H2 className="mb-10 text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
              Over 100+ Engineering Leaders Trust Techeniac LMS
            </H2>

            {/* Testimonial Quote */}
            <div className="mx-auto max-w-3xl">
              {/* Star Rating in semantic-accent (#F2C75C) */}
              <div className="mb-6 flex justify-center gap-1 text-[#F2C75C]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <P className="text-lg leading-relaxed font-normal text-[#323232] sm:text-xl">
                &ldquo;Techeniac LMS has transformed how we orchestrate engineering cohorts.
                Managing batch allocations, assigning mentors, and reviewing student code milestones
                happens seamlessly with complete audit visibility.&rdquo;
              </P>

              <div className="mt-8 flex flex-col items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0044D3] text-sm font-bold text-white shadow-sm">
                  MV
                </div>
                <Span className="mt-2 text-sm font-bold text-[#111827]">Marcus Vance</Span>
                <Muted className="text-xs text-[#667085]">
                  Head of Engineering Enablement, Vertex Cloud
                </Muted>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Full-Width Bottom CTA Banner (Solid Cobalt Blue #0044D3) */}
        <section className="w-full px-6 pb-20 sm:px-10 sm:pb-28 lg:px-16">
          <div className="relative overflow-hidden rounded-3xl bg-[#0044D3] px-8 py-16 text-center text-white shadow-2xl sm:px-16 sm:py-20">
            {/* Ambient Watermark Motif */}
            <div className="animate-glow pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-blue-900/40 blur-2xl" />

            <div className="relative z-10 mx-auto max-w-3xl">
              <H2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Ready to Modernize Your Enterprise Learning Platform?
              </H2>
              <P className="mb-10 text-base leading-relaxed text-blue-100 sm:text-lg">
                Join forward-thinking enterprise teams. Orchestrate structured cohorts, empower
                mentors, and achieve verified engineering competencies with Techeniac LMS.
              </P>

              <Button
                variant="secondary"
                size="lg"
                onClick={handlePrimaryCta}
                className="h-12 rounded-full bg-white px-9 text-base font-medium text-[#0044D3] shadow-lg transition-transform hover:scale-105 hover:bg-[#F6F8FC] active:scale-98"
              >
                Access Workspace
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* 8. Full-Width Footer (Adhering to DESIGN_SYSTEM.md tokens) */}
      <footer className="w-full border-t border-[#E1E6EC] bg-[#F6F8FC] px-6 py-12 sm:px-10 lg:px-16">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0044D3] text-xs font-bold text-white shadow-xs">
              TL
            </div>
            <div className="flex flex-col">
              <Span className="text-sm font-bold text-[#111827]">Techeniac LMS Enterprise</Span>
              <Span className="text-[11px] text-[#667085]">Learning & Cohort Management OS</Span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-[#667085]">
            <a href="#features" className="hover:text-[#0044D3]">
              Governance
            </a>
            <a href="#workflow" className="hover:text-[#0044D3]">
              Workflow
            </a>
            <a href="#testimonials" className="hover:text-[#0044D3]">
              Outcomes
            </a>
            <Link href="/login" className="font-medium text-[#0044D3] hover:underline">
              Sign In
            </Link>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#667085]">
            <span className="h-2 w-2 rounded-full bg-[#12B76A]" />
            <Span>All Systems Operational</Span>
          </div>
        </div>
      </footer>
    </div>
  );
}
