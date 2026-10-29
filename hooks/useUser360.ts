'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { user360Service } from '@/services/user-360.service';
import type { User360FilterState, User360Profile } from '@/types/user-360';

export function useUser360(userId: string, filters: User360FilterState = {}) {
  const query = useQuery<User360Profile, Error>({
    queryKey: ['user-360', userId, filters],
    queryFn: () => user360Service.getUser360(userId, filters),
    enabled: Boolean(userId),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error ? query.error.message : null,
    refetch: query.refetch,
    downloadCsv: () => user360Service.downloadUser360Csv(userId, filters),
  };
}
