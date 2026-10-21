'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/login');
    } catch {
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getPortalInfo = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN':
        return {
          subtitle: 'Admin Console',
          homeUrl: '/admin',
          badgeColor: 'bg-purple-100 text-purple-800',
          nav: [
            { label: 'Overview', href: '/admin', active: true },
            { label: 'Users', href: '#', active: false },
            { label: 'Batches', href: '#', active: false },
            { label: 'Curriculum', href: '#', active: false },
          ],
        };
      case 'MENTOR':
        return {
          subtitle: 'Mentor Portal',
          homeUrl: '/mentor',
          badgeColor: 'bg-emerald-100 text-emerald-800',
          nav: [
            { label: 'Dashboard', href: '/mentor', active: true },
            { label: 'My Mentees', href: '#', active: false },
            { label: 'Reviews', href: '#', active: false },
            { label: 'Courses', href: '#', active: false },
          ],
        };
      case 'MENTEE':
      default:
        return {
          subtitle: 'Learning Portal',
          homeUrl: '/mentee',
          badgeColor: 'bg-blue-100 text-blue-800',
          nav: [
            { label: 'My Learning', href: '/mentee', active: true },
            { label: 'Courses', href: '#', active: false },
            { label: 'Assignments', href: '#', active: false },
            { label: 'Progress', href: '#', active: false },
          ],
        };
    }
  };

  const portal = getPortalInfo();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href={portal.homeUrl} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white shadow-sm">
              TL
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-slate-900">Techeniac LMS</span>
              <span className="text-[10px] font-medium tracking-wider text-slate-500 uppercase">
                {portal.subtitle}
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-1 md:flex">
            {portal.nav.map((item) =>
              item.active ? (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  key={item.label}
                  className="cursor-not-allowed rounded-md px-3 py-1.5 text-xs font-medium text-slate-400"
                >
                  {item.label}
                </span>
              ),
            )}
          </nav>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="hidden flex-col text-right sm:flex">
              <span className="text-xs font-semibold text-slate-800">{user.name}</span>
              <span className="text-[10px] text-slate-500">{user.email}</span>
            </div>
          ) : null}

          {user ? (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${portal.badgeColor}`}
            >
              {user.role}
            </span>
          ) : null}

          <button
            type="button"
            onClick={() => {
              void handleLogout();
            }}
            disabled={isLoggingOut}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
          >
            {isLoggingOut ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      </div>
    </header>
  );
}
