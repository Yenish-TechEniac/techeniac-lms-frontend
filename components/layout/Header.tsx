'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Span } from '@/components/ui/Typography';
import { useSidebar } from '@/context/SidebarContext';
import { useAuth } from '@/hooks/useAuth';
import { getRoleProfilePath } from '@/hooks/useRoleRedirect';
import { formatRoleLabel } from '@/lib/roles';
import { getUserInitials } from '@/lib/user';

export interface HeaderNavItem {
  readonly label: string;
  readonly href: string;
  readonly active?: boolean;
  readonly icon?: string;
}

export interface HeaderProps {
  readonly subtitle?: string;
  readonly homeUrl?: string;
  readonly badgeColor?: string;
  readonly nav?: readonly HeaderNavItem[];
}

function ProfileNavIcon({ className }: { readonly className?: string }) {
  return (
    <svg
      className={className ?? 'h-4 w-4 text-slate-400 group-hover:text-[#0044D3]'}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

function formatRole(role?: string): string {
  return formatRoleLabel(role);
}

function getNavIcon(itemOrLabel: HeaderNavItem | string) {
  const key = typeof itemOrLabel === 'string' ? itemOrLabel : itemOrLabel.icon || itemOrLabel.label;
  const normalized = key.toLowerCase();
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
  if (
    normalized.includes('assignment') ||
    normalized.includes('submission') ||
    normalized.includes('review')
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
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    );
  }
  if (normalized.includes('progress') || normalized.includes('tracker')) {
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
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
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

  // Side Drawer State managed by SidebarContext
  const { isDrawerOpen, setIsDrawerOpen, contentMarginClass } = useSidebar();

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
  }, [setIsDrawerOpen]);

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
  const profileUrl = user ? getRoleProfilePath(user.role) : '/profile';

  return (
    <>
      <header
        className={`sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md transition-all duration-300 ${contentMarginClass}`}
      >
        <div className="flex h-16 w-full items-center justify-between px-6 sm:px-8 lg:px-10">
          {/* Left Corner: Logo + Product Name + Mobile Menu Toggle (< md) */}
          <div className="flex items-center gap-3 md:hidden">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsDrawerOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl p-0 text-slate-700 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#0044D3]"
              aria-label="Open navigation menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
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
          <div className="relative ml-auto flex items-center gap-3">
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
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-blue-200 bg-blue-50 p-0 text-xs font-bold text-[#0044D3] shadow-xs transition-all hover:border-blue-400 hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-[#0044D3] focus-visible:outline-none"
                  aria-label="User profile and account settings"
                  aria-expanded={isProfileOpen}
                >
                  {userInitials}
                </Button>

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

                      {/* Popover Profile Navigation */}
                      <div className="border-t border-slate-100 pt-2 pb-1">
                        <Link
                          href={profileUrl}
                          onClick={() => setIsProfileOpen(false)}
                          className="group flex min-h-[44px] w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-[#0044D3]"
                        >
                          <ProfileNavIcon />
                          <Span>View Profile</Span>
                        </Link>
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

      {/* Mobile-Only Backdrop Overlay (< md) */}
      <div
        onClick={() => setIsDrawerOpen(false)}
        className={`backdrop-blur-2xs fixed inset-0 z-40 bg-slate-900/30 transition-opacity duration-300 md:hidden ${
          isDrawerOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden="true"
      />

      {/* Collapsed Side Navigation Rail (Icon Rail matching LeadNest Figma design) */}
      <aside
        aria-label="Collapsed Navigation Rail"
        className={`fixed inset-y-0 left-0 z-40 hidden w-20 flex-col items-center justify-between border-r border-[#E1E6EC] bg-white py-5 transition-all duration-300 md:flex ${
          isDrawerOpen
            ? 'pointer-events-none -translate-x-full opacity-0'
            : 'pointer-events-auto translate-x-0 opacity-100 shadow-sm'
        }`}
      >
        {/* Top: Logo + Navigation Icons grouped at the top */}
        <div className="flex w-full flex-col items-center gap-6">
          <Link
            href={homeUrl}
            className="group flex items-center justify-center pt-1"
            title="Techeniac LMS"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0044D3] text-sm font-black text-white shadow-xs transition-transform group-hover:scale-105">
              TL
            </div>
          </Link>

          {/* Icon Nav List directly below logo */}
          <nav className="flex flex-col items-center space-y-3" aria-label="Quick Navigation">
            {nav.map((item) => {
              const isActive = Boolean(item.active);
              const icon = getNavIcon(item);

              if (item.href !== '#') {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    title={item.label}
                    aria-label={item.label}
                    className={`flex h-11 w-11 items-center justify-center rounded-full transition-all ${
                      isActive
                        ? 'bg-blue-100 text-[#0044D3] shadow-xs'
                        : 'text-[#667085] hover:bg-[#F6F8FC] hover:text-[#111827]'
                    }`}
                  >
                    {icon}
                  </Link>
                );
              }

              return (
                <div
                  key={item.label}
                  title={`${item.label} (Coming Soon)`}
                  aria-label={`${item.label} (Coming Soon)`}
                  className="flex h-11 w-11 cursor-not-allowed items-center justify-center rounded-full text-slate-300"
                >
                  {icon}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Expand Toggle Button */}
        <div className="flex flex-col items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsDrawerOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border-[#E1E6EC] p-0 text-[#667085] transition-colors hover:bg-[#F6F8FC] hover:text-[#111827]"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 3v18" />
            </svg>
          </Button>
        </div>
      </aside>

      {/* Side Navigation Drawer / Persistent Sidebar */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Site Navigation Drawer"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#E1E6EC] bg-white shadow-2xl transition-transform duration-300 ease-in-out md:shadow-md ${
          isDrawerOpen ? 'translate-x-0' : 'pointer-events-none -translate-x-full'
        }`}
      >
        {/* Drawer Header: TL Logo + Techeniac LMS Title (Close button removed as bottom dock button controls collapse) */}
        <div className="flex h-16 items-center border-b border-[#E1E6EC] px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0044D3] text-sm font-black text-white shadow-xs">
              TL
            </div>
            <Span className="text-base font-bold tracking-tight text-[#111827]">Techeniac LMS</Span>
          </div>
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
              const icon = getNavIcon(item);

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
                    className={`flex items-center gap-3.5 rounded-full px-4 py-3.5 text-base transition-all ${
                      isActive
                        ? 'bg-blue-50/90 font-semibold text-[#0044D3] shadow-xs'
                        : 'font-medium text-[#667085] hover:bg-[#F6F8FC] hover:text-[#111827]'
                    }`}
                  >
                    <Span className={isActive ? 'text-[#0044D3]' : 'text-[#667085]'}>{icon}</Span>
                    <Span className="flex-1">{item.label}</Span>
                    {isActive ? <Span className="h-2 w-2 rounded-full bg-[#0044D3]" /> : null}
                  </Link>
                );
              }

              return (
                <div
                  key={item.label}
                  className="flex cursor-not-allowed items-center gap-3.5 rounded-full px-4 py-3.5 text-base font-medium text-slate-300"
                >
                  <Span className="text-slate-300">{icon}</Span>
                  <Span className="flex-1">{item.label}</Span>
                  <Span className="text-xs tracking-wider text-slate-400 uppercase">Soon</Span>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Dock / Collapse Button (Matching Reference Image Dock Icon) */}
        <div className="flex items-center justify-end px-5 py-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsDrawerOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full border-[#E1E6EC] p-0 text-[#667085] transition-colors hover:bg-[#F6F8FC] hover:text-[#111827]"
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
          </Button>
        </div>

        {/* Drawer Footer with Profile & Logout Actions */}
        <div className="space-y-2 border-t border-[#E1E6EC] bg-[#F6F8FC]/50 p-4">
          {user ? (
            <Link
              href={profileUrl}
              onClick={() => {
                if (typeof window !== 'undefined' && window.innerWidth < 768) {
                  setIsDrawerOpen(false);
                }
              }}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#E1E6EC] bg-white text-sm font-semibold text-[#111827] transition-colors hover:bg-slate-50 hover:text-[#0044D3]"
            >
              <ProfileNavIcon className="h-4 w-4 text-[#667085]" />
              <Span>My Profile</Span>
            </Link>
          ) : null}
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
      </aside>
    </>
  );
}
