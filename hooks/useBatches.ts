'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { BatchStatus, CreateBatchFormData } from '@/lib/validation';
import {
  type ApiBatchDetailData,
  type ApiBatchSummary,
  batchesService,
  type BatchQueryFilters,
} from '@/services/batches.service';

export const batchKeys = {
  all: ['batches'] as const,
  lists: () => [...batchKeys.all, 'list'] as const,
  list: (filters: BatchQueryFilters) => [...batchKeys.lists(), filters] as const,
  details: () => [...batchKeys.all, 'detail'] as const,
  detail: (id: string) => [...batchKeys.details(), id] as const,
  available: () => [...batchKeys.all, 'available'] as const,
};

export function useBatchesList(filters: BatchQueryFilters = {}) {
  return useQuery<ApiBatchSummary[]>({
    queryKey: batchKeys.list(filters),
    queryFn: () => batchesService.listBatches(filters),
  });
}

export function useBatchDetail(id: string, initialData?: ApiBatchDetailData) {
  return useQuery<ApiBatchDetailData>({
    queryKey: batchKeys.detail(id),
    queryFn: () => batchesService.getBatchById(id),
    ...(initialData ? { initialData } : {}),
    enabled: Boolean(id),
  });
}

export function useAvailableBatches() {
  return useQuery<ApiBatchSummary[]>({
    queryKey: batchKeys.available(),
    queryFn: () => batchesService.listBatches({ limit: 100 }),
    staleTime: 5 * 60_000,
  });
}

export function useCreateBatchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBatchFormData) => batchesService.createBatch(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: batchKeys.all });
    },
  });
}

export function useUpdateBatchStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: {
      batchId: string;
      newStatus: BatchStatus;
      reason?: string | undefined;
    }) =>
      batchesService.updateBatchStatus(variables.batchId, {
        newStatus: variables.newStatus,
        reason: variables.reason,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: batchKeys.all });
    },
  });
}

export function useTransferMenteeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: {
      sourceBatchId: string;
      menteeId: string;
      targetBatchId: string;
      reason?: string | undefined;
    }) =>
      batchesService.transferMentee(variables.sourceBatchId, {
        menteeId: variables.menteeId,
        targetBatchId: variables.targetBatchId,
        reason: variables.reason,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: batchKeys.all });
    },
  });
}

export function useAddBatchMembersMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: {
      batchId: string;
      userIds: string[];
      memberRole: 'MENTOR' | 'MENTEE';
    }) =>
      batchesService.addMembers(variables.batchId, {
        userIds: variables.userIds,
        memberRole: variables.memberRole,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: batchKeys.all });
    },
  });
}

export function useRemoveBatchMemberMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { batchId: string; userId: string }) =>
      batchesService.removeMember(variables.batchId, variables.userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: batchKeys.all });
    },
  });
}
