'use client';

import { useState } from 'react';

import {
  computeEstimatedMinutes,
  computeTotalMinutes,
  sanitizeDurationHours,
  sanitizeDurationMinutes,
  splitDurationMinutes,
} from '@/components/app/courses/types';

export interface UseDurationInputOptions {
  initialMinutes?: number | null | undefined;
  onDirty?: (() => void) | undefined;
}

export function useDurationInput(options?: UseDurationInputOptions) {
  const initial = splitDurationMinutes(options?.initialMinutes);
  const [durationHours, setDurationHours] = useState<string>(initial.hours);
  const [durationMinutes, setDurationMinutes] = useState<string>(initial.minutes);

  const handleHoursChange = (raw: string, onChange?: () => void) => {
    const sanitized = sanitizeDurationHours(raw);
    setDurationHours(sanitized);
    if (onChange) {
      onChange();
    }
    options?.onDirty?.();
  };

  const handleMinutesChange = (raw: string, onChange?: () => void) => {
    const sanitized = sanitizeDurationMinutes(raw);
    setDurationMinutes(sanitized);
    if (onChange) {
      onChange();
    }
    options?.onDirty?.();
  };

  const resetDuration = (minutes?: number | null) => {
    const next = splitDurationMinutes(minutes);
    setDurationHours(next.hours);
    setDurationMinutes(next.minutes);
  };

  const totalMinutes = computeTotalMinutes(durationHours, durationMinutes);
  const estimatedMinutes = computeEstimatedMinutes(durationHours, durationMinutes);

  return {
    durationHours,
    durationMinutes,
    setDurationHours,
    setDurationMinutes,
    handleHoursChange,
    handleMinutesChange,
    resetDuration,
    totalMinutes,
    estimatedMinutes,
  };
}
