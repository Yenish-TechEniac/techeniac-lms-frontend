'use client';

import Link from 'next/link';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { CreateBatchModal } from '@/components/app/batches/CreateBatchModal';
import { PortalSessionState } from '@/components/app/navigation/PortalSessionState';
import { PageHeader } from '@/components/patterns/PageHeader';
import { PaginationControls } from '@/components/patterns/PaginationControls';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
import { type BatchStatus } from '@/lib/validation';
import type { ApiBatchSummary } from '@/services/batches.service';

const BATCH_STATUS_TABS: ReadonlyArray<{ label: string; value: 'ALL' | BatchStatus }> = [
  { label: 'All Batches', value: 'ALL' },
  { label: 'Live', value: 'LIVE' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'On Hold', value: 'ON_HOLD' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Archived', value: 'ARCHIVED' },
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
  isSearching?: boolean;
}

function BatchSearchInput({
  value,
  onSearchChange,
  isSearching = false,
}: Readonly<BatchSearchInputProps>) {
  const [localValue, setLocalValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const [isDebouncing, setIsDebouncing] = useState(false);
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
    setIsDebouncing(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setIsDebouncing(false);
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
        {isDebouncing || isSearching ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0044D3] border-t-transparent" />
        ) : (
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
        )}
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
  return (
    <TableRow className="transition-colors hover:bg-slate-50/60">
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
          {batch.startDate} → {batch.endDate}
        </Span>
      </TableCell>
      <TableCell className="text-xs font-medium text-slate-700">
        <Span>{batch.menteesCount ?? 0} mentees</Span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
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
      <TableCell className="text-right">
        <Link
          href={`/admin/batches/${batch.id}`}
          className="inline-flex items-center gap-1 rounded-lg border border-[#E1E6EC] bg-white px-3 py-1.5 text-xs font-semibold text-[#0044D3] transition-colors hover:bg-blue-50"
        >
          <Span>Manage</Span>
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </TableCell>
    </TableRow>
  );
}

function BatchesTableSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((idx) => (
        <TableRow key={idx}>
          <TableCell>
            <Skeleton className="h-4 w-44 rounded-sm" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16 rounded-sm" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32 rounded-sm" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-14 rounded-sm" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-2 w-28 rounded-full" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="ml-auto h-7 w-20 rounded-lg" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function BatchesTable() {
  const { user, isAuthorized, sessionError } = useRoleRedirect({ allowedRoles: ['SUPER_ADMIN'] });
  const [search, setSearch] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState<'ALL' | BatchStatus>('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [isCreateOpen, setIsCreateOpen] = useState(
    () => typeof window !== 'undefined' && window.location.search.includes('create=true'),
  );

  const filterStatus = useMemo(() => {
    if (selectedStatusTab === 'ALL') return undefined;
    return [selectedStatusTab];
  }, [selectedStatusTab]);

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
    return (
      <PortalSessionState
        sessionError={sessionError}
        loadingMessage="Verifying administrator authorization..."
        spinnerColor="border-blue-600"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Header via Global PageHeader */}
      <PageHeader
        breadcrumbs={[
          { label: 'Administration', href: '/admin' },
          { label: 'Cohorts', active: true },
        ]}
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

      {/* Status Navigation Tabs */}
      <div className="flex items-center gap-6 overflow-x-auto border-b border-[#E1E6EC]">
        {BATCH_STATUS_TABS.map((tab) => {
          const isActive = selectedStatusTab === tab.value;
          return (
            <Button
              key={tab.value}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedStatusTab(tab.value);
                setPage(1);
              }}
              className={`-mb-px flex h-auto items-center rounded-none border-b-2 px-1 pt-2 pb-3 text-sm transition-colors hover:bg-transparent ${
                isActive
                  ? 'border-[#0044D3] font-bold text-[#0044D3]'
                  : 'border-transparent font-medium text-[#667085] hover:text-slate-900'
              }`}
            >
              <Span>{tab.label}</Span>
            </Button>
          );
        })}
      </div>

      {/* Filter Row with Expanded Search Input */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E1E6EC] bg-white p-3.5 shadow-xs">
        <div className="w-full flex-1 sm:max-w-md lg:max-w-lg">
          <BatchSearchInput
            value={search}
            onSearchChange={handleSearchChange}
            isSearching={isTableLoading}
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
              <TableHead>Mentees</TableHead>
              <TableHead>Overall Progress</TableHead>
              <TableHead className="text-right">Dashboard</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isTableLoading && batches.length === 0 ? (
              <BatchesTableSkeleton />
            ) : batches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-slate-500">
                  <Span>No batches match the applied filter.</Span>
                </TableCell>
              </TableRow>
            ) : (
              batches.map((b) => <BatchesTableRow key={b.id} batch={b} />)
            )}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        <PaginationControls
          page={pagination.page}
          limit={pagination.limit}
          total={pagination.total}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
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
