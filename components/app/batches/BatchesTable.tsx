'use client';

import Link from 'next/link';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { CreateBatchModal } from '@/components/app/batches/CreateBatchModal';
import { PortalSessionState } from '@/components/app/navigation/PortalSessionState';
import { PaginationControls } from '@/components/patterns/PaginationControls';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { H1, P, Span } from '@/components/ui/Typography';
import { useBatchesList } from '@/hooks/useBatches';
import { useRoleRedirect } from '@/hooks/useRoleRedirect';
import { type BatchStatus } from '@/lib/validation';
import type { ApiBatchSummary } from '@/services/batches.service';

const ALL_BATCH_STATUSES: readonly BatchStatus[] = [
  'DRAFT',
  'LIVE',
  'ON_HOLD',
  'COMPLETED',
  'ARCHIVED',
];

function getStatusBadge(status: BatchStatus): string {
  switch (status) {
    case 'LIVE':
      return 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold';
    case 'DRAFT':
      return 'bg-blue-50 text-blue-800 border-blue-300 font-bold';
    case 'ON_HOLD':
      return 'bg-amber-50 text-amber-800 border-amber-300 font-bold';
    case 'COMPLETED':
      return 'bg-slate-100 text-slate-800 border-slate-300 font-bold';
    case 'ARCHIVED':
      return 'bg-slate-200 text-slate-600 border-slate-300 font-bold';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

function BatchStatusFilterDropdown({
  selectedStatuses,
  onChange,
}: Readonly<{
  selectedStatuses: BatchStatus[];
  onChange: (statuses: BatchStatus[]) => void;
}>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleStatus = (status: BatchStatus) => {
    if (selectedStatuses.includes(status)) {
      onChange(selectedStatuses.filter((s) => s !== status));
    } else {
      onChange([...selectedStatuses, status]);
    }
  };

  const labelText = useMemo(() => {
    if (selectedStatuses.length === 0) return 'Filter Status (All)';
    if (selectedStatuses.length === ALL_BATCH_STATUSES.length) return 'All Statuses (5)';
    if (selectedStatuses.length <= 2) return `Status: ${selectedStatuses.join(', ')}`;
    return `${selectedStatuses.length} Statuses Selected`;
  }, [selectedStatuses]);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-10 items-center gap-2 rounded-xl border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
      >
        <Span className="text-slate-400">🏷️</Span>
        <Span>{labelText}</Span>
        <Span className="text-[10px] text-slate-400">▼</Span>
      </Button>

      {isOpen ? (
        <div className="absolute left-0 z-30 mt-1.5 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-lg ring-1 ring-black/5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <Span className="text-xs font-bold text-slate-900">Filter by Status</Span>
            <div className="flex items-center gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => onChange([...ALL_BATCH_STATUSES])}
                className="font-medium text-blue-600 hover:underline"
              >
                All
              </button>
              <Span className="text-slate-300">|</Span>
              <button
                type="button"
                onClick={() => onChange([])}
                className="font-medium text-slate-500 hover:underline"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="mt-2 space-y-1.5">
            {ALL_BATCH_STATUSES.map((st) => {
              const isChecked = selectedStatuses.includes(st);
              return (
                <label
                  key={st}
                  className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-center gap-2">
                    <Checkbox checked={isChecked} onChange={() => toggleStatus(st)} />
                    <Span className="font-semibold text-slate-700">{st}</Span>
                  </div>
                  <Span
                    className={`inline-block rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold ${getStatusBadge(
                      st,
                    )}`}
                  >
                    {st}
                  </Span>
                </label>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function BatchesTableRow({ batch }: Readonly<{ batch: ApiBatchSummary }>) {
  return (
    <tr className="transition-colors hover:bg-slate-50/60">
      <td className="px-6 py-4">
        <Link
          href={`/admin/batches/${batch.id}`}
          className="font-bold text-slate-900 transition-colors hover:text-blue-600"
        >
          {batch.name}
        </Link>
      </td>
      <td className="px-4 py-4 font-mono text-xs font-bold text-slate-700">
        <Span>{batch.code}</Span>
      </td>
      <td className="px-4 py-4">
        <Span
          className={`inline-block rounded-full border px-2.5 py-0.5 font-mono text-xs font-bold ${getStatusBadge(
            batch.status,
          )}`}
        >
          {batch.status}
        </Span>
      </td>
      <td className="px-4 py-4 font-mono text-xs text-slate-600">
        <Span>
          {batch.startDate} → {batch.endDate}
        </Span>
      </td>
      <td className="px-4 py-4 font-mono text-xs font-semibold text-slate-700">
        <Span>{batch.menteesCount ?? 0} mentees</Span>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{ width: `${batch.progressPercent ?? 0}%` }}
            />
          </div>
          <Span className="font-mono text-xs font-bold text-slate-700">
            {batch.progressPercent ?? 0}%
          </Span>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <Link
          href={`/admin/batches/${batch.id}`}
          className="inline-block rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100"
        >
          Manage →
        </Link>
      </td>
    </tr>
  );
}

export function BatchesTable() {
  const { user, isAuthorized, sessionError } = useRoleRedirect({ allowedRoles: ['SUPER_ADMIN'] });
  const [search, setSearch] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<BatchStatus[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [isCreateOpen, setIsCreateOpen] = useState(
    () => typeof window !== 'undefined' && window.location.search.includes('create=true'),
  );

  const {
    data: batchesResponse,
    isLoading,
    isSuccess,
    error,
  } = useBatchesList({
    status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
    search: search.trim() || undefined,
    page,
    limit,
  });

  const batches = useMemo(() => batchesResponse?.items ?? [], [batchesResponse]);
  const pagination = useMemo(
    () =>
      batchesResponse?.pagination ?? {
        page,
        limit,
        total: 0,
        totalPages: 1,
      },
    [batchesResponse, page, limit],
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusFilterChange = (statuses: BatchStatus[]) => {
    setSelectedStatuses(statuses);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedStatuses([]);
    setPage(1);
  };

  const isLiveConnected = isSuccess && batchesResponse !== undefined;

  if (!isAuthorized || !user) {
    return (
      <PortalSessionState
        sessionError={sessionError}
        loadingMessage="Verifying administrator authorization..."
        spinnerColor="border-blue-600"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
            <Span>Administration</Span>
            <Span>/</Span>
            <Span className="text-blue-600">Cohorts</Span>
          </div>
          <div className="flex items-center gap-3">
            <H1 className="text-3xl font-extrabold tracking-tight text-slate-900">Batches</H1>
            {isLiveConnected ? (
              <Span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 font-mono text-[11px] font-bold text-emerald-800">
                <Span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Live API
              </Span>
            ) : null}
          </div>
          <P className="mt-1 max-w-2xl text-sm text-slate-600">
            Configure learning batches, member assignments, and lifecycle status machines.
          </P>
        </div>

        <Button
          type="button"
          variant="primary"
          onClick={() => setIsCreateOpen(true)}
          className="flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-sm shadow-blue-600/25 transition-all hover:bg-blue-700"
        >
          <Span className="text-base font-extrabold">+</Span>
          <Span>Create Batch</Span>
        </Button>
      </div>

      {error ? (
        <Alert
          variant="error"
          title="Error Loading Cohorts"
          message={error instanceof Error ? error.message : 'Failed to retrieve batches.'}
        />
      ) : null}

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        {/* Multi-Select Status Dropdown */}
        <BatchStatusFilterDropdown
          selectedStatuses={selectedStatuses}
          onChange={handleStatusFilterChange}
        />

        {/* Search Input */}
        <div className="relative flex-1">
          <Span className="absolute top-2.5 left-3.5 text-sm text-slate-400">🔍</Span>
          <Input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search batches by name or code..."
            className="h-10 pl-9 text-sm"
          />
        </div>

        {search || selectedStatuses.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="px-2 text-xs font-semibold whitespace-nowrap text-blue-600 hover:text-blue-700"
          >
            Reset Filters
          </Button>
        ) : null}
      </div>

      {/* Batches Table View */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-slate-200/80 bg-slate-50/80 text-xs font-semibold tracking-wider text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-3.5">
                  <Span>Batch Name</Span>
                </th>
                <th className="px-4 py-3.5">
                  <Span>Code</Span>
                </th>
                <th className="px-4 py-3.5">
                  <Span>Status</Span>
                </th>
                <th className="px-4 py-3.5">
                  <Span>Timeline</Span>
                </th>
                <th className="px-4 py-3.5">
                  <Span>Mentees</Span>
                </th>
                <th className="px-4 py-3.5">
                  <Span>Overall Progress</Span>
                </th>
                <th className="px-6 py-3.5 text-right">
                  <Span>Dashboard</Span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && batches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Span>Loading cohorts from live database...</Span>
                  </td>
                </tr>
              ) : batches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Span>No batches match the applied filter.</Span>
                  </td>
                </tr>
              ) : (
                batches.map((b) => <BatchesTableRow key={b.id} batch={b} />)
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <PaginationControls
          page={pagination.page}
          limit={pagination.limit}
          total={pagination.total}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
          onLimitChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
          itemLabel="cohorts"
          pageSizeOptions={[10, 20, 50]}
        />
      </div>

      {/* Create Batch Modal */}
      <CreateBatchModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
}
