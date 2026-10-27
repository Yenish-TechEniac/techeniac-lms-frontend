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

export function PaginationControls({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
  itemLabel = 'items',
  pageSizeOptions = [10, 20, 50, 100],
  className,
}: Readonly<PaginationControlsProps>) {
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);
  const formattedItemLabel = itemLabel.charAt(0).toUpperCase() + itemLabel.slice(1);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-between gap-3 border-t border-slate-100 bg-white px-6 py-4 text-xs text-slate-600 sm:flex-row',
        className,
      )}
    >
      <div className="flex items-center gap-2 font-medium" role="status" aria-live="polite">
        <Span>
          Showing <strong className="font-semibold text-slate-900">{startItem}</strong> to{' '}
          <strong className="font-semibold text-slate-900">{endItem}</strong> of{' '}
          <strong className="font-semibold text-slate-900">{total}</strong> {itemLabel}
        </Span>
      </div>

      <div className="flex items-center gap-4">
        {/* Page Size Selector */}
        <div className="flex items-center gap-1.5">
          <Span className="text-slate-500">Per page:</Span>
          <Select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            aria-label={`${formattedItemLabel} per page`}
            className="h-8 w-auto rounded-lg px-2 py-0.5 text-xs font-semibold text-slate-700"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </Select>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="h-8 px-2.5 text-xs font-medium"
          >
            ← Prev
          </Button>

          <Span
            className="px-2 font-mono text-xs font-bold text-slate-800"
            role="status"
            aria-live="polite"
          >
            {page} / {totalPages || 1}
          </Span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="h-8 px-2.5 text-xs font-medium"
          >
            Next →
          </Button>
        </div>
      </div>
    </div>
  );
}
