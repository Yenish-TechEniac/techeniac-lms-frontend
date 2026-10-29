'use client';

import { useMutation, useQuery } from '@tanstack/react-query';

import {
  type LearningHistoryResult,
  type PaginatedPerformanceData,
  type PerformanceFilterParams,
  performanceService,
} from '@/services/performance.service';

export const PERFORMANCE_QUERY_KEYS = {
  all: ['performance'] as const,
  list: (params?: PerformanceFilterParams) => ['performance', params] as const,
  learningHistory: (batchId?: string) => ['learning-history', batchId] as const,
};

export function usePerformanceQuery(params?: PerformanceFilterParams) {
  return useQuery<PaginatedPerformanceData, Error>({
    queryKey: PERFORMANCE_QUERY_KEYS.list(params),
    queryFn: () => performanceService.getPerformance(params),
    staleTime: 60 * 1000,
  });
}

export function useLearningHistoryQuery(batchId?: string) {
  return useQuery<LearningHistoryResult, Error>({
    queryKey: PERFORMANCE_QUERY_KEYS.learningHistory(batchId),
    queryFn: () => performanceService.getLearningHistory(batchId),
    staleTime: 60 * 1000,
  });
}

export function useExportPerformanceMutation() {
  return useMutation<void, Error, PerformanceFilterParams | undefined>({
    mutationFn: (params) => performanceService.downloadCsv(params),
  });
}
