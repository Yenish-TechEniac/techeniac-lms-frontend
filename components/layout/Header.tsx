'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { ConfirmationModal } from '@/components/patterns/ConfirmationModal';
import { Button } from '@/components/ui/Button';
import { Span } from '@/components/ui/Typography';
import { useSidebar } from '@/context/SidebarContext';
import { useAuth } from '@/hooks/useAuth';
import { formatRoleLabel } from '@/lib/roles';

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
  if (
    normalized.includes('performance') ||
    normalized.includes('analytic') ||
    normalized.includes('metric')
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
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
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
  const [isSignOutConfirmOpen, setIsSignOutConfirmOpen] = useState(false);

  // Side Drawer State managed by SidebarContext
  const { isDrawerOpen, setIsDrawerOpen, isMobileNavOpen, setIsMobileNavOpen } = useSidebar();

  // Handle escape key for drawer
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMobileNavOpen(false);
        setIsDrawerOpen(false);
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

  return (
    <>
      {/* Mobile-Only Header (< md) with Hamburger Menu & Logo */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileNavOpen(true)}
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
            <Span className="text-base font-bold tracking-tight text-slate-900">Techeniac LMS</Span>
          </Link>
        </div>

        {logoutError ? (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700"
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

        {/* Bottom: User Avatar + Expand Toggle Button */}
        <div className="flex flex-col items-center gap-3 pb-2">
          {user ? (
            <div
              title={`${user.name} (${formattedRole})`}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0044D3] text-xs font-bold text-white shadow-xs"
            >
              {userInitials}
            </div>
          ) : null}
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
        <div className="flex h-16 items-center justify-between border-b border-[#E1E6EC] px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0044D3] text-sm font-black text-white shadow-xs">
              TL
            </div>
            <Span className="text-base font-bold tracking-tight text-[#111827]">Techeniac LMS</Span>
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
          <Span className="font-mono text-xs font-bold tracking-wider text-[#667085] uppercase">
            {panelTitle}
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

        {/* Drawer Footer with User Profile and Logout */}
        <div className="space-y-3 border-t border-[#E1E6EC] bg-[#F6F8FC]/50 p-4">
          {user ? (
            <div className="flex items-center gap-3 rounded-2xl border border-[#E1E6EC] bg-white p-2.5 shadow-xs">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0044D3] text-sm font-bold text-white shadow-xs">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <Span className="block truncate text-sm font-bold text-[#111827]">{user.name}</Span>
                <Span className="block truncate text-xs font-semibold text-[#667085]">
                  {formattedRole}
                </Span>
              </div>
            </div>
          ) : null}

          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => {
              setIsSignOutConfirmOpen(true);
            }}
            disabled={isLoggingOut}
            className="h-11 w-full justify-center gap-2 rounded-full border-[#E1E6EC] bg-white text-sm font-semibold text-[#667085] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-[#D92D20]"
          >
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
            <Span>Sign Out</Span>
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
      />
    </>
  );
}
