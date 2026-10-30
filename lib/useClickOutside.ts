'use client';

import { type RefObject, useEffect } from 'react';

/**
 * Hook to trigger a callback when a mousedown or touchstart occurs outside
 * of the target element(s).
 */
export function useClickOutside(
  targetRefs: RefObject<HTMLElement | null> | Array<RefObject<HTMLElement | null>>,
  onOutside: () => void,
  enabled: boolean = true,
) {
  useEffect(() => {
    if (!enabled) return;

    function handleEvent(event: MouseEvent | TouchEvent) {
      const refs = Array.isArray(targetRefs) ? targetRefs : [targetRefs];
      const target = event.target as Node | null;

      if (!target) return;

      const isInside = refs.some((ref) => {
        return ref.current && ref.current.contains(target);
      });

      if (!isInside) {
        onOutside();
      }
    }

    document.addEventListener('mousedown', handleEvent);
    document.addEventListener('touchstart', handleEvent);

    return () => {
      document.removeEventListener('mousedown', handleEvent);
      document.removeEventListener('touchstart', handleEvent);
    };
  }, [targetRefs, onOutside, enabled]);
}
