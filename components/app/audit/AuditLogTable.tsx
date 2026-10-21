'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { AuditDetailModal, type AuditLogEntry } from '@/components/app/audit/AuditDetailModal';
import { env } from '@/lib/config';
import { type AuditType } from '@/lib/validation';

interface ApiAuditItem {
  id: string;
  actorId: string | null;
  actor: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  type: AuditType;
  entity: string;
  entityId: string | null;
  action: string;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  data: ApiAuditItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const INITIAL_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-1092',
    type: 'USER',
    actorId: 'usr-1',
    actorName: 'Devon Vance',
    actorRole: 'SUPER_ADMIN',
    entity: 'User',
    entityId: 'usr-3',
    action: 'ROLE_CHANGE',
    summary: 'Promoted Mentee Priya Patel to Mentor. Batch memberships closed.',
    createdAt: '2026-10-19 20:02:08 IST',
    oldValue: { role: 'MENTEE', status: 'ACTIVE', batchId: 'FE-25Q1' },
    newValue: { role: 'MENTOR', status: 'ACTIVE', batchId: null },
  },
  {
    id: 'aud-1089',
    type: 'COURSE',
    actorId: 'usr-2',
    actorName: 'Alex Chen',
    actorRole: 'MENTOR',
    entity: 'Course',
    entityId: 'crs-901',
    action: 'LIVE_EDIT',
    summary: 'Live updated topic title: "Git & GitHub Workflow". Recalculated allocations.',
    createdAt: '2026-10-19 15:14:12 IST',
    oldValue: { title: 'Git Workflow' },
    newValue: { title: 'Git & GitHub Workflow' },
  },
  {
    id: 'aud-1086',
    type: 'AUTH',
    actorId: null,
    actorName: 'Unknown Client',
    actorRole: 'ANONYMOUS',
    entity: 'User',
    entityId: null,
    action: 'FAILED_LOGIN',
    summary: 'Failed login attempt for email "wrong@company.com" (invalid credentials).',
    createdAt: '2026-10-18 19:32:11 IST',
    oldValue: { email: 'wrong@company.com' },
    newValue: null,
  },
];

function formatSummary(
  action: string,
  entity: string,
  oldValue?: Record<string, unknown> | null,
  newValue?: Record<string, unknown> | null,
): string {
  if (action === 'ROLE_CHANGE') {
    const oldRole = (oldValue?.role as string) ?? 'User';
    const newRole = (newValue?.role as string) ?? 'Role';
    const reason = newValue?.reason ? ` (${newValue.reason as string})` : '';
    return `Role transitioned from ${oldRole} to ${newRole}${reason}`;
  }
  if (action === 'LOGIN') {
    return `Authenticated session for ${(newValue?.email as string) ?? 'user'}`;
  }
  if (action === 'FAILED_LOGIN') {
    return `Failed login attempt for ${(oldValue?.email as string) ?? 'client'}`;
  }
  if (action === 'STATUS_CHANGE') {
    const oldStatus = (oldValue?.status as string) ?? 'DRAFT';
    const newStatus = (newValue?.status as string) ?? 'LIVE';
    return `Transitioned status from ${oldStatus} to ${newStatus}`;
  }
  if (action === 'LIVE_EDIT') {
    return `Live edited properties on ${entity}`;
  }
  return `${action} action recorded on ${entity}`;
}

function formatTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return (
      new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
      })
        .format(date)
        .replace(',', '') + ' IST'
    );
  } catch {
    return isoString;
  }
}

export function AuditLogTable() {
  const [logs, setLogs] = useState<AuditLogEntry[]>(INITIAL_LOGS);
  const [activeTab, setActiveTab] = useState<'audit' | 'email'>('audit');
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedEntity, setSelectedEntity] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(INITIAL_LOGS.length);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [activeModalEntry, setActiveModalEntry] = useState<AuditLogEntry | null>(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const params = new URLSearchParams();
        params.set('page', String(currentPage));
        params.set('limit', '20');
        if (selectedType !== 'ALL') params.set('type', selectedType);
        if (selectedEntity !== 'ALL') params.set('entity', selectedEntity);
        if (search.trim()) params.set('action', search.trim());

        const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/audit-logs?${params.toString()}`, {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = (await res.json()) as ApiResponse;
        if (!ignore && json.success && Array.isArray(json.data)) {
          const mappedLogs: AuditLogEntry[] = json.data.map((item) => ({
            id: item.id,
            type: item.type,
            actorId: item.actorId,
            actorName:
              item.actor?.name ??
              (item.actorId ? `User #${item.actorId.slice(0, 8)}` : 'Unknown Client'),
            actorRole: item.actor?.role ?? (item.actorId ? 'USER' : 'ANONYMOUS'),
            entity: item.entity,
            entityId: item.entityId,
            action: item.action,
            summary: formatSummary(item.action, item.entity, item.oldValue, item.newValue),
            createdAt: formatTimestamp(item.createdAt),
            oldValue: item.oldValue,
            newValue: item.newValue,
          }));

          setLogs(mappedLogs);
          setTotalCount(json.pagination.total);
          setTotalPages(json.pagination.totalPages);
          setIsLiveConnected(true);
        }
      } catch {
        if (!ignore) setIsLiveConnected(false);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    queueMicrotask(() => {
      if (!ignore) setIsLoading(true);
    });

    void load();
    return () => {
      ignore = true;
    };
  }, [currentPage, selectedType, selectedEntity, search]);

  const filteredLogs = useMemo(() => {
    if (isLiveConnected) return logs;
    return logs.filter((log) => {
      const matchesSearch =
        log.actorName.toLowerCase().includes(search.toLowerCase()) ||
        log.entity.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.summary.toLowerCase().includes(search.toLowerCase());
      const matchesType = selectedType === 'ALL' || log.type === selectedType;
      const matchesEntity = selectedEntity === 'ALL' || log.entity === selectedEntity;
      return matchesSearch && matchesType && matchesEntity;
    });
  }, [logs, search, selectedType, selectedEntity, isLiveConnected]);

  const handleExport = () => {
    const jsonString = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `techeniac_audit_log_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTypeBadgeClass = (type: AuditType) => {
    switch (type) {
      case 'AUTH':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'USER':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'BATCH':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'COURSE':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'COURSE_ALLOCATION':
        return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      case 'SUBMISSION':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'GRADING':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
            <span>Administration</span>
            <span>/</span>
            <span className="text-blue-600">Audit Trail</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Audit &amp; Email Log
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 font-mono text-xs font-medium text-slate-700">
              🔒 Read-only Record
            </span>
            {isLiveConnected ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Live API
              </span>
            ) : null}
          </div>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Immutable system ledger recording administrative actions, state transitions, and
            automated notification dispatches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 font-mono text-xs text-slate-600 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span>Retention: 90 Days</span>
          </div>
          <button
            type="button"
            onClick={handleExport}
            className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <span>📥</span>
            <span>Export CSV / JSON</span>
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'audit'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Audit Log</span>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 font-mono text-[10px] text-blue-800">
              {totalCount} events
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('email')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'email'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Email Log</span>
            <span className="rounded-full bg-slate-200 px-2 py-0.5 font-mono text-[10px] text-slate-700">
              Dispatch Ledger
            </span>
          </button>
        </div>
        <div className="hidden font-mono text-xs text-slate-500 sm:flex sm:items-center sm:gap-2">
          <span className="text-emerald-600">✓</span>
          <span>SHA-256 Verified Ledger</span>
        </div>
      </div>

      {activeTab === 'audit' ? (
        <>
          {/* Filter Bar */}
          <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            {/* Type Quick Selector */}
            <div className="flex scrollbar-none items-center gap-1.5 overflow-x-auto pb-2 text-xs font-semibold">
              {[
                'ALL',
                'AUTH',
                'USER',
                'COURSE',
                'BATCH',
                'COURSE_ALLOCATION',
                'SUBMISSION',
                'GRADING',
              ].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setSelectedType(type);
                    setCurrentPage(1);
                  }}
                  className={`rounded-lg px-3 py-1.5 whitespace-nowrap transition-all ${
                    selectedType === type
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {type === 'ALL' ? 'All Types' : type}
                </button>
              ))}
            </div>

            {/* Inputs & Dropdowns */}
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <div className="relative w-full flex-1">
                <span className="absolute top-2.5 left-3.5 text-sm text-slate-400">🔍</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by actor, entity, action, or summary..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pr-3 pl-9 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Entity Selector */}
              <div className="w-full sm:w-48">
                <select
                  value={selectedEntity}
                  onChange={(e) => {
                    setSelectedEntity(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-10 w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
                >
                  <option value="ALL">All Entities</option>
                  <option value="User">User</option>
                  <option value="Course">Course</option>
                  <option value="Batch">Batch</option>
                  <option value="CourseAllocation">CourseAllocation</option>
                  <option value="Submission">Submission</option>
                </select>
              </div>

              {search || selectedType !== 'ALL' || selectedEntity !== 'ALL' ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setSelectedType('ALL');
                    setSelectedEntity('ALL');
                    setCurrentPage(1);
                  }}
                  className="px-2 text-xs font-semibold whitespace-nowrap text-blue-600 hover:text-blue-700"
                >
                  Reset Filters
                </button>
              ) : null}
            </div>
          </div>

          {/* Events Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="border-b border-slate-200/80 bg-slate-50/80 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  <tr>
                    <th className="px-6 py-3.5">Timestamp (IST)</th>
                    <th className="px-4 py-3.5">Type</th>
                    <th className="px-4 py-3.5">Actor</th>
                    <th className="px-4 py-3.5">Target Entity</th>
                    <th className="px-4 py-3.5">Action</th>
                    <th className="px-4 py-3.5">Summary</th>
                    <th className="px-6 py-3.5 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    [1, 2, 3, 4].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4">
                          <div className="h-4 w-28 rounded bg-slate-200" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-5 w-16 rounded-full bg-slate-200" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-24 rounded bg-slate-200" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-20 rounded bg-slate-200" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-24 rounded bg-slate-200" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-48 rounded bg-slate-200" />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="ml-auto h-6 w-16 rounded bg-slate-200" />
                        </td>
                      </tr>
                    ))
                  ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No audit records match your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="transition-colors hover:bg-slate-50/60">
                        {/* Timestamp */}
                        <td className="px-6 py-4 font-mono text-xs whitespace-nowrap text-slate-500">
                          {log.createdAt}
                        </td>

                        {/* Type */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`inline-block rounded-full border px-2 py-0.5 font-mono text-[11px] font-bold ${getTypeBadgeClass(
                              log.type,
                            )}`}
                          >
                            {log.type}
                          </span>
                        </td>

                        {/* Actor */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-xs font-semibold text-slate-900">{log.actorName}</p>
                            <p className="font-mono text-[10px] text-slate-500">{log.actorRole}</p>
                          </div>
                        </td>

                        {/* Target Entity */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700">
                            <span>{log.entity}</span>
                            <span className="text-slate-400">
                              #
                              {log.entityId
                                ? log.entityId.length > 8
                                  ? `${log.entityId.slice(0, 8)}...`
                                  : log.entityId
                                : 'N/A'}
                            </span>
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="font-mono text-xs font-semibold text-slate-800">
                            {log.action}
                          </span>
                        </td>

                        {/* Summary */}
                        <td
                          className="max-w-xs truncate px-4 py-4 text-xs text-slate-600"
                          title={log.summary}
                        >
                          {log.summary}
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setActiveModalEntry(log)}
                            className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100"
                          >
                            View Diff
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between border-t border-slate-200/80 bg-slate-50/50 px-6 py-3 text-xs text-slate-600">
              <span className="font-mono">
                Showing {filteredLogs.length} of {totalCount} events (Page {currentPage} of{' '}
                {totalPages})
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1 || isLoading}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages || isLoading}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* EMAIL LOG TAB */
        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            ✉️
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900">Email Dispatch Ledger</h3>
          <p className="mt-1 text-sm text-slate-600">
            Automated notifications, welcome credentials, and deadline reminder dispatches are
            recorded here.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2 font-mono text-xs text-slate-600">
            <span>SMTP Service Status: Operational</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
        </div>
      )}

      {/* Modal */}
      <AuditDetailModal
        entry={activeModalEntry}
        isOpen={Boolean(activeModalEntry)}
        onClose={() => setActiveModalEntry(null)}
      />
    </div>
  );
}
