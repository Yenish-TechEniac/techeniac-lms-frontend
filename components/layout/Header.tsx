'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Span } from '@/components/ui/Typography';
import { useAuth } from '@/hooks/useAuth';

export interface HeaderNavItem {
  readonly label: string;
  readonly href: string;
  readonly active?: boolean;
}

export interface HeaderProps {
  readonly subtitle?: string;
  readonly homeUrl?: string;
  readonly badgeColor?: string;
  readonly nav?: readonly HeaderNavItem[];
}

function getUserInitials(name?: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    const first = parts[0]?.charAt(0) ?? '';
    const last = parts[parts.length - 1]?.charAt(0) ?? '';
    return `${first}${last}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function formatRole(role?: string): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'Administrator';
    case 'MENTOR':
      return 'Mentor';
    case 'MENTEE':
      return 'Mentee';
    default:
      return role ?? 'Member';
  }
}

function getNavIcon(label: string) {
  const normalized = label.toLowerCase();
  if (
    normalized.includes('overview') ||
    normalized.includes('dashboard') ||
    normalized.includes('learning')
  ) {
    return (
      <svg
        className="h-5 w-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    );
  }
  if (normalized.includes('user') || normalized.includes('mentee')) {
    return (
      <svg
        className="h-5 w-5 shrink-0"
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
    );
  }
  if (normalized.includes('batch')) {
    return (
      <svg
        className="h-5 w-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    );
  }
  if (normalized.includes('course') || normalized.includes('curriculum')) {
    return (
      <svg
        className="h-5 w-5 shrink-0"
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
    );
  }
  if (normalized.includes('allocation')) {
    return (
      <svg
        className="h-5 w-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
      </svg>
    );
  }
  return (
    <svg
      className="h-5 w-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function Header({ homeUrl = '/', nav = [] }: Readonly<HeaderProps>) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  // Side Drawer State (Always on by default)
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  // Profile Popover State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileContainerRef = useRef<HTMLDivElement>(null);

  // Close profile on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileContainerRef.current &&
        !profileContainerRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle escape key for drawer and popover
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsDrawerOpen(false);
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError(null);
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Could not sign out. Please check your connection and try again.';
      setLogoutError(msg);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const userInitials = getUserInitials(user?.name);
  const formattedRole = formatRole(user?.role);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="flex h-16 w-full items-center justify-between px-6 sm:px-10 lg:px-16">
          {/* Left Corner: Drawer Toggle + Logo + Product Name */}
          <div className="flex items-center gap-3">
            {nav.length > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsDrawerOpen((prev) => !prev)}
                className="h-10 w-10 p-0 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                aria-label={isDrawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={isDrawerOpen}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </Button>
            ) : null}

            <Link href={homeUrl} className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0044D3] text-sm font-bold text-white shadow-sm">
                TL
              </div>
              <Span className="text-base font-bold tracking-tight text-slate-900">
                Techeniac LMS
              </Span>
            </Link>
          </div>

          {/* Right Corner: Profile Button (with Hover Popover) + Sign Out Icon */}
          <div className="relative flex items-center gap-3">
            {logoutError ? (
              <div
                role="alert"
                className="absolute top-12 right-0 z-50 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 shadow-lg"
              >
                <Span>{logoutError}</Span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setLogoutError(null)}
                  className="h-6 w-6 p-0 font-bold text-red-500 hover:text-red-800"
                  aria-label="Dismiss error"
                >
                  ×
                </Button>
              </div>
            ) : null}

            {user ? (
              <div
                ref={profileContainerRef}
                className="relative"
                onMouseEnter={() => setIsProfileOpen(true)}
                onMouseLeave={() => setIsProfileOpen(false)}
              >
                {/* Profile Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-xs font-bold text-[#0044D3] shadow-xs transition-all hover:border-blue-400 hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-[#0044D3] focus-visible:outline-none"
                  aria-label="User profile and account settings"
                  aria-expanded={isProfileOpen}
                >
                  {userInitials}
                </button>

                {/* Profile Popover / Dropdown Card */}
                {isProfileOpen ? (
                  <div className="absolute top-full right-0 z-50 w-72 origin-top-right pt-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl ring-1 ring-black/5">
                      {/* User Header */}
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0044D3] text-sm font-bold text-white shadow-sm">
                          {userInitials}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <Span className="truncate text-sm font-bold text-slate-900">
                            {user.name}
                          </Span>
                          <Span className="truncate text-xs text-slate-500">{user.email}</Span>
                        </div>
                      </div>

                      {/* Role Info */}
                      <div className="my-3 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                        <Span className="text-xs font-medium text-slate-600">Assigned Role</Span>
                        <Span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-[#0044D3]">
                          {formattedRole}
                        </Span>
                      </div>

                      {/* Popover Signout Action */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsProfileOpen(false);
                          void handleLogout();
                        }}
                        disabled={isLoggingOut}
                        isLoading={isLoggingOut}
                        className="w-full justify-start gap-2.5 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Sign out
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* Side Navigation Drawer / Persistent Sidebar */}
      {isDrawerOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Site Navigation Drawer"
          className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#E1E6EC] bg-white shadow-2xl transition-all duration-200 md:shadow-md"
        >
          {/* Mobile-Only Backdrop Overlay (< md) */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="animate-fade-in backdrop-blur-2xs fixed inset-0 -z-10 bg-slate-900/30 transition-opacity md:hidden"
            aria-hidden="true"
          />

          {/* Drawer Header: TL Logo + Techeniac LMS Title + Close Button */}
          <div className="flex h-16 items-center justify-between border-b border-[#E1E6EC] px-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0044D3] text-sm font-black text-white shadow-xs">
                TL
              </div>
              <Span className="text-base font-bold tracking-tight text-[#111827]">
                Techeniac LMS
              </Span>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsDrawerOpen(false)}
              className="h-8 w-8 rounded-xl p-0 text-[#667085] hover:bg-[#F6F8FC] hover:text-[#111827]"
              title="Close sidebar"
              aria-label="Close navigation sidebar"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>

          {/* Navigation Category Label (Matching LeadNest Reference) */}
          <div className="px-5 pt-5 pb-2">
            <Span className="font-mono text-xs font-bold tracking-wider text-[#667085] uppercase">
              PORTAL NAVIGATION
            </Span>
          </div>

          {/* Navigation List with Generous Spacing (Matching Reference) */}
          <div className="flex-1 overflow-y-auto px-4 py-2">
            <nav className="flex flex-col space-y-2" aria-label="Portal Navigation Links">
              {nav.map((item) => {
                const isActive = Boolean(item.active);
                const icon = getNavIcon(item.label);

                if (item.href !== '#') {
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => {
                        if (typeof window !== 'undefined' && window.innerWidth < 768) {
                          setIsDrawerOpen(false);
                        }
                      }}
                      className={`flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-base transition-all ${
                        isActive
                          ? 'bg-blue-50/90 font-semibold text-[#0044D3] shadow-xs'
                          : 'font-medium text-[#667085] hover:bg-[#F6F8FC] hover:text-[#111827]'
                      }`}
                    >
                      <span className={isActive ? 'text-[#0044D3]' : 'text-[#667085]'}>{icon}</span>
                      <Span className="flex-1">{item.label}</Span>
                      {isActive ? <span className="h-2 w-2 rounded-full bg-[#0044D3]" /> : null}
                    </Link>
                  );
                }

                return (
                  <div
                    key={item.label}
                    className="flex cursor-not-allowed items-center gap-3.5 rounded-2xl px-4 py-3.5 text-base font-medium text-slate-300"
                  >
                    <span className="text-slate-300">{icon}</span>
                    <Span className="flex-1">{item.label}</Span>
                    <Span className="text-xs tracking-wider text-slate-400 uppercase">Soon</Span>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Dock / Collapse Button (Matching Reference Image Dock Icon) */}
          <div className="flex items-center justify-end px-5 py-2">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E1E6EC] text-[#667085] transition-colors hover:bg-[#F6F8FC] hover:text-[#111827]"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18" />
              </svg>
            </button>
          </div>

          {/* Drawer Footer with Logout Action */}
          <div className="border-t border-[#E1E6EC] bg-[#F6F8FC]/50 p-4">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => {
                void handleLogout();
              }}
              disabled={isLoggingOut}
              isLoading={isLoggingOut}
              className="h-11 w-full justify-center gap-2 rounded-full border-[#E1E6EC] bg-white text-sm font-semibold text-[#667085] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-[#D92D20]"
            >
              {!isLoggingOut ? (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              ) : null}
              {isLoggingOut ? 'Signing out...' : 'Sign Out'}
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}
