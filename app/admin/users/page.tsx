import type { Metadata } from 'next';

import { ADMIN_USERS_NAV } from '@/components/app/navigation/portal-nav.config';
import { UsersTable } from '@/components/app/users/UsersTable';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'Users Management | Techeniac LMS',
  description: 'Manage platform users, roles, batch enrollments, and access status.',
};

export default function AdminUsersPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header {...ADMIN_USERS_NAV} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <UsersTable />
      </main>
    </div>
  );
}
