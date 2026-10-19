import type { Metadata } from 'next';

import { AuditLogTable } from '@/components/app/audit/AuditLogTable';

export const metadata: Metadata = {
  title: 'Audit Log | Techeniac LMS',
  description:
    'Immutable system audit ledger recording all administrative, state, and security actions.',
};

export default function AdminAuditLogsPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        <AuditLogTable />
      </div>
    </div>
  );
}
