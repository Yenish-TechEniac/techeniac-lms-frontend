import { apiClient } from './api.client';

export type UserRole = 'SUPER_ADMIN' | 'MENTOR' | 'MENTEE';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  mustChangePassword: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: AuthUser;
    tokens: AuthTokens;
  };
}

export interface GetMeResponse {
  success: boolean;
  data: {
    user: AuthUser;
  };
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

export const authService = {
  async login(credentials: { email: string; password: string }): Promise<LoginResponse['data']> {
    const response = await apiClient<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient<MessageResponse>('/auth/logout', {
      method: 'POST',
    });
  },

  async getMe(): Promise<AuthUser> {
    const response = await apiClient<GetMeResponse>('/auth/me');
    return response.data.user;
  },

  async forgotPassword(email: string): Promise<string> {
    const response = await apiClient<MessageResponse>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return response.message;
  },

  async resetPassword(token: string, newPassword: string): Promise<string> {
    const response = await apiClient<MessageResponse>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
    return response.message;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<string> {
    const response = await apiClient<MessageResponse>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return response.message;
  },
};
