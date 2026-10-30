'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/cn';
import { formatDateDMY } from '@/lib/date';

export interface DatePickerProps {
  id?: string | undefined;
  value?: string | undefined; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string | undefined;
  disabled?: boolean | undefined;
  hasError?: boolean | undefined;
  placement?: 'bottom' | 'top' | 'auto' | undefined;
  className?: string | undefined;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function formatTwoDigits(n: number): string {
  return String(n).padStart(2, '0');
}

const emptySubscribe = () => () => {};

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  hasError = false,
  placement = 'auto',
  className,
}: Readonly<DatePickerProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const popoverHeight = 310;
    const isUp =
      placement === 'top' || (placement === 'auto' && spaceBelow < 330 && rect.top > 330);

    const left = Math.max(12, Math.min(rect.left, window.innerWidth - 300));
    let top = isUp ? rect.top - popoverHeight - 6 : rect.bottom + 6;
    top = Math.max(12, Math.min(top, window.innerHeight - popoverHeight - 12));

    setCoords({ top, left });
  }, [placement]);

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Parse initial view month/year from value, or default to current date
  const parsedDate = useMemo(() => {
    if (!value) return null;
    const parts = value.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0] ?? '0', 10);
      const m = parseInt(parts[1] ?? '0', 10) - 1;
      const d = parseInt(parts[2] ?? '0', 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return new Date(y, m, d);
      }
    }
    return null;
  }, [value]);

  const [viewDate, setViewDate] = useState<Date>(() => parsedDate || new Date());
  const [prevValue, setPrevValue] = useState(value);

  // Keep viewDate in sync when value changes externally without effect
  if (prevValue !== value) {
    setPrevValue(value);
    if (parsedDate) {
      setViewDate(parsedDate);
    }
  }

  // Click outside and scroll listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  // Generate 42 days grid for current view month
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    // Convert Sunday-indexed (0=Sun) to Monday-indexed (0=Mon)
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: Array<{
      dayNumber: number;
      isCurrentMonth: boolean;
      dateString: string;
      isSelected: boolean;
    }> = [];

    // Previous month padding
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevD = daysInPrevMonth - i;
      const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dateString = `${prevYear}-${formatTwoDigits(prevMonth + 1)}-${formatTwoDigits(prevD)}`;
      days.push({
        dayNumber: prevD,
        isCurrentMonth: false,
        dateString,
        isSelected: value === dateString,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateString = `${viewYear}-${formatTwoDigits(viewMonth + 1)}-${formatTwoDigits(d)}`;
      days.push({
        dayNumber: d,
        isCurrentMonth: true,
        dateString,
        isSelected: value === dateString,
      });
    }

    // Next month padding to fill grid
    const totalSlots = days.length <= 35 ? 35 : 42;
    const remaining = totalSlots - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
      const dateString = `${nextYear}-${formatTwoDigits(nextMonth + 1)}-${formatTwoDigits(d)}`;
      days.push({
        dayNumber: d,
        isCurrentMonth: false,
        dateString,
        isSelected: value === dateString,
      });
    }

    return days;
  }, [viewYear, viewMonth, value]);

  const handleSelectDay = (dateString: string) => {
    onChange(dateString);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Input */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={cn(
          'flex h-11 w-full items-center justify-between rounded-xl border bg-white px-3.5 text-left text-sm transition-colors focus:ring-2 focus:ring-[#0044D3] focus:outline-none',
          hasError ? 'border-red-500 text-red-900' : 'border-[#E1E6EC] text-slate-900',
          disabled && 'cursor-not-allowed bg-slate-50 opacity-60',
          className,
        )}
      >
        <span className={cn('truncate font-medium', !value && 'text-slate-400')}>
          {value ? formatDateDMY(value) : placeholder}
        </span>
        <svg
          className="h-4 w-4 shrink-0 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>

      {/* Calendar Popover portaled to document.body so it floats freely without clipping */}
      {isOpen && !disabled && mounted && coords && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={popoverRef}
              style={{
                position: 'fixed',
                top: coords.top,
                left: coords.left,
                zIndex: 9999,
              }}
              className="animate-in fade-in zoom-in-95 w-72 rounded-2xl border border-[#E1E6EC] bg-white p-3.5 shadow-2xl duration-100"
            >
              {/* Header with Navigation */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Previous month"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <span className="text-xs font-bold text-slate-900 sm:text-sm">
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </span>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Next month"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Weekday Row */}
              <div className="mt-2 grid grid-cols-7 text-center text-[11px] font-semibold text-slate-400">
                {WEEKDAY_NAMES.map((w) => (
                  <span key={w} className="py-1">
                    {w}
                  </span>
                ))}
              </div>

              {/* Day Grid */}
              <div className="mt-1 grid grid-cols-7 gap-1 text-center text-xs">
                {calendarDays.map((cell) => {
                  return (
                    <button
                      key={cell.dateString}
                      type="button"
                      onClick={() => handleSelectDay(cell.dateString)}
                      className={cn(
                        'mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors',
                        cell.isSelected
                          ? 'bg-[#0044D3] font-bold text-white shadow-xs'
                          : cell.isCurrentMonth
                            ? 'font-semibold text-slate-700 hover:bg-slate-100'
                            : 'font-normal text-slate-300 hover:bg-slate-50',
                      )}
                    >
                      {cell.dayNumber}
                    </button>
                  );
                })}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
