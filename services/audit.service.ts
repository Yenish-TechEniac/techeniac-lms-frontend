import type { AuditLogsResponse, AuditType } from '@/lib/validation';
import { apiClient } from '@/services/api.client';

export interface AuditQueryFilters {
  page?: number | undefined;
  limit?: number | undefined;
  type?: AuditType | 'ALL' | undefined;
  actorId?: string | undefined;
  entity?: string | undefined;
  action?: string | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
  search?: string | undefined;
}

export const auditService = {
  async getAuditLogs(filters: AuditQueryFilters = {}): Promise<AuditLogsResponse> {
    const params: Record<string, string | number | undefined> = {};

    if (filters.page !== undefined) params.page = filters.page;
    if (filters.limit !== undefined) params.limit = filters.limit;
    if (filters.type !== undefined && filters.type !== 'ALL') params.type = filters.type;
    if (filters.actorId !== undefined) params.actorId = filters.actorId;
    if (filters.entity !== undefined) params.entity = filters.entity;
    if (filters.action !== undefined) params.action = filters.action;
    if (filters.startDate !== undefined) params.startDate = filters.startDate;
    if (filters.endDate !== undefined) params.endDate = filters.endDate;
    if (filters.search !== undefined) {
      params.action = filters.search;
    }

    const res = await apiClient<AuditLogsResponse>('/audit-logs', {
      method: 'GET',
      params,
    });

    return res;
  },
};
