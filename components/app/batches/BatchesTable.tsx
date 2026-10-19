'use client';

import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';

import { CreateBatchModal } from '@/components/app/batches/CreateBatchModal';
import { env } from '@/lib/config';
import { type BatchStatus } from '@/lib/validation';

export interface BatchSummaryItem {
  id: string;
  name: string;
  code: string;
  status: BatchStatus;
  startDate: string;
  endDate: string;
  menteesCount: number;
  mentorsCount: number;
  coursesCount: number;
  progressPercent: number;
}

const INITIAL_BATCHES: BatchSummaryItem[] = [
  {
    id: 'batch-1',
    name: 'Frontend Engineering 2025 Q1',
    code: 'FE-25Q1',
    status: 'LIVE',
    startDate: '2025-01-15',
    endDate: '2025-06-30',
    menteesCount: 16,
    mentorsCount: 2,
    coursesCount: 4,
    progressPercent: 48,
  },
  {
    id: 'batch-2',
    name: 'Cloud & Systems Batch B',
    code: 'CS-24B4',
    status: 'LIVE',
    startDate: '2024-11-01',
    endDate: '2025-04-30',
    menteesCount: 12,
    mentorsCount: 2,
    coursesCount: 3,
    progressPercent: 72,
  },
  {
    id: 'batch-3',
    name: 'Platform Architecture 2025',
    code: 'PA-25A1',
    status: 'DRAFT',
    startDate: '2025-03-01',
    endDate: '2025-08-31',
    menteesCount: 0,
    mentorsCount: 1,
    coursesCount: 2,
    progressPercent: 0,
  },
  {
    id: 'batch-4',
    name: 'Fullstack Systems 2024 Winter',
    code: 'FS-24W1',
    status: 'COMPLETED',
    startDate: '2024-06-01',
    endDate: '2024-12-15',
    menteesCount: 20,
    mentorsCount: 3,
    coursesCount: 5,
    progressPercent: 100,
  },
];

export function BatchesTable() {
  const [batches, setBatches] = useState<BatchSummaryItem[]>(INITIAL_BATCHES);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const params = new URLSearchParams();
        if (selectedStatus !== 'ALL') params.set('status', selectedStatus);
        if (search.trim()) params.set('search', search.trim());
        params.set('limit', '50');

        const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/batches?${params.toString()}`, {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = (await res.json()) as {
          success: boolean;
          data: Array<{
            id: string;
            name: string;
            code: string;
            status: BatchStatus;
            startDate: string;
            endDate: string;
            menteesCount?: number;
            mentorsCount?: number;
            coursesCount?: number;
            progressPercent?: number;
          }>;
        };

        if (!ignore && json.success && Array.isArray(json.data)) {
          const mapped: BatchSummaryItem[] = json.data.map((b) => ({
            id: b.id,
            name: b.name,
            code: b.code,
            status: b.status,
            startDate: b.startDate,
            endDate: b.endDate,
            menteesCount: b.menteesCount ?? 0,
            mentorsCount: b.mentorsCount ?? 0,
            coursesCount: b.coursesCount ?? 0,
            progressPercent: b.progressPercent ?? 0,
          }));
          setBatches(mapped);
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
  }, [search, selectedStatus, refreshKey]);

  const filteredBatches = useMemo(() => {
    if (isLiveConnected) return batches;
    return batches.filter((b) => {
      const matchesSearch =
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.code.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        selectedStatus === 'ALL'
          ? b.status !== 'ARCHIVED' // Archived batches hidden from default list (PRD FR-5.3)
          : b.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [batches, search, selectedStatus, isLiveConnected]);

  const handleCreateBatch = () => {
    setRefreshKey((k) => k + 1);
  };

  const getStatusBadge = (status: BatchStatus) => {
    switch (status) {
      case 'LIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'DRAFT':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ON_HOLD':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'COMPLETED':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'ARCHIVED':
        return 'bg-slate-200 text-slate-500 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
            <span>Administration</span>
            <span>/</span>
            <span className="text-blue-600">Cohorts</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Batches</h1>
            {isLiveConnected ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Live API
              </span>
            ) : null}
          </div>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Configure learning batches, member assignments, and lifecycle status machines.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <span>+</span>
          <span>Create Batch</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        {/* Status quick select tabs */}
        <div className="flex scrollbar-none items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
          {['ALL', 'LIVE', 'DRAFT', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatus(st)}
              className={`rounded-lg px-3 py-1.5 whitespace-nowrap transition-all ${
                selectedStatus === st
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'Active Batches' : st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute top-2.5 left-3.5 text-sm text-slate-400">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search batches by name or code..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pr-3 pl-9 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>
          {search || selectedStatus !== 'ALL' ? (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedStatus('ALL');
              }}
              className="px-2 text-xs font-semibold whitespace-nowrap text-blue-600 hover:text-blue-700"
            >
              Reset Filters
            </button>
          ) : null}
        </div>
      </div>

      {/* Batches Table View */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-slate-200/80 bg-slate-50/80 text-xs font-semibold tracking-wider text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-3.5">Batch Name</th>
                <th className="px-4 py-3.5">Code</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Timeline</th>
                <th className="px-4 py-3.5">Mentees</th>
                <th className="px-4 py-3.5">Overall Progress</th>
                <th className="px-6 py-3.5 text-right">Dashboard</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading cohorts from live database...
                  </td>
                </tr>
              ) : filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No batches match the applied filter.
                  </td>
                </tr>
              ) : (
                filteredBatches.map((b) => (
                  <tr key={b.id} className="transition-colors hover:bg-slate-50/60">
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/batches/${b.id}`}
                        className="font-bold text-slate-900 transition-colors hover:text-blue-600"
                      >
                        {b.name}
                      </Link>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs font-bold text-slate-700">
                      {b.code}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 font-mono text-xs font-bold ${getStatusBadge(
                          b.status,
                        )}`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-slate-600">
                      {b.startDate} → {b.endDate}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs font-semibold text-slate-700">
                      {b.menteesCount} mentees
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{ width: `${b.progressPercent}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-700">
                          {b.progressPercent}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/batches/${b.id}`}
                        className="inline-block rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100"
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Batch Modal */}
      <CreateBatchModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreateBatch}
      />
    </div>
  );
}
