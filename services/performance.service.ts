import { env } from '@/lib/config';

import { apiClient, type RequestOptions } from './api.client';

export interface GradeDistributionBucket {
  readonly count: number;
  readonly percentage: number;
}

export interface PerformanceOverviewMetrics {
  readonly averageMarks: number;
  readonly gradeDistribution: Record<'A+' | 'A' | 'B' | 'C' | 'D' | 'F', GradeDistributionBucket>;
  readonly onTimeRate: number;
  readonly completionPercentage: number;
  readonly overdueCount: number;
  readonly totalMentees: number;
  readonly totalSubmissions: number;
}

export interface MenteePerformanceRow {
  readonly menteeId: string;
  readonly menteeName: string;
  readonly menteeEmail: string;
  readonly batchId: string | null;
  readonly batchName: string | null;
  readonly assignedCoursesCount: number;
  readonly completedCoursesCount: number;
  readonly completionPercentage: number;
  readonly averageMarks: number | null;
  readonly totalSubmissions: number;
  readonly onTimeSubmissions: number;
  readonly onTimeRate: number;
  readonly overdueCount: number;
  readonly latestGrade: string | null;
}

export interface PaginatedPerformanceData {
  readonly metrics: PerformanceOverviewMetrics;
  readonly mentees: readonly MenteePerformanceRow[];
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly totalPages: number;
  };
}

export interface PerformanceFilterParams {
  readonly batchId?: string | undefined;
  readonly mentorId?: string | undefined;
  readonly courseId?: string | undefined;
  readonly startDate?: string | undefined;
  readonly endDate?: string | undefined;
  readonly gradeRange?: string | undefined;
  readonly status?: string | undefined;
  readonly search?: string | undefined;
  readonly page?: number | undefined;
  readonly limit?: number | undefined;
  readonly sortBy?:
    ('averageMarks' | 'completionPercentage' | 'onTimeRate' | 'overdueCount' | 'name') | undefined;
  readonly sortOrder?: ('ASC' | 'DESC') | undefined;
}

export interface LearningHistoryAssignment {
  readonly assignmentId: string;
  readonly assignmentTitle: string;
  readonly maxMarks: number;
  readonly passMarks: number;
  readonly version: number;
  readonly submittedAt: string;
  readonly isLate: boolean;
  readonly status: string;
  readonly marks: number | null;
  readonly gradeLabel: string | null;
  readonly feedback: string | null;
}

export interface LearningHistoryAllocation {
  readonly allocationId: string;
  readonly courseId: string;
  readonly courseTitle: string;
  readonly progressPercent: number;
  readonly status: string;
  readonly startDate: string;
  readonly dueDate: string;
  readonly completedAt: string | null;
  readonly assignments: readonly LearningHistoryAssignment[];
}

export interface LearningHistoryBatch {
  readonly batchId: string;
  readonly batchName: string;
  readonly status: string;
  readonly startDate: string;
  readonly endDate: string | null;
  readonly courseAllocations: readonly LearningHistoryAllocation[];
}

export interface LearningHistoryResult {
  readonly user: {
    readonly id: string;
    readonly name: string;
    readonly email: string;
  };
  readonly batches: readonly LearningHistoryBatch[];
  readonly summary: {
    readonly totalAllocations: number;
    readonly completedAllocations: number;
    readonly overallProgress: number;
    readonly averageMarks: number | null;
  };
}

export const performanceService = {
  async getPerformance(params?: PerformanceFilterParams): Promise<PaginatedPerformanceData> {
    const options: RequestOptions = {};
    if (params) {
      options.params = params as Record<string, string | number | boolean | undefined>;
    }
    const res = await apiClient<{ success: boolean; data: PaginatedPerformanceData }>(
      '/performance',
      options,
    );
    return res.data;
  },

  async getLearningHistory(batchId?: string): Promise<LearningHistoryResult> {
    const options: RequestOptions = {};
    if (batchId) {
      options.params = { batchId };
    }
    const res = await apiClient<{ success: boolean; data: LearningHistoryResult }>(
      '/me/learning-history',
      options,
    );
    return res.data;
  },

  async downloadCsv(params?: PerformanceFilterParams): Promise<void> {
    const searchParams = new URLSearchParams();
    searchParams.append('format', 'csv');
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && key !== 'page' && key !== 'limit') {
          searchParams.append(key, String(value));
        }
      }
    }

    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/performance/export?${searchParams.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `performance-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  },
};
