import { auditLogFilterSchema, type AuditLogsResponse, type AuditType } from '@/lib/validation';
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
}

export const auditService = {
  async getAuditLogs(filters: AuditQueryFilters = {}): Promise<AuditLogsResponse> {
    const validated = auditLogFilterSchema.parse(filters);
    const params: Record<string, string | number | undefined> = {};

    if (validated.page !== undefined) params.page = validated.page;
    if (validated.limit !== undefined) params.limit = validated.limit;
    if (validated.type !== undefined && (validated.type as string) !== 'ALL') {
      params.type = validated.type;
    }
    if (validated.actorId !== undefined) params.actorId = validated.actorId;
    if (validated.entity !== undefined) params.entity = validated.entity;
    if (validated.action !== undefined) params.action = validated.action;
    if (validated.startDate !== undefined) {
      params.startDate = `${validated.startDate}T00:00:00.000+05:30`;
    }
    if (validated.endDate !== undefined) {
      params.endDate = `${validated.endDate}T23:59:59.999+05:30`;
    }

    const res = await apiClient<AuditLogsResponse>('/audit-logs', {
      method: 'GET',
      params,
    });

    return res;
  },
};
