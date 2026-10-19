import type { Metadata } from 'next';

import { UsersTable } from '@/components/app/users/UsersTable';

export const metadata: Metadata = {
  title: 'Users Management | Techeniac LMS',
  description: 'Manage platform users, roles, batch enrollments, and access status.',
};

export default function AdminUsersPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        <UsersTable />
      </div>
    </div>
  );
}
