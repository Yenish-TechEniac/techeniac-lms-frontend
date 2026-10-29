'use client';

import React, { useState } from 'react';

import { ADMIN_PERFORMANCE_NAV } from '@/components/app/navigation/portal-nav.config';
import {
  GradeDistributionChart,
  PerformanceFiltersBar,
  PerformanceMetricsCards,
  PerformanceTable,
} from '@/components/app/performance';
import { Header } from '@/components/layout/Header';
import { H1, P } from '@/components/ui/Typography';
import { useExportPerformanceMutation, usePerformanceQuery } from '@/hooks/usePerformance';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import type { PerformanceFilterParams } from '@/services/performance.service';

export default function AdminPerformancePage() {
  useRoleGuard('SUPER_ADMIN');

  const [filters, setFilters] = useState<PerformanceFilterParams>({
    page: 1,
    limit: 10,
    sortBy: 'name',
    sortOrder: 'DESC',
  });

  const { data, isLoading } = usePerformanceQuery(filters);
  const exportMutation = useExportPerformanceMutation();

  const handleFilterChange = (updated: Partial<PerformanceFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      sortBy: 'name',
      sortOrder: 'DESC',
    });
  };

  const handleExportCsv = () => {
    exportMutation.mutate(filters);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header {...ADMIN_PERFORMANCE_NAV} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <H1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Performance Analytics & Mentee Metrics
          </H1>
          <P className="mt-1 text-sm text-slate-500">
            System-wide curriculum performance, marks distribution, on-time delivery rates, and
            overdue monitoring (FR-11.1, FR-11.2, FR-11.6).
          </P>
        </div>

        <div className="flex flex-col gap-6">
          {/* KPI Metrics Summary Cards */}
          <PerformanceMetricsCards metrics={data?.metrics} isLoading={isLoading} />

          {/* Grade Scale Distribution Chart */}
          <GradeDistributionChart
            distribution={data?.metrics?.gradeDistribution}
            isLoading={isLoading}
          />

          {/* Filtering Toolbar */}
          <PerformanceFiltersBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onExportCsv={handleExportCsv}
            isExporting={exportMutation.isPending}
            onReset={handleResetFilters}
          />

          {/* Paginated Mentees Table */}
          <PerformanceTable
            mentees={data?.mentees ?? []}
            total={data?.pagination?.total ?? 0}
            page={data?.pagination?.page ?? 1}
            limit={data?.pagination?.limit ?? 10}
            totalPages={data?.pagination?.totalPages ?? 1}
            onPageChange={(page) => handleFilterChange({ page })}
            onLimitChange={(limit) => handleFilterChange({ limit, page: 1 })}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
}
