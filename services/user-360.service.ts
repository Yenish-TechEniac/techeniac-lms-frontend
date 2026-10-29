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
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.auditType) params.auditType = filters.auditType;

    const res = await apiClient<ApiResponse<User360Profile>>(`/users/${userId}/360`, {
      method: 'GET',
      params,
    });
    return res.data;
  },

  async downloadUser360Csv(userId: string, filters: User360FilterState = {}): Promise<void> {
    const params: Record<string, string | number | undefined> = {
      format: 'csv',
    };
    if (filters.rolePeriod) params.rolePeriod = filters.rolePeriod;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.auditType) params.auditType = filters.auditType;

    const blob = await apiClient<Blob>(`/users/${userId}/360/export`, {
      method: 'GET',
      params,
      responseType: 'blob',
    });

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
