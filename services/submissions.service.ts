import type {
  AssignmentSubmissionDetails,
  AssignmentWithSubmissionStatus,
  CreateSubmissionInput,
  ListMyAssignmentsQuery,
  PaginatedAssignmentsResponse,
  SubmissionVersion,
} from '@/types/submissions';

import { apiClient } from './api.client';

interface ListApiResponse {
  data: AssignmentWithSubmissionStatus[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface DetailApiResponse {
  data: AssignmentSubmissionDetails;
}

interface SubmitApiResponse {
  data: SubmissionVersion;
}

export const submissionsService = {
  async getMyAssignments(
    query?: ListMyAssignmentsQuery,
    signal?: AbortSignal,
  ): Promise<PaginatedAssignmentsResponse> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (query?.page) params.page = query.page;
    if (query?.limit) params.limit = query.limit;
    if (query?.status) params.status = query.status;
    if (query?.courseId) params.courseId = query.courseId;

    const response = await apiClient<ListApiResponse>('/submissions/my-assignments', {
      params,
      ...(signal ? { signal } : {}),
    });

    return {
      items: response.data,
      total: response.meta.total,
      page: response.meta.page,
      limit: response.meta.limit,
      totalPages: response.meta.totalPages,
    };
  },

  async getAssignmentSubmissionDetails(
    assignmentId: string,
    signal?: AbortSignal,
  ): Promise<AssignmentSubmissionDetails> {
    const response = await apiClient<DetailApiResponse>(
      `/submissions/assignments/${assignmentId}`,
      signal ? { signal } : {},
    );

    return response.data;
  },

  async submitAssignment(input: CreateSubmissionInput): Promise<SubmissionVersion> {
    const response = await apiClient<SubmitApiResponse>('/submissions', {
      method: 'POST',
      body: JSON.stringify(input),
    });

    return response.data;
  },
};
