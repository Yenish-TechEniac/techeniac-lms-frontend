'use client';

import { useContext } from 'react';

import { AuthContext, type AuthContextValue } from '@/context/AuthContext';
import { authService } from '@/services/auth.service';

export interface UseAuthReturn extends AuthContextValue {
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (token: string, newPassword: string) => Promise<string>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<string>;
}

export function useAuth(): UseAuthReturn {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const forgotPassword = async (email: string): Promise<string> => {
    return authService.forgotPassword(email);
  };

  const resetPassword = async (token: string, newPassword: string): Promise<string> => {
    return authService.resetPassword(token, newPassword);
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<string> => {
    return authService.changePassword(currentPassword, newPassword);
  };

  return {
    ...context,
    forgotPassword,
    resetPassword,
    changePassword,
  };
}
