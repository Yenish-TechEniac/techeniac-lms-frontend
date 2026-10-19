'use client';

import React, { useMemo, useState } from 'react';

import { AuditDetailModal, type AuditLogEntry } from '@/components/app/audit/AuditDetailModal';
import { type AuditType } from '@/lib/validation';

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
    createdAt: '2026-10-19 14:32:08 UTC',
    oldValue: { role: 'MENTEE', status: 'ACTIVE', batchId: 'FE-25Q1' },
    newValue: { role: 'MENTOR', status: 'ACTIVE', batchId: null },
  },
  {
    id: 'aud-1091',
    type: 'AUTH',
    actorId: 'usr-4',
    actorName: 'Marcus Brody',
    actorRole: 'MENTEE',
    entity: 'Session',
    entityId: 'ses-8821',
    action: 'LOGIN_SUCCESS',
    summary: 'Successful JWT authentication from client IP 192.168.1.42.',
    createdAt: '2026-10-19 13:15:22 UTC',
    oldValue: null,
    newValue: { tokenVersion: 1, method: 'PASSWORD' },
  },
  {
    id: 'aud-1090',
    type: 'BATCH',
    actorId: 'usr-1',
    actorName: 'Devon Vance',
    actorRole: 'SUPER_ADMIN',
    entity: 'Batch',
    entityId: 'batch-FE-25Q1',
    action: 'STATUS_CHANGE',
    summary: 'Transitioned batch status from DRAFT to LIVE.',
    createdAt: '2026-10-19 11:00:00 UTC',
    oldValue: { status: 'DRAFT' },
    newValue: { status: 'LIVE', liveAt: '2026-10-19T11:00:00Z' },
  },
  {
    id: 'aud-1089',
    type: 'COURSE',
    actorId: 'usr-2',
    actorName: 'Alex Chen',
    actorRole: 'MENTOR',
    entity: 'Course',
    entityId: 'crs-901',
    action: 'TOPIC_EDIT',
    summary: 'Live updated topic title: "Git & GitHub Workflow". Recalculated 12 allocations.',
    createdAt: '2026-10-19 09:44:12 UTC',
    oldValue: { title: 'Git Workflow' },
    newValue: { title: 'Git & GitHub Workflow' },
  },
  {
    id: 'aud-1088',
    type: 'COURSE_ALLOCATION',
    actorId: 'usr-1',
    actorName: 'Devon Vance',
    actorRole: 'SUPER_ADMIN',
    entity: 'CourseAllocation',
    entityId: 'alc-4410',
    action: 'ALLOCATE_BATCH',
    summary: 'Allocated "Distributed Systems Core" to batch FE-25Q1 (14 mentees).',
    createdAt: '2026-10-18 16:20:00 UTC',
    oldValue: null,
    newValue: { courseId: 'crs-101', batchId: 'FE-25Q1', menteeCount: 14 },
  },
  {
    id: 'aud-1087',
    type: 'GRADING',
    actorId: 'usr-2',
    actorName: 'Alex Chen',
    actorRole: 'MENTOR',
    entity: 'Submission',
    entityId: 'sub-771',
    action: 'GRADE_SUBMITTED',
    summary: 'Graded submission for assignment "Branching Model": 92/100 (Grade A).',
    createdAt: '2026-10-18 15:10:45 UTC',
    oldValue: { status: 'SUBMITTED', marks: null },
    newValue: { status: 'GRADED', marks: 92, gradeLabel: 'A' },
  },
  {
    id: 'aud-1086',
    type: 'AUTH',
    actorId: 'anonymous',
    actorName: 'Unknown Client',
    actorRole: 'ANONYMOUS',
    entity: 'AuthThrottle',
    entityId: 'ip-10.0.4.12',
    action: 'FAILED_LOGIN',
    summary: 'Failed login attempt for email "wrong@company.com" (invalid password).',
    createdAt: '2026-10-18 14:02:11 UTC',
    oldValue: null,
    newValue: { reason: 'INVALID_CREDENTIALS' },
  },
];

export function AuditLogTable() {
  const [logs] = useState<AuditLogEntry[]>(INITIAL_LOGS);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [activeModalEntry, setActiveModalEntry] = useState<AuditLogEntry | null>(null);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.actorName.toLowerCase().includes(search.toLowerCase()) ||
        log.entity.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.summary.toLowerCase().includes(search.toLowerCase());
      const matchesType = selectedType === 'ALL' || log.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [logs, search, selectedType]);

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
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'USER':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'BATCH':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COURSE':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'COURSE_ALLOCATION':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'SUBMISSION':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'GRADING':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'MENTOR_MAPPING':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
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
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Audit Log</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 font-mono text-xs font-medium text-slate-700">
              🔒 Read-only Ledger
            </span>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Append-only chronological record of security events, administrative changes, and state
            transitions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 font-mono text-xs text-slate-600 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Integrity Verified</span>
          </div>
          <button
            type="button"
            onClick={handleExport}
            className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <span>📥</span>
            <span>Export Log</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        {/* Type Quick Selector */}
        <div className="flex scrollbar-none items-center gap-1.5 overflow-x-auto pb-2 text-xs font-semibold">
          {[
            'ALL',
            'AUTH',
            'USER',
            'BATCH',
            'COURSE',
            'COURSE_ALLOCATION',
            'GRADING',
            'MENTOR_MAPPING',
          ].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
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

        {/* Search input */}
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <div className="relative w-full flex-1">
            <span className="absolute top-2.5 left-3.5 text-sm text-slate-400">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by actor, entity, action, or summary..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pr-3 pl-9 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>
          {search || selectedType !== 'ALL' ? (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedType('ALL');
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
                <th className="px-6 py-3.5">Timestamp (UTC)</th>
                <th className="px-4 py-3.5">Type</th>
                <th className="px-4 py-3.5">Actor</th>
                <th className="px-4 py-3.5">Target Entity</th>
                <th className="px-4 py-3.5">Action</th>
                <th className="px-4 py-3.5">Summary</th>
                <th className="px-6 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No audit records match your filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  return (
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
                          <span className="text-slate-400">#{log.entityId}</span>
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AuditDetailModal
        entry={activeModalEntry}
        isOpen={Boolean(activeModalEntry)}
        onClose={() => setActiveModalEntry(null)}
      />
    </div>
  );
}
