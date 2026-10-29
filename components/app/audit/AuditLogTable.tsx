'use client';

import React, { useState } from 'react';

import { AuditDetailModal } from '@/components/app/audit/AuditDetailModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { H2, P, Span } from '@/components/ui/Typography';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import type { ApiAuditItem, AuditType } from '@/lib/validation';
import type { AuditQueryFilters } from '@/services/audit.service';

const AUDIT_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'ALL', label: 'All Event Types' },
  { value: 'AUTH', label: 'Authentication (AUTH)' },
  { value: 'USER', label: 'User & Roles (USER)' },
  { value: 'COURSE', label: 'Courses (COURSE)' },
  { value: 'BATCH', label: 'Batches (BATCH)' },
  { value: 'MENTOR_MAPPING', label: 'Mentor Mapping (MENTOR_MAPPING)' },
  { value: 'COURSE_ALLOCATION', label: 'Allocations (COURSE_ALLOCATION)' },
  { value: 'SUBMISSION', label: 'Submissions (SUBMISSION)' },
  { value: 'GRADING', label: 'Grading (GRADING)' },
];

function getAuditTypeBadge(type: AuditType): string {
  switch (type) {
    case 'AUTH':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'USER':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'COURSE':
      return 'bg-violet-100 text-violet-800 border-violet-200';
    case 'BATCH':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'MENTOR_MAPPING':
      return 'bg-teal-100 text-teal-800 border-teal-200';
    case 'COURSE_ALLOCATION':
      return 'bg-sky-100 text-sky-800 border-sky-200';
    case 'SUBMISSION':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    case 'GRADING':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
}

function getTargetEntityInfo(item: ApiAuditItem): {
  name: string;
  type: string;
} {
  const val = item.newValue ?? item.oldValue;
  const friendlyType = item.entity.replace(/([a-z])([A-Z])/g, '$1 $2');

  let resolvedName: string | null = null;
  if (val && typeof val === 'object') {
    if (typeof val.name === 'string' && val.name.trim()) resolvedName = val.name;
    else if (typeof val.title === 'string' && val.title.trim()) resolvedName = val.title;
    else if (typeof val.email === 'string' && val.email.trim()) resolvedName = val.email;
    else if (typeof val.batchName === 'string' && val.batchName.trim())
      resolvedName = val.batchName;
    else if (typeof val.courseTitle === 'string' && val.courseTitle.trim())
      resolvedName = val.courseTitle;
    else if (typeof val.assignmentTitle === 'string' && val.assignmentTitle.trim())
      resolvedName = val.assignmentTitle;
    else if (typeof val.menteeName === 'string' && val.menteeName.trim())
      resolvedName = val.menteeName;
  }

  if (resolvedName) {
    return {
      name: resolvedName,
      type: friendlyType,
    };
  }

  return {
    name: friendlyType,
    type: '',
  };
}

export function AuditLogTable() {
  const [filters, setFilters] = useState<AuditQueryFilters>({
    page: 1,
    limit: 20,
    type: undefined,
    action: undefined,
    startDate: undefined,
    endDate: undefined,
  });

  const [selectedEntry, setSelectedEntry] = useState<ApiAuditItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { logs, pagination, isLoading, isFetching, error, refetch } = useAuditLogs(filters);

  const handleFilterChange = (key: keyof AuditQueryFilters, value: string | number | undefined) => {
    setFilters((prev) => ({
      ...prev,
      page: 1, // Reset to first page on filter change
      [key]: value === '' || value === 'ALL' ? undefined : value,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleOpenModal = (entry: ApiAuditItem) => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      type: undefined,
      action: undefined,
      startDate: undefined,
      endDate: undefined,
    });
  };

  const hasActiveFilters = Boolean(
    filters.type || filters.action || filters.startDate || filters.endDate,
  );

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Type Filter */}
          <div>
            <Label htmlFor="audit-type-filter" className="text-xs font-semibold text-slate-700">
              Event Type
            </Label>
            <Select
              id="audit-type-filter"
              value={filters.type ?? 'ALL'}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="mt-1.5 h-10 w-full rounded-xl text-xs"
            >
              {AUDIT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Action Search */}
          <div>
            <Label htmlFor="audit-action-filter" className="text-xs font-semibold text-slate-700">
              Filter by Action
            </Label>
            <Input
              id="audit-action-filter"
              type="text"
              placeholder="e.g. ROLE_CHANGE, LOGIN, LIVE_EDIT"
              value={filters.action ?? ''}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="mt-1.5 h-10 rounded-xl text-xs"
            />
          </div>

          {/* Date Range Start */}
          <div>
            <Label htmlFor="audit-start-date" className="text-xs font-semibold text-slate-700">
              From Date
            </Label>
            <Input
              id="audit-start-date"
              type="date"
              value={filters.startDate ?? ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="mt-1.5 h-10 rounded-xl text-xs"
            />
          </div>

          {/* Date Range End */}
          <div>
            <Label htmlFor="audit-end-date" className="text-xs font-semibold text-slate-700">
              To Date
            </Label>
            <Input
              id="audit-end-date"
              type="date"
              min={filters.startDate}
              value={filters.endDate ?? ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="mt-1.5 h-10 rounded-xl text-xs"
            />
          </div>
        </div>

        {/* Filter Summary & Actions */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Span className="font-semibold text-slate-700">{pagination.total}</Span> total events
            recorded
            {isFetching && !isLoading && (
              <Span className="animate-pulse text-blue-600">· Refreshing...</Span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="text-xs text-slate-600 hover:text-slate-900"
              >
                Reset Filters
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              className="text-xs"
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          <Span className="font-bold">Error loading audit records: </Span>
          {error}
        </div>
      )}

      {/* Audit Log Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
              <tr>
                <th className="px-5 py-3.5">Timestamp (IST)</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Action</th>
                <th className="px-5 py-3.5">Actor</th>
                <th className="px-5 py-3.5">Target Entity</th>
                <th className="px-5 py-3.5">Payload Preview</th>
                <th className="px-5 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {isLoading ? (
                // Skeleton rows
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="animate-pulse">
                    <td className="px-5 py-4">
                      <Skeleton className="h-4 w-28 rounded-md" />
                    </td>
                    <td className="px-5 py-4">
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </td>
                    <td className="px-5 py-4">
                      <Skeleton className="h-4 w-24 rounded-md" />
                    </td>
                    <td className="px-5 py-4">
                      <Skeleton className="h-4 w-32 rounded-md" />
                    </td>
                    <td className="px-5 py-4">
                      <Skeleton className="h-4 w-24 rounded-md" />
                    </td>
                    <td className="px-5 py-4">
                      <Skeleton className="h-4 w-40 rounded-md" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Skeleton className="ml-auto h-7 w-16 rounded-md" />
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <div className="mx-auto max-w-sm space-y-2">
                      <H2 className="text-sm font-semibold text-slate-800">
                        No audit events found
                      </H2>
                      <P className="text-xs text-slate-500">
                        {hasActiveFilters
                          ? 'No events match the selected filters. Try widening your date range or clearing filters.'
                          : 'No audit records have been generated yet.'}
                      </P>
                      {hasActiveFilters && (
                        <div className="pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleResetFilters}
                          >
                            Clear All Filters
                          </Button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((item) => {
                  const formattedTime = new Date(item.createdAt).toLocaleString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });

                  const actorName = item.actor?.name || 'Anonymous / System';
                  const actorRole = item.actor?.role;
                  const previewText = item.newValue
                    ? JSON.stringify(item.newValue).slice(0, 50) + '...'
                    : item.oldValue
                      ? JSON.stringify(item.oldValue).slice(0, 50) + '...'
                      : '—';

                  return (
                    <tr key={item.id} className="transition-colors hover:bg-slate-50/70">
                      {/* Timestamp */}
                      <td className="px-5 py-3.5 font-mono text-[11px] whitespace-nowrap text-slate-600">
                        {formattedTime}
                      </td>

                      {/* Type */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <Span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${getAuditTypeBadge(
                            item.type,
                          )}`}
                        >
                          {item.type}
                        </Span>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-3.5 font-semibold whitespace-nowrap text-slate-900">
                        {item.action}
                      </td>

                      {/* Actor */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col">
                          <Span className="font-semibold text-slate-800">{actorName}</Span>
                          {actorRole ? (
                            <Span className="text-[10px] text-slate-500">{actorRole}</Span>
                          ) : null}
                        </div>
                      </td>

                      {/* Target Entity */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-700">
                        {(() => {
                          const target = getTargetEntityInfo(item);
                          return (
                            <div className="flex flex-col">
                              <Span className="font-semibold text-slate-900">{target.name}</Span>
                              {target.type ? (
                                <Span className="text-[10px] text-slate-500">{target.type}</Span>
                              ) : null}
                            </div>
                          );
                        })()}
                      </td>

                      {/* Payload Preview */}
                      <td className="max-w-xs truncate px-5 py-3.5 font-mono text-[11px] text-slate-500">
                        {previewText}
                      </td>

                      {/* View Payload Details Button */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenModal(item)}
                          className="h-8 rounded-lg px-2.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        >
                          View Diff
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-5 py-3">
            <Span className="text-xs text-slate-500">
              Page <Span className="font-semibold text-slate-800">{pagination.page}</Span> of{' '}
              <Span className="font-semibold text-slate-800">{pagination.totalPages}</Span> (
              {pagination.total} records)
            </Span>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1 || isLoading}
                className="text-xs"
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || isLoading}
                className="text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <AuditDetailModal
        entry={selectedEntry}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEntry(null);
        }}
      />
    </div>
  );
}
