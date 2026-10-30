'use client';

import { useQuery } from '@tanstack/react-query';

import { dashboardService } from '@/services/dashboard.service';
import type {
  AdminDashboardData,
  MenteeDashboardData,
  MentorDashboardData,
} from '@/types/dashboard';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  admin: () => [...dashboardKeys.all, 'admin'] as const,
  mentor: () => [...dashboardKeys.all, 'mentor'] as const,
  mentee: () => [...dashboardKeys.all, 'mentee'] as const,
};

export function useAdminDashboard(options?: { enabled?: boolean }) {
  return useQuery<AdminDashboardData>({
    queryKey: dashboardKeys.admin(),
    queryFn: () => dashboardService.getAdminDashboard(),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useMentorDashboard(options?: { enabled?: boolean }) {
  return useQuery<MentorDashboardData>({
    queryKey: dashboardKeys.mentor(),
    queryFn: () => dashboardService.getMentorDashboard(),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useMenteeDashboard(options?: { enabled?: boolean }) {
  return useQuery<MenteeDashboardData>({
    queryKey: dashboardKeys.mentee(),
    queryFn: () => dashboardService.getMenteeDashboard(),
    staleTime: 60 * 1000,
    ...options,
  });
}
