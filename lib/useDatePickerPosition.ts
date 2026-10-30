'use client';

import { useCallback, useState } from 'react';

export interface UseDatePickerPositionOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  placement?: 'bottom' | 'top' | 'auto' | undefined;
  popoverWidth?: number | undefined;
  popoverHeight?: number | undefined;
  gutter?: number | undefined;
}

export function useDatePickerPosition({
  containerRef,
  placement = 'auto',
  popoverWidth = 340,
  popoverHeight = 380,
  gutter = 6,
}: UseDatePickerPositionOptions) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  const updatePosition = useCallback(() => {
    if (!containerRef.current || typeof window === 'undefined') return;
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const isUp =
      placement === 'top' ||
      (placement === 'auto' && spaceBelow < popoverHeight + gutter && rect.top > popoverHeight);

    const left = Math.max(12, Math.min(rect.left, window.innerWidth - popoverWidth - 12));
    let top = isUp ? rect.top - popoverHeight - gutter : rect.bottom + gutter;
    top = Math.max(12, Math.min(top, window.innerHeight - popoverHeight - 12));

    setCoords({ top, left });
  }, [containerRef, placement, popoverWidth, popoverHeight, gutter]);

  return { coords, updatePosition };
}
