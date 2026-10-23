import type { BatchStatus, CreateBatchFormData } from '@/lib/validation';
import { apiClient } from '@/services/api.client';

export interface ApiBatchSummary {
  id: string;
  name: string;
  code: string;
  status: BatchStatus;
  startDate: string;
  endDate: string;
  menteesCount?: number;
  mentorsCount?: number;
  coursesCount?: number;
  progressPercent?: number;
}

export interface ApiBatchMemberUser {
  id: string;
  name: string;
  email: string;
}

export interface ApiBatchMemberItem {
  id: string;
  name: string;
  email: string;
  memberRole: 'MENTOR' | 'MENTEE';
  mappedToName?: string | undefined;
  joinedAt: string;
}

export interface ApiAllocatedCourseItem {
  id: string;
  title: string;
  dueDate: string;
  averageProgress: number;
  status: string;
}

export interface ApiStatusHistoryEntry {
  id: string;
  fromStatus: BatchStatus;
  toStatus: BatchStatus;
  changedBy: string;
  changedAt: string;
  reason?: string | undefined;
}

export interface ApiBatchDetailData {
  id: string;
  name: string;
  code: string;
  status: BatchStatus;
  startDate: string;
  endDate: string;
  description?: string | undefined;
  members: ApiBatchMemberItem[];
  courses: ApiAllocatedCourseItem[];
  history: ApiStatusHistoryEntry[];
}

export interface BatchQueryFilters {
  status?: string | undefined;
  search?: string | undefined;
  limit?: number | undefined;
  page?: number | undefined;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const batchesService = {
  async listBatches(filters: BatchQueryFilters = {}): Promise<ApiBatchSummary[]> {
    const params: Record<string, string | number | undefined> = {};
    if (filters.status && filters.status !== 'ALL') {
      params.status = filters.status;
    }
    if (filters.search) {
      params.search = filters.search.trim();
    }
    if (filters.limit) {
      params.limit = filters.limit;
    }
    if (filters.page) {
      params.page = filters.page;
    }

    const res = await apiClient<
      ApiResponse<
        | ApiBatchSummary[]
        | {
            items: ApiBatchSummary[];
            pagination?: { page: number; limit: number; total: number; totalPages: number };
          }
      >
    >('/batches', {
      method: 'GET',
      params,
    });

    if (Array.isArray(res.data)) {
      return res.data;
    }
    if (res.data && Array.isArray(res.data.items)) {
      return res.data.items;
    }
    return [];
  },

  async getBatchById(id: string): Promise<ApiBatchDetailData> {
    const res = await apiClient<
      ApiResponse<{
        batch: {
          id: string;
          name: string;
          code: string;
          status: BatchStatus;
          startDate: string;
          endDate: string;
          description?: string;
        };
        mentors: Array<{
          id: string;
          user?: ApiBatchMemberUser;
          createdAt: string;
        }>;
        mentees: Array<{
          id: string;
          user?: ApiBatchMemberUser;
          mappedToUser?: { id: string; name: string };
          createdAt: string;
        }>;
        statusHistory: Array<{
          id: string;
          fromStatus: BatchStatus;
          toStatus: BatchStatus;
          reason?: string;
          createdAt: string;
          changedByUser?: { name: string };
        }>;
      }>
    >(`/batches/${id}`, {
      method: 'GET',
    });

    const b = res.data.batch;
    const members: ApiBatchMemberItem[] = [
      ...(res.data.mentors ?? []).map((m) => ({
        id: m.user?.id ?? m.id,
        name: m.user?.name ?? 'Unknown Mentor',
        email: m.user?.email ?? '',
        memberRole: 'MENTOR' as const,
        joinedAt: m.createdAt.slice(0, 10),
      })),
      ...(res.data.mentees ?? []).map((m) => ({
        id: m.user?.id ?? m.id,
        name: m.user?.name ?? 'Unknown Mentee',
        email: m.user?.email ?? '',
        memberRole: 'MENTEE' as const,
        mappedToName: m.mappedToUser?.name,
        joinedAt: m.createdAt.slice(0, 10),
      })),
    ];

    const history: ApiStatusHistoryEntry[] = (res.data.statusHistory ?? []).map((h) => ({
      id: h.id,
      fromStatus: h.fromStatus,
      toStatus: h.toStatus,
      changedBy: h.changedByUser?.name ?? 'Super Admin',
      changedAt: h.createdAt.slice(0, 10),
      reason: h.reason,
    }));

    return {
      id: b.id,
      name: b.name,
      code: b.code,
      status: b.status,
      startDate: b.startDate,
      endDate: b.endDate,
      description: b.description,
      members,
      courses: [],
      history,
    };
  },

  async createBatch(
    data: CreateBatchFormData,
  ): Promise<{ id: string; name: string; code: string }> {
    const res = await apiClient<ApiResponse<{ batch: { id: string; name: string; code: string } }>>(
      '/batches',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
    return res.data.batch;
  },

  async updateBatchStatus(
    id: string,
    data: { newStatus: BatchStatus; reason?: string | undefined },
  ): Promise<void> {
    await apiClient<ApiResponse<unknown>>(`/batches/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({
        toStatus: data.newStatus,
        reason: data.reason || undefined,
      }),
    });
  },

  async transferMentee(
    sourceBatchId: string,
    data: { menteeId: string; targetBatchId: string; reason?: string | undefined },
  ): Promise<void> {
    await apiClient<ApiResponse<unknown>>(`/batches/${sourceBatchId}/transfer-mentee`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async addMembers(
    batchId: string,
    data: { userIds: string[]; memberRole: 'MENTOR' | 'MENTEE' },
  ): Promise<void> {
    await apiClient<ApiResponse<unknown>>(`/batches/${batchId}/members`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async removeMember(batchId: string, userId: string): Promise<void> {
    await apiClient<ApiResponse<unknown>>(`/batches/${batchId}/members/${userId}`, {
      method: 'DELETE',
    });
  },
};
