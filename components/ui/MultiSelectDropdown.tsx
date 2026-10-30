'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Checkbox } from '@/components/ui/Checkbox';
import { Span } from '@/components/ui/Typography';
import { cn } from '@/lib/cn';
import { useClickOutside } from '@/lib/useClickOutside';

export interface MultiSelectOption<T extends string = string> {
  readonly value: T;
  readonly label: string;
}

export interface MultiSelectDropdownProps<T extends string = string> {
  readonly label: string;
  readonly options: readonly MultiSelectOption<T>[];
  readonly selectedValues: readonly T[];
  readonly onChange: (values: T[]) => void;
  readonly singleSelect?: boolean | undefined;
  readonly placeholder?: string | undefined;
  readonly className?: string | undefined;
}

export function MultiSelectDropdown<T extends string = string>({
  label,
  options,
  selectedValues,
  onChange,
  singleSelect = false,
  className,
}: Readonly<MultiSelectDropdownProps<T>>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close when clicking outside
  useClickOutside(containerRef, () => setIsOpen(false), isOpen);

  // Escape to close and refocus trigger
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

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const toggleOption = (val: T) => {
    if (singleSelect) {
      if (selectedValues.includes(val)) {
        onChange([]);
      } else {
        onChange([val]);
      }
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }

    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange([]);
  };

  const triggerLabel = useMemo(() => {
    if (selectedValues.length === 0) return label;
    if (selectedValues.length === 1) {
      const match = options.find((o) => o.value === selectedValues[0]);
      return match ? match.label : label;
    }
    return `${label} (${selectedValues.length})`;
  }, [label, options, selectedValues]);

  return (
    <div className="relative inline-block w-44 sm:w-48" ref={containerRef}>
      {/* Trigger Button with Rounded Border & Hover Effect */}
      <div
        className={cn(
          'flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-[#E1E6EC] bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-50/70',
          selectedValues.length > 0 && 'border-blue-300 bg-blue-50/40 text-[#0044D3]',
          isOpen && 'border-[#0044D3] ring-2 ring-[#0044D3]/15',
          className,
        )}
      >
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex flex-1 items-center justify-between gap-2 text-left focus:outline-none"
        >
          <Span className="truncate">{triggerLabel}</Span>
          <svg
            className={cn(
              'h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-200',
              isOpen && 'rotate-180 text-[#0044D3]',
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Popover Dropdown matching trigger width */}
      {isOpen ? (
        <div
          role="listbox"
          className="animate-in fade-in zoom-in-95 absolute left-0 z-40 mt-1.5 w-full min-w-[200px] rounded-2xl border border-[#E1E6EC] bg-white p-2.5 shadow-xl duration-100"
        >
          {/* Header Row: Title & Optional Clear */}
          <div className="flex items-center justify-between border-b border-slate-100 px-2 pb-2">
            <Span className="text-xs font-bold text-slate-800">{label}</Span>
            {selectedValues.length > 0 ? (
              <button
                type="button"
                onClick={handleClear}
                className="cursor-pointer text-[11px] font-semibold text-[#0044D3] hover:underline"
              >
                <Span>Clear</Span>
              </button>
            ) : null}
          </div>

          {/* Option List */}
          <div className="mt-1.5 max-h-52 space-y-0.5 overflow-y-auto">
            {options.map((opt) => {
              const isChecked = selectedValues.includes(opt.value);
              if (singleSelect) {
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isChecked}
                    onClick={() => toggleOption(opt.value)}
                    className={cn(
                      'flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-medium transition-colors hover:bg-slate-50',
                      isChecked ? 'bg-blue-50/50 font-semibold text-[#0044D3]' : 'text-slate-700',
                    )}
                  >
                    <Span className="truncate">{opt.label}</Span>
                    {isChecked ? (
                      <svg
                        className="h-4 w-4 shrink-0 text-[#0044D3]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : null}
                  </button>
                );
              }

              return (
                <div
                  key={opt.value}
                  role="option"
                  aria-selected={isChecked}
                  onClick={() => toggleOption(opt.value)}
                  className={cn(
                    'flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium transition-colors hover:bg-slate-50',
                    isChecked ? 'bg-blue-50/50 font-semibold text-[#0044D3]' : 'text-slate-700',
                  )}
                >
                  <Checkbox
                    checked={isChecked}
                    onChange={() => {}} // handled by parent container click
                    className="pointer-events-none"
                  />
                  <Span className="truncate">{opt.label}</Span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
