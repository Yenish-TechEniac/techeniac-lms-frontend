'use client';

import React, { useMemo, useState } from 'react';

import { Modal } from '@/components/patterns/Modal';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { H3, P, Span } from '@/components/ui/Typography';
import { useCreateAllocationsMutation } from '@/hooks/useAllocations';
import { useBatchDetail, useBatchesList } from '@/hooks/useBatches';
import { useCourses } from '@/hooks/useCourses';
import { useUsers } from '@/hooks/useUsers';
import type {
  AllocationTargetType,
  CreateAllocationsResponse,
} from '@/services/allocations.service';

export interface AssignCourseModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly initialCourseId?: string | undefined;
  readonly userRole?: 'SUPER_ADMIN' | 'MENTOR' | undefined;
  readonly onSuccess?: (() => void) | undefined;
}

export function AssignCourseModal({
  isOpen,
  onClose,
  initialCourseId,
  userRole = 'SUPER_ADMIN',
  onSuccess,
}: AssignCourseModalProps) {
  // Wizard step: 1 = Course, 2 = Targets, 3 = Schedule & Review
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(initialCourseId ? 2 : 1);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialCourseId ?? '');
  const [targetType, setTargetType] = useState<AllocationTargetType>('BATCH');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [selectedMenteeIds, setSelectedMenteeIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>(
    () => new Date().toISOString().split('T')[0] ?? '',
  );
  const [dueDate, setDueDate] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<CreateAllocationsResponse | null>(null);

  // Queries
  const { courses, isLoading: isLoadingCourses } = useCourses();
  const { data: batchesData, isLoading: isLoadingBatches } = useBatchesList({ limit: 100 });
  const { data: batchDetailData } = useBatchDetail(selectedBatchId);
  const { users: allUsers, isLoading: isLoadingUsers } = useUsers(
    targetType === 'INDIVIDUAL_MENTEES' ? { role: 'MENTEE', status: 'ACTIVE', limit: 100 } : {},
  );

  const createMutation = useCreateAllocationsMutation();

  const activeCourses = useMemo(() => {
    return courses.filter((c) => c.isActive);
  }, [courses]);

  const activeBatches = useMemo(() => {
    return (batchesData?.items ?? []).filter((b) => b.status === 'LIVE' || b.status === 'DRAFT');
  }, [batchesData?.items]);

  const selectedCourse = useMemo(() => {
    return activeCourses.find((c) => c.id === selectedCourseId);
  }, [activeCourses, selectedCourseId]);

  // Update calculated due date preview if course has estimated minutes
  const estimatedDueDateText = useMemo(() => {
    if (!startDate || !selectedCourse?.estimatedMinutes) return null;
    const start = new Date(startDate);
    const due = new Date(start.getTime() + selectedCourse.estimatedMinutes * 60 * 1000);
    return due.toISOString().split('T')[0];
  }, [startDate, selectedCourse]);

  const availableBatchMentees = useMemo(() => {
    if (!batchDetailData?.members) return [];
    return batchDetailData.members
      .filter((m) => m.memberRole === 'MENTEE')
      .map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
      }));
  }, [batchDetailData]);

  const toggleMentee = (userId: string) => {
    setSelectedMenteeIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  const selectAllMentees = () => {
    if (targetType === 'SELECTED_MENTEES') {
      setSelectedMenteeIds(availableBatchMentees.map((m) => m.id));
    } else if (targetType === 'INDIVIDUAL_MENTEES') {
      setSelectedMenteeIds(allUsers.map((u) => u.id));
    }
  };

  const deselectAllMentees = () => {
    setSelectedMenteeIds([]);
  };

  const handleReset = () => {
    setCurrentStep(initialCourseId ? 2 : 1);
    setSelectedCourseId(initialCourseId ?? '');
    setTargetType('BATCH');
    setSelectedBatchId('');
    setSelectedMenteeIds([]);
    setDueDate('');
    setErrorMsg(null);
    setResult(null);
  };

  const handleNext = () => {
    setErrorMsg(null);
    if (currentStep === 1) {
      if (!selectedCourseId) {
        setErrorMsg('Please select an active course to allocate.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (targetType !== 'INDIVIDUAL_MENTEES' && !selectedBatchId) {
        setErrorMsg('Please select a target batch.');
        return;
      }
      if (
        (targetType === 'SELECTED_MENTEES' || targetType === 'INDIVIDUAL_MENTEES') &&
        selectedMenteeIds.length === 0
      ) {
        setErrorMsg('Please select at least one mentee.');
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 2 && !initialCourseId) {
      setCurrentStep(1);
    }
  };

  const handleSubmit = async () => {
    setErrorMsg(null);

    if (!selectedCourseId) {
      setErrorMsg('Please select a course to allocate.');
      return;
    }

    if (!startDate) {
      setErrorMsg('Start date is required.');
      return;
    }

    if (!dueDate && (!selectedCourse?.estimatedMinutes || selectedCourse.estimatedMinutes <= 0)) {
      setErrorMsg(
        'Due date is required because this course has no estimated duration (CRS-30, ALC-11).',
      );
      return;
    }

    if (dueDate && new Date(dueDate).getTime() < new Date(startDate).getTime()) {
      setErrorMsg('Due date cannot be earlier than start date (ALC-12).');
      return;
    }

    try {
      const res = await createMutation.mutateAsync({
        courseId: selectedCourseId,
        targetType,
        batchId: targetType !== 'INDIVIDUAL_MENTEES' ? selectedBatchId : undefined,
        menteeIds: targetType !== 'BATCH' ? selectedMenteeIds : undefined,
        startDate: new Date(startDate).toISOString(),
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      });

      setResult(res);
      onSuccess?.();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to allocate course');
    }
  };

  if (result) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={() => {
          handleReset();
          onClose();
        }}
        title="Course Allocation Completed"
        description="The course allocation request was successfully processed."
        size="md"
        footer={
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              handleReset();
              onClose();
            }}
          >
            Done
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <P className="text-sm font-semibold text-emerald-900">
              Successfully Created: {result.created.length} allocation(s)
            </P>
            <P className="mt-1 text-xs text-emerald-700">
              Course is now available for the allocated mentees.
            </P>
          </div>

          {result.skipped.length > 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <P className="text-sm font-semibold text-amber-900">
                Skipped Mentees: {result.skipped.length}
              </P>
              <P className="mt-0.5 text-xs text-amber-700">
                These mentees already hold an open allocation of this course and were safely skipped
                (ALC-13, ALC-21).
              </P>
              <ul className="mt-2 max-h-32 divide-y divide-amber-100 overflow-y-auto rounded-lg border border-amber-200/60 bg-white/70 text-xs text-amber-900">
                {result.skipped.map((s, idx) => (
                  <li key={idx} className="flex items-center justify-between p-2">
                    <span className="truncate font-mono text-[11px]">{s.menteeId}</span>
                    <span className="text-[10px] font-medium text-amber-700">{s.reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Course Deployment"
      description="Deploy curriculum track to cohorts and mentees with scheduled pacing (M7)."
      size="lg"
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <div>
            {currentStep > 1 && (!initialCourseId || currentStep === 3) ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBack}
                disabled={createMutation.isPending}
              >
                ← Back
              </Button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>

            {currentStep < 3 ? (
              <Button type="button" variant="primary" size="sm" onClick={handleNext}>
                Next Step →
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => void handleSubmit()}
                isLoading={createMutation.isPending}
              >
                Confirm & Deploy Course
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* 3-Step Wizard Indicator */}
        <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                1
              </div>
              <span
                className={`font-semibold ${
                  currentStep === 1 ? 'text-blue-600' : 'text-slate-600'
                }`}
              >
                Select Course
              </span>
            </div>

            <div className="mx-3 h-0.5 flex-1 bg-slate-200">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{
                  width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%',
                }}
              />
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                2
              </div>
              <span
                className={`font-semibold ${
                  currentStep === 2 ? 'text-blue-600' : 'text-slate-600'
                }`}
              >
                Targets
              </span>
            </div>

            <div className="mx-3 h-0.5 flex-1 bg-slate-200">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{
                  width: currentStep === 3 ? '100%' : '0%',
                }}
              />
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  currentStep === 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                3
              </div>
              <span
                className={`font-semibold ${
                  currentStep === 3 ? 'text-blue-600' : 'text-slate-600'
                }`}
              >
                Schedule & Review
              </span>
            </div>
          </div>
        </div>

        {errorMsg ? <Alert variant="error" title="Allocation Error" message={errorMsg} /> : null}

        {/* STEP 1: Select Course */}
        {currentStep === 1 ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="assign-course-select" required>
                Select Active Course
              </Label>
              <Select
                id="assign-course-select"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                disabled={Boolean(initialCourseId) || isLoadingCourses}
                className="w-full text-sm"
              >
                <option value="">-- Choose active curriculum --</option>
                {activeCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}{' '}
                    {c.estimatedMinutes
                      ? `(${Math.floor(c.estimatedMinutes / 60)}h ${c.estimatedMinutes % 60}m)`
                      : '(No duration estimate)'}
                  </option>
                ))}
              </Select>
            </div>

            {selectedCourse ? (
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                <H3 className="text-sm font-bold text-slate-900">{selectedCourse.title}</H3>
                <P className="mt-1 text-xs text-slate-600">
                  {selectedCourse.description || 'Enterprise curriculum module.'}
                </P>
                <div className="mt-3 flex items-center gap-4 font-mono text-xs text-slate-600">
                  <span>
                    Duration:{' '}
                    {selectedCourse.estimatedMinutes
                      ? `${Math.floor(selectedCourse.estimatedMinutes / 60)}h ${selectedCourse.estimatedMinutes % 60}m`
                      : 'Unspecified'}
                  </span>
                  <span>•</span>
                  <span>Status: Active</span>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* STEP 2: Targets Selection */}
        {currentStep === 2 ? (
          <div className="space-y-4">
            <div>
              <Label required>Target Scope</Label>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => {
                    setTargetType('BATCH');
                    setSelectedMenteeIds([]);
                  }}
                  className={`rounded-xl border p-3.5 text-left transition-all ${
                    targetType === 'BATCH'
                      ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-2 ring-blue-500'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <P className="text-sm font-semibold text-slate-900">Whole Batch</P>
                  <Span className="mt-0.5 block text-xs text-slate-500">
                    All active mentees enrolled in cohort
                  </Span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTargetType('SELECTED_MENTEES');
                    setSelectedMenteeIds([]);
                  }}
                  className={`rounded-xl border p-3.5 text-left transition-all ${
                    targetType === 'SELECTED_MENTEES'
                      ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-2 ring-blue-500'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <P className="text-sm font-semibold text-slate-900">Selected Mentees</P>
                  <Span className="mt-0.5 block text-xs text-slate-500">
                    Specific mentees inside a batch
                  </Span>
                </button>

                {userRole === 'SUPER_ADMIN' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setTargetType('INDIVIDUAL_MENTEES');
                      setSelectedBatchId('');
                      setSelectedMenteeIds([]);
                    }}
                    className={`rounded-xl border p-3.5 text-left transition-all ${
                      targetType === 'INDIVIDUAL_MENTEES'
                        ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-2 ring-blue-500'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <P className="text-sm font-semibold text-slate-900">Individual Mentees</P>
                    <Span className="mt-0.5 block text-xs text-slate-500">
                      Outside any batch (Admin only)
                    </Span>
                  </button>
                ) : null}
              </div>
            </div>

            {/* Target Batch Select */}
            {targetType !== 'INDIVIDUAL_MENTEES' ? (
              <div>
                <Label htmlFor="assign-batch-select" required>
                  Select Target Cohort / Batch
                </Label>
                <Select
                  id="assign-batch-select"
                  value={selectedBatchId}
                  onChange={(e) => {
                    setSelectedBatchId(e.target.value);
                    setSelectedMenteeIds([]);
                  }}
                  disabled={isLoadingBatches}
                  className="w-full text-sm"
                >
                  <option value="">-- Choose active or draft cohort --</option>
                  {activeBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code}) — {b.status}
                    </option>
                  ))}
                </Select>
                <P className="mt-1 text-xs text-slate-400">
                  Allocations to a Draft batch will be visible to mentees when the batch transitions
                  to Live (FR-7.1).
                </P>
              </div>
            ) : null}

            {/* Checkbox list for SELECTED_MENTEES */}
            {targetType === 'SELECTED_MENTEES' && selectedBatchId ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label required>Pick Mentees ({selectedMenteeIds.length} selected)</Label>
                  <div className="space-x-2 text-xs">
                    <button
                      type="button"
                      onClick={selectAllMentees}
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      Select all
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={deselectAllMentees}
                      className="text-slate-500 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                  {availableBatchMentees.length === 0 ? (
                    <P className="text-xs text-slate-400">No active mentees found in this batch.</P>
                  ) : (
                    availableBatchMentees.map((mentee) => (
                      <div key={mentee.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`batch-m-${mentee.id}`}
                          checked={selectedMenteeIds.includes(mentee.id)}
                          onChange={() => toggleMentee(mentee.id)}
                        />
                        <label
                          htmlFor={`batch-m-${mentee.id}`}
                          className="cursor-pointer text-xs font-medium text-slate-800"
                        >
                          {mentee.name} <span className="text-slate-400">({mentee.email})</span>
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : null}

            {/* Checkbox list for INDIVIDUAL_MENTEES */}
            {targetType === 'INDIVIDUAL_MENTEES' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label required>
                    Pick Independent Mentees ({selectedMenteeIds.length} selected)
                  </Label>
                  <div className="space-x-2 text-xs">
                    <button
                      type="button"
                      onClick={selectAllMentees}
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      Select all
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={deselectAllMentees}
                      className="text-slate-500 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                  {isLoadingUsers ? (
                    <P className="text-xs text-slate-400">Loading mentees...</P>
                  ) : allUsers.length === 0 ? (
                    <P className="text-xs text-slate-400">No active mentees available.</P>
                  ) : (
                    allUsers.map((mentee) => (
                      <div key={mentee.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`ind-m-${mentee.id}`}
                          checked={selectedMenteeIds.includes(mentee.id)}
                          onChange={() => toggleMentee(mentee.id)}
                        />
                        <label
                          htmlFor={`ind-m-${mentee.id}`}
                          className="cursor-pointer text-xs font-medium text-slate-800"
                        >
                          {mentee.name} <span className="text-slate-400">({mentee.email})</span>
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* STEP 3: Schedule & Review */}
        {currentStep === 3 ? (
          <div className="space-y-5">
            {/* Summary card */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <Span className="font-mono text-[10px] font-bold tracking-wider text-blue-600 uppercase">
                    Target Deployment
                  </Span>
                  <H3 className="mt-0.5 text-base font-bold text-slate-900">
                    {selectedCourse?.title ?? 'Selected Course'}
                  </H3>
                </div>
                <Span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {targetType === 'BATCH'
                    ? 'Whole Cohort'
                    : targetType === 'SELECTED_MENTEES'
                      ? `${selectedMenteeIds.length} Mentees in Batch`
                      : `${selectedMenteeIds.length} Independent Mentees`}
                </Span>
              </div>
            </div>

            {/* Date Inputs */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="assign-start-date" required>
                  Start Date
                </Label>
                <Input
                  id="assign-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-sm"
                />
              </div>

              <div>
                <Label htmlFor="assign-due-date">
                  Due Date {selectedCourse?.estimatedMinutes ? '(Auto-prefilled)' : '(Required)'}
                </Label>
                <Input
                  id="assign-due-date"
                  type="date"
                  value={dueDate || (estimatedDueDateText ?? '')}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-sm"
                />
                {estimatedDueDateText && !dueDate ? (
                  <P className="mt-1 text-xs text-slate-500">
                    Prefilled with start + estimated duration ({estimatedDueDateText})
                  </P>
                ) : null}
              </div>
            </div>

            <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600">
              <P className="font-semibold text-slate-800">Deployment Policy Notice:</P>
              <P>
                • Mentees who already hold an open allocation of this course will be safely skipped
                (ALC-13).
              </P>
              <P>
                • Creating this allocation automatically inserts topic progress rows for all active
                course topics (M8).
              </P>
              <P>• Mentees will receive automated allocation welcome emails with their due date.</P>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
