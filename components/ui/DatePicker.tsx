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

import { Button } from '@/components/ui/Button';
import { Span } from '@/components/ui/Typography';
import { cn } from '@/lib/cn';
import { formatDateDMY } from '@/lib/date';
import { useClickOutside } from '@/lib/useClickOutside';

export interface DatePickerProps {
  readonly id?: string | undefined;
  readonly value?: string | undefined; // YYYY-MM-DD
  readonly onChange: (value: string) => void;
  readonly placeholder?: string | undefined;
  readonly disabled?: boolean | undefined;
  readonly hasError?: boolean | undefined;
  readonly placement?: 'bottom' | 'top' | 'auto' | undefined;
  readonly className?: string | undefined;
}

const POPOVER_WIDTH_PX = 288;
const POPOVER_HEIGHT_PX = 320;
const POPOVER_GUTTER_PX = 6;
const POPOVER_Z_INDEX = 9999;

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

export interface CalendarDay {
  dayNumber: number;
  isCurrentMonth: boolean;
  dateString: string;
  isSelected: boolean;
}

/**
 * Pure utility function to generate 35 or 42 grid cells for the target view month/year.
 */
export function buildCalendarGrid(
  viewYear: number,
  viewMonth: number,
  value?: string,
): CalendarDay[] {
  const firstDay = new Date(viewYear, viewMonth, 1);
  let startDayOfWeek = firstDay.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const days: CalendarDay[] = [];

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
}

interface CalendarPopoverProps {
  readonly popoverRef: React.RefObject<HTMLDivElement | null>;
  readonly coords: { top: number; left: number };
  readonly viewYear: number;
  readonly viewMonth: number;
  readonly calendarDays: readonly CalendarDay[];
  readonly onPrevMonth: () => void;
  readonly onNextMonth: () => void;
  readonly onSelectDay: (dateString: string) => void;
}

function CalendarPopover({
  popoverRef,
  coords,
  viewYear,
  viewMonth,
  calendarDays,
  onPrevMonth,
  onNextMonth,
  onSelectDay,
}: Readonly<CalendarPopoverProps>) {
  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Choose date"
      style={{
        position: 'fixed',
        top: coords.top,
        left: coords.left,
        zIndex: POPOVER_Z_INDEX,
        width: POPOVER_WIDTH_PX,
      }}
      className="animate-in fade-in zoom-in-95 rounded-2xl border border-[#E1E6EC] bg-white p-3.5 shadow-2xl duration-100"
    >
      {/* Header with Navigation */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onPrevMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full p-0 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          aria-label="Previous month"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Button>

        <Span className="text-xs font-bold text-slate-900 sm:text-sm">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </Span>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onNextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full p-0 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          aria-label="Next month"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>

      {/* Weekday Row */}
      <div className="mt-2 grid grid-cols-7 text-center text-[11px] font-semibold text-slate-400">
        {WEEKDAY_NAMES.map((w) => (
          <Span key={w} className="py-1">
            {w}
          </Span>
        ))}
      </div>

      {/* Day Grid with Accessible 36px Touch Targets */}
      <div className="mt-1 grid grid-cols-7 gap-1 text-center text-xs">
        {calendarDays.map((cell) => {
          return (
            <Button
              key={cell.dateString}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onSelectDay(cell.dateString)}
              className={cn(
                'mx-auto flex h-8 w-8 items-center justify-center rounded-full p-0 text-xs transition-colors',
                cell.isSelected
                  ? 'bg-[#0044D3] font-bold text-white shadow-xs hover:bg-[#0036AB]'
                  : cell.isCurrentMonth
                    ? 'font-semibold text-slate-700 hover:bg-slate-100'
                    : 'font-normal text-slate-300 hover:bg-slate-50',
              )}
            >
              <Span>{cell.dayNumber}</Span>
            </Button>
          );
        })}
      </div>
    </div>
  );
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const isUp =
      placement === 'top' ||
      (placement === 'auto' &&
        spaceBelow < POPOVER_HEIGHT_PX + POPOVER_GUTTER_PX &&
        rect.top > POPOVER_HEIGHT_PX);

    const left = Math.max(12, Math.min(rect.left, window.innerWidth - POPOVER_WIDTH_PX - 12));
    let top = isUp
      ? rect.top - POPOVER_HEIGHT_PX - POPOVER_GUTTER_PX
      : rect.bottom + POPOVER_GUTTER_PX;
    top = Math.max(12, Math.min(top, window.innerHeight - POPOVER_HEIGHT_PX - 12));

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

  // Close when clicking outside container or popover
  useClickOutside([containerRef, popoverRef], () => setIsOpen(false), isOpen);

  // Stop Escape propagation when popover is open to protect host modals
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, updatePosition]);

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

  if (prevValue !== value) {
    setPrevValue(value);
    if (parsedDate) {
      setViewDate(parsedDate);
    }
  }

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const calendarDays = useMemo(
    () => buildCalendarGrid(viewYear, viewMonth, value),
    [viewYear, viewMonth, value],
  );

  const handleSelectDay = (dateString: string) => {
    onChange(dateString);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button with Design System Styling and Accessibility Attributes */}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={cn(
          'flex h-11 w-full items-center justify-between rounded-xl border bg-white px-3.5 text-left text-sm transition-colors focus:ring-2 focus:ring-[#0044D3] focus:outline-none',
          hasError ? 'border-red-500 text-red-900' : 'border-[#E1E6EC] text-slate-900',
          disabled && 'cursor-not-allowed bg-slate-50 opacity-60',
          className,
        )}
      >
        <Span className={cn('truncate font-medium', !value && 'text-slate-400')}>
          {value ? formatDateDMY(value) : placeholder}
        </Span>
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

      {/* Calendar Popover */}
      {isOpen && !disabled && mounted && coords && typeof document !== 'undefined'
        ? createPortal(
            <CalendarPopover
              popoverRef={popoverRef}
              coords={coords}
              viewYear={viewYear}
              viewMonth={viewMonth}
              calendarDays={calendarDays}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onSelectDay={handleSelectDay}
            />,
            document.body,
          )
        : null}
    </div>
  );
}
