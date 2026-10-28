import { env } from '@/lib/config';
import { apiClient } from '@/services/api.client';
import type { User360FilterState, User360Profile } from '@/types/user-360';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const user360Service = {
  async getUser360(userId: string, filters: User360FilterState = {}): Promise<User360Profile> {
    const params: Record<string, string | number | undefined> = {};
    if (filters.rolePeriod) params.rolePeriod = filters.rolePeriod;
    if (filters.batchId) params.batchId = filters.batchId;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.auditType) params.auditType = filters.auditType;
    if (filters.tab) params.tab = filters.tab;

    const res = await apiClient<ApiResponse<User360Profile>>(`/users/${userId}/360`, {
      method: 'GET',
      params,
    });
    return res.data;
  },

  async downloadUser360Csv(userId: string, filters: User360FilterState = {}): Promise<void> {
    const query = new URLSearchParams();
    query.set('format', 'csv');
    if (filters.rolePeriod) query.set('rolePeriod', filters.rolePeriod);
    if (filters.batchId) query.set('batchId', filters.batchId);
    if (filters.startDate) query.set('startDate', filters.startDate);
    if (filters.endDate) query.set('endDate', filters.endDate);
    if (filters.auditType) query.set('auditType', filters.auditType);

    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/users/${userId}/360/export?${query.toString()}`;
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error(`Export failed with HTTP status ${res.status}`);
    }

    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `user-360-${userId}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },
};
