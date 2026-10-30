'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

import { ConfirmationModal } from '@/components/patterns/ConfirmationModal';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
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
  readonly title?: string;
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

interface NavIconDef {
  keywords: readonly string[];
  path: React.ReactNode;
}

const NAV_ICON_DEFS: readonly NavIconDef[] = [
  {
    keywords: ['overview', 'dashboard', 'learning'],
    path: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    ),
  },
  {
    keywords: ['user', 'mentee'],
    path: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    ),
  },
  {
    keywords: ['batch'],
    path: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    ),
  },
  {
    keywords: ['course', 'curriculum'],
    path: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    ),
  },
  {
    keywords: ['allocation'],
    path: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
      />
    ),
  },
  {
    keywords: ['assignment', 'submission', 'review'],
    path: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    ),
  },
  {
    keywords: ['performance', 'analytic', 'metric'],
    path: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
      />
    ),
  },
  {
    keywords: ['progress', 'tracker'],
    path: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    ),
  },
];

function getNavIcon(itemOrLabel: HeaderNavItem | string) {
  const key = typeof itemOrLabel === 'string' ? itemOrLabel : itemOrLabel.icon || itemOrLabel.label;
  const normalized = key.toLowerCase();
  const matched = NAV_ICON_DEFS.find((def) => def.keywords.some((kw) => normalized.includes(kw)));

  return (
    <svg
      className="h-5 w-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      {matched ? (
        matched.path
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 5l7 7-7 7" />
      )}
    </svg>
  );
}

export function Header({ title, homeUrl = '/', nav = [] }: Readonly<HeaderProps>) {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [isSignOutConfirmOpen, setIsSignOutConfirmOpen] = useState(false);

  // Side Drawer State managed by SidebarContext
  const { isDrawerOpen, setIsDrawerOpen, isMobileNavOpen, setIsMobileNavOpen, contentMarginClass } =
    useSidebar();
  const profileDropdownRef = useRef<HTMLDivElement | null>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    }
    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  // Handle escape key for drawer and dropdown
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMobileNavOpen(false);
        setIsDrawerOpen(false);
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [setIsDrawerOpen, setIsMobileNavOpen]);

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
  const panelTitle = (() => {
    if (user?.role === 'SUPER_ADMIN') return 'ADMIN PANEL';
    if (user?.role === 'MENTOR') return 'MENTOR PANEL';
    if (user?.role === 'MENTEE') return 'MENTEE PANEL';
    return 'ADMIN PANEL';
  })();

  const activeNavItem = nav.find((item) => item.active);
  const navbarTitle =
    title ||
    (activeNavItem
      ? activeNavItem.label === 'Overview'
        ? 'Dashboard'
        : activeNavItem.label
      : 'Dashboard');

  return (
    <>
      {/* Top Sticky Navbar Header (Responsive for Desktop & Mobile) */}
      <header
        className={`sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#E1E6EC] bg-white px-6 transition-all duration-300 sm:px-8 ${contentMarginClass}`}
      >
        <div className="flex items-center gap-3">
          {/* Mobile hamburger menu toggle */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileNavOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl p-0 text-slate-700 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#0044D3] md:hidden"
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

          {/* Page Title */}
          <Span className="text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">
            {navbarTitle}
          </Span>
        </div>

        {/* Right side: Error alert and User Profile Pill Dropdown */}
        <div className="flex items-center gap-3">
          {logoutError ? (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700"
            >
              <Span>{logoutError}</Span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setLogoutError(null)}
                className="h-5 w-5 p-0 font-bold text-red-500 hover:text-red-800"
                aria-label="Dismiss error"
              >
                ×
              </Button>
            </div>
          ) : null}

          <div className="relative" ref={profileDropdownRef}>
            {isLoading || !user ? (
              <div
                className="flex items-center gap-2.5 rounded-full border border-[#E1E6EC] bg-white py-1.5 pr-3.5 pl-1.5 shadow-2xs"
                aria-label="Loading profile"
              >
                <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                <div className="hidden space-y-1.5 text-left sm:block">
                  <Skeleton className="h-3.5 w-20 rounded-md" />
                  <Skeleton className="h-2.5 w-14 rounded-md" />
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                aria-expanded={isProfileDropdownOpen}
                aria-haspopup="true"
                className="flex items-center gap-2.5 rounded-full border border-[#E1E6EC] bg-white py-1.5 pr-3.5 pl-1.5 shadow-2xs transition-all hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#0044D3] focus-visible:outline-none"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0B7A9E] text-base font-bold text-white shadow-xs">
                  {userInitials}
                </div>
                <div className="hidden text-left sm:block">
                  <Span className="block truncate text-sm leading-tight font-bold text-[#111827]">
                    {user.name}
                  </Span>
                  <Span className="block truncate text-xs leading-tight font-medium text-[#667085]">
                    {formattedRole}
                  </Span>
                </div>
                <svg
                  className={`h-4 w-4 text-[#667085] transition-transform duration-200 ${
                    isProfileDropdownOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}

            {/* Profile Dropdown Menu */}
            {!isLoading && user && isProfileDropdownOpen && (
              <div
                role="menu"
                className="animate-in fade-in slide-in-from-top-2 absolute right-0 z-50 mt-2 w-48 rounded-2xl border border-[#E1E6EC] bg-white p-1.5 shadow-lg duration-150"
              >
                <Link
                  href={user?.role === 'SUPER_ADMIN' && user?.id ? `/admin/users/${user.id}` : '#'}
                  onClick={() => setIsProfileDropdownOpen(false)}
                  role="menuitem"
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#111827] transition-colors hover:bg-slate-50"
                >
                  <svg
                    className="h-4 w-4 text-[#111827]"
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
                  <Span>Profile</Span>
                </Link>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    setIsSignOutConfirmOpen(true);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#D92D20] transition-colors hover:bg-red-50"
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
            )}
          </div>
        </div>
      </header>

      {/* Mobile & Tablet Backdrop Overlay (< lg) */}
      <div
        onClick={() => setIsMobileNavOpen(false)}
        className={`backdrop-blur-2xs fixed inset-0 z-40 bg-slate-900/30 transition-opacity duration-300 lg:hidden ${
          isMobileNavOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden="true"
      />

      {/* Collapsed Side Navigation Rail (Icon Rail matching LeadNest Figma design) */}
      <aside
        aria-label="Collapsed Navigation Rail"
        className={`fixed inset-y-0 left-0 z-40 hidden w-20 flex-col items-center justify-between border-r border-[#E1E6EC] bg-white py-5 transition-all duration-300 md:flex ${
          isDrawerOpen
            ? 'lg:pointer-events-none lg:-translate-x-full lg:opacity-0'
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
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0044D3] text-base font-black text-white shadow-xs transition-transform group-hover:scale-105">
              TL
            </div>
          </Link>

          {/* Icon Nav List directly below logo */}
          <nav className="flex flex-col items-center space-y-3" aria-label="Quick Navigation">
            {isLoading || nav.length === 0
              ? Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={`rail-skel-${i}`} className="h-11 w-11 rounded-full" />
                ))
              : nav.map((item) => {
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

        {/* Bottom: User Avatar + Expand Toggle Button */}
        <div className="flex flex-col items-center gap-3 pb-2">
          {isLoading || !user ? (
            <Skeleton className="h-10 w-10 rounded-full" />
          ) : (
            <div
              title={`${user.name} (${formattedRole})`}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0044D3] text-xs font-bold text-white shadow-xs"
            >
              {userInitials}
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                setIsMobileNavOpen(true);
              } else {
                setIsDrawerOpen(true);
              }
            }}
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
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#E1E6EC] bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:shadow-md ${
          isMobileNavOpen ? 'translate-x-0' : 'pointer-events-none -translate-x-full'
        } ${
          isDrawerOpen
            ? 'lg:pointer-events-auto lg:translate-x-0'
            : 'lg:pointer-events-none lg:-translate-x-full'
        }`}
      >
        {/* Drawer Header: TL Logo + Techeniac LMS Title + Mobile/Tablet Close Button */}
        <div className="flex h-20 items-center justify-between border-b border-[#E1E6EC] px-6">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0044D3] text-base font-black text-white shadow-xs">
              TL
            </div>
            <Span className="text-xl font-bold tracking-tight text-[#111827]">Techeniac LMS</Span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileNavOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full p-0 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close navigation menu"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Navigation Category Label (Matching LeadNest Reference) */}
        <div className="px-5 pt-5 pb-2">
          {isLoading || !user ? (
            <Skeleton className="h-3.5 w-24 rounded-md" />
          ) : (
            <Span className="font-mono text-xs font-bold tracking-wider text-[#667085] uppercase">
              {panelTitle}
            </Span>
          )}
        </div>

        {/* Navigation List with Generous Spacing (Matching Reference) */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <nav className="flex flex-col space-y-2" aria-label="Portal Navigation Links">
            {isLoading || nav.length === 0
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={`drawer-skel-${i}`}
                    className="flex items-center gap-3.5 rounded-full px-4 py-3.5"
                  >
                    <Skeleton className="h-5 w-5 shrink-0 rounded-md" />
                    <Skeleton className="h-4 flex-1 rounded-md" />
                  </div>
                ))
              : nav.map((item) => {
                  const isActive = Boolean(item.active);
                  const icon = getNavIcon(item);

                  if (item.href !== '#') {
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => {
                          if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                            setIsMobileNavOpen(false);
                          }
                        }}
                        className={`flex items-center gap-3.5 rounded-full px-4 py-3.5 text-base transition-all ${
                          isActive
                            ? 'bg-blue-50/90 font-semibold text-[#0044D3] shadow-xs'
                            : 'font-medium text-[#667085] hover:bg-[#F6F8FC] hover:text-[#111827]'
                        }`}
                      >
                        <Span className={isActive ? 'text-[#0044D3]' : 'text-[#667085]'}>
                          {icon}
                        </Span>
                        <Span className="flex-1">{item.label}</Span>
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

      {/* Confirmation Modal before Sign Out */}
      <ConfirmationModal
        isOpen={isSignOutConfirmOpen}
        onClose={() => setIsSignOutConfirmOpen(false)}
        onConfirm={handleLogout}
        title="Sign Out?"
        description="Are you sure you want to sign out of Techeniac LMS? You will need to log in again to access your account."
        confirmLabel="Sign Out"
        confirmVariant="danger"
        isLoading={isLoggingOut}
        errorMessage={logoutError}
      />
    </>
  );
}
