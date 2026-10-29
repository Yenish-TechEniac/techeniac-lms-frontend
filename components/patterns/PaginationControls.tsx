import React from 'react';

import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Span } from '@/components/ui/Typography';
import { cn } from '@/lib/cn';

export interface PaginationControlsProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
  itemLabel?: string;
  pageSizeOptions?: readonly number[] | number[];
  className?: string;
}

function getPageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 3) {
    return [1, 2, 3, 4, 'ellipsis', totalPages];
  }
  if (currentPage >= totalPages - 2) {
    return [1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages];
}

export function PaginationControls({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
  itemLabel = 'entries',
  pageSizeOptions = [10, 20, 50, 100],
  className,
}: Readonly<PaginationControlsProps>) {
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);
  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-between gap-4 border-t border-[#E1E6EC] bg-white px-6 py-4 text-sm text-slate-500 sm:flex-row',
        className,
      )}
    >
      <div className="flex items-center gap-2 font-medium" role="status" aria-live="polite">
        <Span>
          Showing {startItem}-{endItem} of {total} {itemLabel}
        </Span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Navigation Buttons with Numbered Page Pills */}
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="h-8 w-8 rounded-full border-[#E1E6EC] p-0 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            aria-label="Previous page"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Button>

          {pageNumbers.map((p, idx) =>
            p === 'ellipsis' ? (
              <span key={`ellipsis-${idx}`} className="px-1 text-slate-400">
                …
              </span>
            ) : (
              <Button
                key={p}
                type="button"
                variant={p === page ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onPageChange(p)}
                className={`h-8 min-w-8 rounded-full px-2.5 text-xs font-semibold ${
                  p === page
                    ? 'bg-[#0044D3] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                aria-current={p === page ? 'page' : undefined}
              >
                {p}
              </Button>
            ),
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="h-8 w-8 rounded-full border-[#E1E6EC] p-0 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            aria-label="Next page"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>

        {/* Page Size Selector */}
        <div className="w-36">
          <Select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            aria-label="Entries per page"
            className="h-8 text-xs font-semibold text-slate-700"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt} Per Page
              </option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
}
