import type { ChangeRoleFormData, CreateUserFormData, EditUserFormData } from '@/lib/validation';
import { apiClient } from '@/services/api.client';

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'MENTOR' | 'MENTEE';
  isActive: boolean;
  tokenVersion: number;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserQueryFilters {
  page?: number | undefined;
  limit?: number | undefined;
  role?: string | undefined;
  status?: string | undefined;
  search?: string | undefined;
}

export interface RoleImpactData {
  userId: string;
  name: string;
  email: string;
  currentRole: string;
  newRole: string;
  isSameRole: boolean;
  willRevokeSessions: boolean;
  impactSummary: string;
}

export interface UserDirectoryCounts {
  total: number;
  active: number;
  inactive: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const usersService = {
  async listUsers(filters: UserQueryFilters = {}): Promise<{
    users: ApiUser[];
    total: number;
    counts?: UserDirectoryCounts;
  }> {
    const params: Record<string, string | number | undefined> = {};
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;
    if (filters.role && filters.role !== 'ALL') params.role = filters.role;
    if (filters.status && filters.status !== 'ALL') {
      params.status = filters.status.toLowerCase();
    }
    if (filters.search) params.search = filters.search;

    const res = await apiClient<
      ApiResponse<{ users: ApiUser[]; total: number; counts?: UserDirectoryCounts }>
    >('/users', {
      method: 'GET',
      params,
    });
    return res.data;
  },

  async createUser(data: CreateUserFormData): Promise<ApiUser> {
    const res = await apiClient<ApiResponse<ApiUser>>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async updateUser(id: string, data: Partial<EditUserFormData>): Promise<ApiUser> {
    const res = await apiClient<ApiResponse<ApiUser>>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async changeRole(id: string, data: ChangeRoleFormData): Promise<ApiUser> {
    const res = await apiClient<ApiResponse<{ user: ApiUser }>>(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return res.data.user;
  },

  async getRoleImpact(id: string, newRole: string): Promise<RoleImpactData> {
    const res = await apiClient<ApiResponse<RoleImpactData>>(`/users/${id}/role-impact`, {
      method: 'GET',
      params: { newRole },
    });
    return res.data;
  },

  async toggleStatus(id: string, activate: boolean): Promise<ApiUser> {
    const action = activate ? 'activate' : 'deactivate';
    const res = await apiClient<ApiResponse<ApiUser>>(`/users/${id}/${action}`, {
      method: 'PATCH',
    });
    return res.data;
  },

  async resendInvite(id: string): Promise<{ message: string }> {
    const res = await apiClient<ApiResponse<{ message: string }>>(`/users/${id}/resend-invite`, {
      method: 'POST',
    });
    return res.data;
  },
};
