'use client';

import Link from 'next/link';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { CreateBatchModal } from '@/components/app/batches/CreateBatchModal';
import { PageHeader } from '@/components/patterns/PageHeader';
import { PaginationControls } from '@/components/patterns/PaginationControls';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MultiSelectDropdown, type MultiSelectOption } from '@/components/ui/MultiSelectDropdown';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Span } from '@/components/ui/Typography';
import { useBatchesList } from '@/hooks/useBatches';
import { useRoleRedirect } from '@/hooks/useRoleRedirect';
import { formatDateDMY } from '@/lib/date';
import { type BatchStatus } from '@/lib/validation';
import type { ApiBatchSummary } from '@/services/batches.service';

const BATCH_STATUS_FILTER_OPTIONS: MultiSelectOption[] = [
  { value: 'LIVE', label: 'Live' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ARCHIVED', label: 'Archived' },
];

function getStatusBadge(status: BatchStatus): string {
  switch (status) {
    case 'LIVE':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'DRAFT':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'ON_HOLD':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'COMPLETED':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'ARCHIVED':
      return 'bg-slate-50 text-slate-500 border-slate-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

interface BatchSearchInputProps {
  value: string;
  onSearchChange: (val: string) => void;
}

function BatchSearchInput({ value, onSearchChange }: Readonly<BatchSearchInputProps>) {
  const [localValue, setLocalValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onSearchChangeRef = useRef(onSearchChange);

  useEffect(() => {
    onSearchChangeRef.current = onSearchChange;
  });

  if (prevValue !== value) {
    setPrevValue(value);
    setLocalValue(value);
  }

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    setLocalValue(nextVal);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      onSearchChangeRef.current(nextVal);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <Input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder="Search batches by name or code..."
        className="h-11 w-full rounded-xl pl-10 text-sm font-medium"
      />
    </div>
  );
}

function BatchesTableRow({ batch }: Readonly<{ batch: ApiBatchSummary }>) {
  const totalMembers = (batch.menteesCount ?? 0) + (batch.mentorsCount ?? 0);

  return (
    <TableRow className="h-14 transition-colors hover:bg-slate-50/60">
      <TableCell className="font-semibold text-slate-900">
        <Link
          href={`/admin/batches/${batch.id}`}
          className="transition-colors hover:text-[#0044D3]"
        >
          {batch.name}
        </Link>
      </TableCell>
      <TableCell className="font-mono text-xs font-semibold text-slate-600">
        <Span>{batch.code}</Span>
      </TableCell>
      <TableCell>
        <Span
          className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(
            batch.status,
          )}`}
        >
          {batch.status}
        </Span>
      </TableCell>
      <TableCell className="font-mono text-xs text-slate-500">
        <Span>
          {formatDateDMY(batch.startDate)} → {formatDateDMY(batch.endDate)}
        </Span>
      </TableCell>
      <TableCell className="text-xs font-semibold text-slate-700">
        <Span>
          {totalMembers} {totalMembers === 1 ? 'member' : 'members'}
        </Span>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-[#0044D3]"
              style={{ width: `${batch.progressPercent ?? 0}%` }}
            />
          </div>
          <Span className="font-mono text-xs font-semibold text-slate-700">
            {batch.progressPercent ?? 0}%
          </Span>
        </div>
      </TableCell>
    </TableRow>
  );
}

function BatchesTableSkeleton({ count = 10 }: Readonly<{ count?: number }>) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <TableRow key={`batch-skel-${idx}`} className="h-14">
          <TableCell>
            <Skeleton className="h-4 w-44 rounded-md" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16 rounded-md" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32 rounded-md" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20 rounded-md" />
          </TableCell>
          <TableCell className="text-right">
            <div className="flex items-center justify-end gap-2">
              <Skeleton className="h-2 w-24 rounded-full" />
              <Skeleton className="h-3 w-8 rounded-md" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function BatchesPageSkeleton() {
  return (
    <div className="animate-in fade-in space-y-4 duration-150">
      {/* Top Header Skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-9 w-36 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>

      {/* Filter Row Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E1E6EC] bg-white p-3.5 shadow-xs">
        <Skeleton className="h-11 w-full max-w-md rounded-xl" />
        <Skeleton className="h-11 w-48 rounded-xl" />
      </div>

      {/* Table Skeleton */}
      <div className="overflow-hidden rounded-2xl border border-[#E1E6EC] bg-white shadow-xs">
        <div className="h-12 border-b border-slate-100 bg-slate-50/50 px-4 py-3">
          <div className="grid grid-cols-6 gap-4">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-4 w-16 rounded-md" />
            <Skeleton className="h-4 w-16 rounded-md" />
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="ml-auto h-4 w-24 rounded-md" />
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex h-14 items-center justify-between px-4">
              <Skeleton className="h-4 w-40 rounded-md" />
              <Skeleton className="h-4 w-16 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-4 w-16 rounded-md" />
              <Skeleton className="h-2 w-24 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BatchesTable() {
  const { user, isAuthorized, sessionError } = useRoleRedirect({ allowedRoles: ['SUPER_ADMIN'] });
  const [search, setSearch] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isCreateOpen, setIsCreateOpen] = useState(
    () => typeof window !== 'undefined' && window.location.search.includes('create=true'),
  );

  const filterStatus = useMemo(() => {
    if (selectedStatuses.length > 0) {
      return selectedStatuses as BatchStatus[];
    }
    return undefined;
  }, [selectedStatuses]);

  const {
    data: batchesResponse,
    isLoading,
    isFetching,
    error,
  } = useBatchesList({
    status: filterStatus,
    search: search.trim() || undefined,
    page,
    limit,
  });

  const isTableLoading = Boolean(isLoading || isFetching);
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

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!isAuthorized || !user) {
    if (sessionError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
          <Alert variant="error" title="Session Verification Issue" message={sessionError} />
        </div>
      );
    }
    return <BatchesPageSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Top Header via Global PageHeader with no breadcrumbs */}
      <PageHeader
        title="Batches"
        actions={
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="h-9 gap-2 rounded-full bg-[#0044D3] px-4 text-xs font-semibold text-white shadow-xs hover:bg-[#0039B3] sm:h-10 sm:text-sm"
          >
            <Span className="text-base font-bold">+</Span>
            <Span>Create Batch</Span>
          </Button>
        }
      />

      {/* Filter Row with Search Input and Status MultiSelect Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E1E6EC] bg-white p-3.5 shadow-xs">
        <div className="w-full flex-1 sm:max-w-md lg:max-w-lg">
          <BatchSearchInput value={search} onSearchChange={handleSearchChange} />
        </div>
        <div className="w-full sm:w-auto">
          <MultiSelectDropdown
            label="Status"
            options={BATCH_STATUS_FILTER_OPTIONS}
            selectedValues={selectedStatuses}
            onChange={(vals) => {
              setSelectedStatuses(vals);
              setPage(1);
            }}
          />
        </div>
      </div>

      {error ? (
        <Alert
          variant="error"
          title="Error Loading Cohorts"
          message={error instanceof Error ? error.message : 'Failed to retrieve batches.'}
        />
      ) : null}

      {/* Batches Table View */}
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Batch Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Timeline</TableHead>
              <TableHead>Members</TableHead>
              <TableHead className="text-right">Overall Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isTableLoading ? (
              <BatchesTableSkeleton count={limit} />
            ) : batches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-slate-500">
                  <Span>No batches match the applied filter.</Span>
                </TableCell>
              </TableRow>
            ) : (
              batches.map((b) => <BatchesTableRow key={b.id} batch={b} />)
            )}
          </TableBody>
        </Table>

        {/* Pagination Controls with Loading State */}
        <PaginationControls
          page={pagination.page}
          limit={pagination.limit}
          total={pagination.total}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          isLoading={isTableLoading}
          itemLabel="cohorts"
          pageSizeOptions={[10, 20, 50]}
        />
      </TableContainer>

      {/* Create Batch Modal */}
      <CreateBatchModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
}
