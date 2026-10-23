'use client';

import { useEffect, useState } from 'react';

import { authService, type TokenVerificationStatus } from '@/services/auth.service';

export interface UseResetTokenVerificationReturn {
  status: TokenVerificationStatus | null;
  isVerifying: boolean;
  retry: () => void;
}

export function useResetTokenVerification(token: string | null): UseResetTokenVerificationReturn {
  const [state, setState] = useState<{
    key: string | null;
    status: TokenVerificationStatus | null;
  }>(() => {
    const trimmed = token?.trim();
    if (!trimmed) {
      return { key: '', status: 'invalid' };
    }
    return { key: null, status: null };
  });

  const queryKey = token?.trim() || '';
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    if (!queryKey) {
      return;
    }

    let ignore = false;

    void authService
      .verifyResetToken(queryKey)
      .then((status) => {
        if (!ignore) {
          setState({ key: queryKey, status });
        }
      })
      .catch(() => {
        if (!ignore) {
          setState({ key: queryKey, status: 'unverifiable' });
        }
      });

    return () => {
      ignore = true;
    };
  }, [queryKey, reloadTrigger]);

  const isVerifying = Boolean(queryKey && state.key !== queryKey);

  return {
    status: state.key === queryKey ? state.status : null,
    isVerifying,
    retry: () => {
      setState({ key: null, status: null });
      setReloadTrigger((prev) => prev + 1);
    },
  };
}
