'use client';

import { useMutation, useQuery } from '@tanstack/react-query';

import {
  type LearningHistoryResult,
  type PaginatedPerformanceData,
  type PerformanceFilterParams,
  performanceService,
} from '@/services/performance.service';

export function usePerformanceQuery(params?: PerformanceFilterParams) {
  return useQuery<PaginatedPerformanceData, Error>({
    queryKey: ['performance', params],
    queryFn: () => performanceService.getPerformance(params),
    staleTime: 60 * 1000,
  });
}

export function useLearningHistoryQuery(batchId?: string) {
  return useQuery<LearningHistoryResult, Error>({
    queryKey: ['learning-history', batchId],
    queryFn: () => performanceService.getLearningHistory(batchId),
    staleTime: 60 * 1000,
  });
}

export function useExportPerformanceMutation() {
  return useMutation<void, Error, PerformanceFilterParams | undefined>({
    mutationFn: (params) => performanceService.downloadCsv(params),
  });
}
