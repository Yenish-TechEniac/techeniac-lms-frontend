'use client';

import Link from 'next/link';
import React, { useMemo, useState } from 'react';

import { BatchStatusModal } from '@/components/app/batches/BatchStatusModal';
import {
  type BatchOption,
  TransferMenteeModal,
} from '@/components/app/batches/TransferMenteeModal';
import { useAvailableBatches, useBatchDetail } from '@/hooks/useBatches';
import { type BatchStatus } from '@/lib/validation';

export interface BatchMemberItem {
  id: string;
  name: string;
  email: string;
  memberRole: 'MENTOR' | 'MENTEE';
  mappedToName?: string | undefined;
  joinedAt: string;
}

export interface AllocatedCourseItem {
  id: string;
  title: string;
  dueDate: string;
  averageProgress: number;
  status: string;
}

export interface StatusHistoryEntry {
  id: string;
  fromStatus: BatchStatus;
  toStatus: BatchStatus;
  changedBy: string;
  changedAt: string;
  reason?: string | undefined;
}

export interface BatchDetailData {
  id: string;
  name: string;
  code: string;
  status: BatchStatus;
  startDate: string;
  endDate: string;
  description?: string | undefined;
  members: BatchMemberItem[];
  courses: AllocatedCourseItem[];
  history: StatusHistoryEntry[];
}

export function BatchDashboardView({ initialBatch }: { initialBatch: BatchDetailData }) {
  const [activeTab, setActiveTab] = useState<'members' | 'courses' | 'timeline'>('members');

  // Modals state
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [menteeToTransfer, setMenteeToTransfer] = useState<{
    id: string;
    name: string;
    currentBatchId: string;
    currentBatchName: string;
  } | null>(null);

  const { data: serverBatchDetail } = useBatchDetail(initialBatch.id);
  const { data: availableBatchesList } = useAvailableBatches();

  const batch: BatchDetailData = useMemo(() => {
    if (!serverBatchDetail) return initialBatch;
    return {
      id: serverBatchDetail.id,
      name: serverBatchDetail.name,
      code: serverBatchDetail.code,
      status: serverBatchDetail.status,
      startDate: serverBatchDetail.startDate,
      endDate: serverBatchDetail.endDate,
      description: serverBatchDetail.description ?? initialBatch.description,
      members:
        serverBatchDetail.members.length > 0 ? serverBatchDetail.members : initialBatch.members,
      courses: initialBatch.courses,
      history:
        serverBatchDetail.history.length > 0 ? serverBatchDetail.history : initialBatch.history,
    };
  }, [serverBatchDetail, initialBatch]);

  const availableBatches: BatchOption[] = useMemo(() => {
    if (!availableBatchesList) return [];
    return availableBatchesList.map((b) => ({
      id: b.id,
      name: b.name,
      code: b.code,
      status: b.status,
    }));
  }, [availableBatchesList]);

  const mentees = batch.members.filter((m) => m.memberRole === 'MENTEE');
  const mentors = batch.members.filter((m) => m.memberRole === 'MENTOR');

  const handleStatusSuccess = () => {
    // TanStack Query invalidation automatically synchronizes batch state
  };

  const handleTransferSuccess = () => {
    // TanStack Query invalidation automatically synchronizes batch state
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
          <Link href="/admin/batches" className="transition-colors hover:text-blue-600">
            Batches
          </Link>
          <span>/</span>
          <span className="text-blue-600">{batch.code}</span>
        </div>

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{batch.name}</h1>
            <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 font-mono text-xs font-bold text-slate-800">
              {batch.code}
            </span>
            <span
              className={`rounded-full px-3 py-1 font-mono text-xs font-bold uppercase ${
                batch.status === 'LIVE'
                  ? 'bg-emerald-100 text-emerald-800'
                  : batch.status === 'DRAFT'
                    ? 'bg-blue-100 text-blue-800'
                    : batch.status === 'ON_HOLD'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-800'
              }`}
            >
              {batch.status}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsStatusOpen(true)}
            className="flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <span>🔄</span>
            <span>Change Status</span>
          </button>
        </div>

        <p className="mt-1 text-sm text-slate-600">
          {batch.description || 'Dedicated cohort training track.'}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            Active Mentees
          </span>
          <p className="mt-1 font-mono text-3xl font-bold text-slate-900">{mentees.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            Assigned Mentors
          </span>
          <p className="mt-1 font-mono text-3xl font-bold text-slate-900">{mentors.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            Allocated Courses
          </span>
          <p className="mt-1 font-mono text-3xl font-bold text-slate-900">{batch.courses.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            Timeline Window
          </span>
          <p className="mt-2 font-mono text-sm font-semibold text-slate-800">
            {batch.startDate} → {batch.endDate}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('members')}
          className={`border-b-2 px-4 py-3 text-sm font-bold transition-all ${
            activeTab === 'members'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Members ({batch.members.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('courses')}
          className={`border-b-2 px-4 py-3 text-sm font-bold transition-all ${
            activeTab === 'courses'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Allocated Courses ({batch.courses.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('timeline')}
          className={`border-b-2 px-4 py-3 text-sm font-bold transition-all ${
            activeTab === 'timeline'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Status Timeline ({batch.history.length})
        </button>
      </div>

      {/* Tab 1: Members */}
      {activeTab === 'members' ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <h3 className="text-sm font-bold text-slate-800">Cohort Roster</h3>
            <span className="text-xs font-medium text-slate-500">
              A mentee can belong to only 1 active cohort at a time (FR-5.2)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-slate-200/80 bg-slate-50/80 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-3">Member</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Mapped Mentor</th>
                  <th className="px-4 py-3">Enrolled Date</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {batch.members.map((m) => (
                  <tr key={m.id} className="transition-colors hover:bg-slate-50/60">
                    <td className="px-6 py-3.5">
                      <p className="font-semibold text-slate-900">{m.name}</p>
                      <p className="font-mono text-xs text-slate-500">{m.email}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 font-mono text-[11px] font-bold ${
                          m.memberRole === 'MENTOR'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {m.memberRole}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-700">
                      {m.memberRole === 'MENTEE' ? m.mappedToName || 'Unmapped' : '—'}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{m.joinedAt}</td>
                    <td className="px-6 py-3.5 text-right">
                      {m.memberRole === 'MENTEE' ? (
                        <button
                          type="button"
                          onClick={() =>
                            setMenteeToTransfer({
                              id: m.id,
                              name: m.name,
                              currentBatchId: batch.id,
                              currentBatchName: batch.name,
                            })
                          }
                          className="rounded-lg px-2.5 py-1 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50"
                        >
                          Transfer
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* Tab 2: Courses */}
      {activeTab === 'courses' ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-slate-200/80 bg-slate-50/80 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-3">Course</th>
                  <th className="px-4 py-3">Target Due Date</th>
                  <th className="px-4 py-3">Cohort Avg Progress</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {batch.courses.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-slate-50/60">
                    <td className="px-6 py-4 font-semibold text-slate-900">{c.title}</td>
                    <td className="px-4 py-4 font-mono text-xs text-slate-600">{c.dueDate}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{ width: `${c.averageProgress}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-700">
                          {c.averageProgress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-mono text-xs font-medium text-emerald-700">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* Tab 3: Timeline */}
      {activeTab === 'timeline' ? (
        <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900">Batch Status Transition Timeline</h3>
          <div className="relative space-y-6 pl-6 before:absolute before:top-2 before:bottom-2 before:left-2.5 before:w-0.5 before:bg-slate-200">
            {batch.history.map((h) => (
              <div key={h.id} className="relative">
                <span className="absolute top-1 -left-6 h-3.5 w-3.5 rounded-full bg-blue-600 ring-4 ring-white" />
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-slate-800">
                    {h.fromStatus} → {h.toStatus}
                  </span>
                  <span className="font-mono text-xs text-slate-400">{h.changedAt}</span>
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  By <span className="font-semibold text-slate-800">{h.changedBy}</span>
                  {h.reason ? ` — "${h.reason}"` : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Modals */}
      <BatchStatusModal
        batchId={batch.id}
        batchName={batch.name}
        currentStatus={batch.status}
        isOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        onSuccess={handleStatusSuccess}
      />

      <TransferMenteeModal
        mentee={menteeToTransfer}
        availableBatches={availableBatches}
        isOpen={Boolean(menteeToTransfer)}
        onClose={() => setMenteeToTransfer(null)}
        onSuccess={handleTransferSuccess}
      />
    </div>
  );
}
