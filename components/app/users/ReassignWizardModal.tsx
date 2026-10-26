'use client';

import React, { useMemo, useState } from 'react';

import { Modal } from '@/components/patterns/Modal';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { P, Span } from '@/components/ui/Typography';
import { useBatchesMentors, useReassignMenteeMutation } from '@/hooks/useBatches';
import type { RoleImpactActiveMentee } from '@/services/users.service';

export interface ReassignWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceMentor: {
    id: string;
    name: string;
    email: string;
  };
  activeMentees: RoleImpactActiveMentee[];
  onComplete: () => void;
}

function MentorSelectionList({
  isLoading,
  isError,
  errorMessage,
  onRetry,
  mentors,
  selectedMentorId,
  onSelectMentor,
}: Readonly<{
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string | undefined;
  onRetry: () => void;
  mentors: Array<{ id: string; name: string; email: string; batchName: string }>;
  selectedMentorId: string | null;
  onSelectMentor: (id: string) => void;
}>) {
  if (isLoading) {
    return (
      <P className="py-6 text-center text-xs text-slate-400">
        Loading available mentors in batch...
      </P>
    );
  }

  if (isError) {
    return (
      <div className="space-y-2 rounded-xl border border-red-200 bg-red-50 p-4 text-center">
        <P className="text-xs font-semibold text-red-800">
          Failed to load available mentors in cohort
        </P>
        <P className="text-[11px] text-red-600">
          {errorMessage || 'A network error occurred while loading mentors.'}
        </P>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mx-auto mt-2"
        >
          Retry Fetch
        </Button>
      </div>
    );
  }

  if (mentors.length === 0) {
    return (
      <P className="rounded-xl border border-dashed border-amber-300 bg-amber-50/50 p-4 text-center text-xs text-amber-800">
        No alternative mentors found in this batch. Please add another mentor to the batch first.
      </P>
    );
  }

  return (
    <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
      {mentors.map((mentor) => {
        const isSelected = selectedMentorId === mentor.id;
        return (
          <Button
            key={mentor.id}
            type="button"
            variant="ghost"
            onClick={() => onSelectMentor(mentor.id)}
            className={`flex h-auto w-full cursor-pointer items-center justify-between rounded-xl border p-3 text-left transition-all ${
              isSelected
                ? 'border-blue-600 bg-blue-50/60 shadow-sm ring-1 ring-blue-600'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {mentor.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>
              <div>
                <Span className="block text-xs font-bold text-slate-900">{mentor.name}</Span>
                <Span className="block text-[11px] text-slate-500">{mentor.email}</Span>
              </div>
            </div>
            <Span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              Batch: {mentor.batchName}
            </Span>
          </Button>
        );
      })}
    </div>
  );
}

export function ReassignWizardModal({
  isOpen,
  onClose,
  sourceMentor,
  activeMentees,
  onComplete,
}: Readonly<ReassignWizardModalProps>) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedMenteeIds, setSelectedMenteeIds] = useState<string[]>(() =>
    activeMentees.map((m) => m.id),
  );
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);
  const [mentorSearch, setMentorSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const batchIds = useMemo(() => activeMentees.map((m) => m.batchId), [activeMentees]);
  const {
    data: rawMentors = [],
    isLoading: isLoadingMentors,
    isError: isErrorMentors,
    error: mentorsError,
    refetch: refetchMentors,
  } = useBatchesMentors(batchIds);

  const availableMentors = useMemo(
    () => rawMentors.filter((m) => m.id !== sourceMentor.id),
    [rawMentors, sourceMentor.id],
  );

  const reassignMutation = useReassignMenteeMutation();

  const toggleMentee = (menteeId: string) => {
    setSelectedMenteeIds((prev) =>
      prev.includes(menteeId) ? prev.filter((id) => id !== menteeId) : [...prev, menteeId],
    );
  };

  const filteredMentors = useMemo(() => {
    const q = mentorSearch.toLowerCase().trim();
    if (!q) return availableMentors;
    return availableMentors.filter(
      (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q),
    );
  }, [availableMentors, mentorSearch]);

  const handleConfirmReassign = async () => {
    if (!selectedMentorId || selectedMenteeIds.length === 0) return;

    setError(null);
    const selectedMentees = activeMentees.filter((m) => selectedMenteeIds.includes(m.id));

    const results = await Promise.allSettled(
      selectedMentees.map(async (mentee) => {
        await reassignMutation.mutateAsync({
          batchId: mentee.batchId,
          menteeId: mentee.id,
          newMentorId: selectedMentorId,
          reason: 'Mentor role transition reassignment wizard',
        });
        return mentee;
      }),
    );

    const failedMentees: Array<{ id: string; name: string; error: string }> = [];
    const succeededMenteeIds: string[] = [];

    results.forEach((res, index) => {
      const mentee = selectedMentees[index]!;
      if (res.status === 'fulfilled') {
        succeededMenteeIds.push(mentee.id);
      } else {
        const errorMsg =
          res.reason instanceof Error ? res.reason.message : 'Unknown reassignment failure';
        failedMentees.push({ id: mentee.id, name: mentee.name, error: errorMsg });
      }
    });

    if (failedMentees.length === 0) {
      onComplete();
      onClose();
    } else {
      setSelectedMenteeIds(failedMentees.map((f) => f.id));
      const failedNames = failedMentees.map((f) => f.name).join(', ');
      const successCount = succeededMenteeIds.length;
      const errorSummary =
        successCount > 0
          ? `Partially reassigned mentees: ${successCount} succeeded, but ${failedMentees.length} failed (${failedNames}). Click "Confirm Reassignment" to retry failed mentees.`
          : `Failed to reassign mentees (${failedNames}): ${failedMentees[0]?.error ?? 'Request rejected.'}`;
      setError(errorSummary);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reassign Mentees"
      description="Transfer mentee allocations and pending evaluations before changing role."
      size="lg"
      footer={
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Span className="font-semibold text-slate-700">
              {selectedMenteeIds.length} of {activeMentees.length}
            </Span>{' '}
            mentees selected
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={reassignMutation.isPending}
            >
              Cancel
            </Button>
            {step === 1 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setStep(2)}
                disabled={selectedMenteeIds.length === 0}
              >
                Next: Choose Mentor &rarr;
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep(1)}
                  disabled={reassignMutation.isPending}
                >
                  &larr; Back
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    void handleConfirmReassign();
                  }}
                  disabled={!selectedMentorId || reassignMutation.isPending}
                >
                  {reassignMutation.isPending ? 'Reassigning...' : 'Confirm Reassignment'}
                </Button>
              </>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {error ? <Alert variant="error" message={error} /> : null}

        {/* Step Indicator Header */}
        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
          <div
            className={`flex items-center gap-2 px-2 text-xs font-medium ${step === 1 ? 'font-semibold text-blue-600' : 'text-slate-500'}`}
          >
            <Span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${step === 1 ? 'bg-blue-600 text-white' : 'bg-emerald-100 text-emerald-700'}`}
            >
              1
            </Span>
            <Span>1. Review mentees ({activeMentees.length})</Span>
          </div>
          <Span className="text-slate-300">&rsaquo;</Span>
          <div
            className={`flex items-center gap-2 px-2 text-xs font-medium ${step === 2 ? 'font-semibold text-blue-600' : 'text-slate-400'}`}
          >
            <Span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${step === 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}
            >
              2
            </Span>
            <Span>2. Choose new mentor</Span>
          </div>
        </div>

        {/* Step 1: Select Mentees */}
        {step === 1 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Span className="text-xs font-semibold text-slate-700">
                Mentees mapped to {sourceMentor.name}
              </Span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (selectedMenteeIds.length === activeMentees.length) {
                    setSelectedMenteeIds([]);
                  } else {
                    setSelectedMenteeIds(activeMentees.map((m) => m.id));
                  }
                }}
                className="h-auto p-0 text-xs font-semibold text-blue-600 hover:bg-transparent hover:text-blue-800"
              >
                {selectedMenteeIds.length === activeMentees.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
              {activeMentees.map((mentee) => {
                const isChecked = selectedMenteeIds.includes(mentee.id);
                return (
                  <Label
                    key={mentee.id}
                    htmlFor={`reassign-mentee-${mentee.id}`}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-2.5 transition-all ${
                      isChecked
                        ? 'border-blue-300 bg-blue-50/50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`reassign-mentee-${mentee.id}`}
                        checked={isChecked}
                        onChange={() => toggleMentee(mentee.id)}
                      />
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-700">
                        {mentee.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                      </div>
                      <div>
                        <Span className="block text-xs font-semibold text-slate-800">
                          {mentee.name}
                        </Span>
                        <Span className="block text-[11px] text-slate-500">{mentee.email}</Span>
                      </div>
                    </div>
                    <Span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                      {mentee.batchName}
                    </Span>
                  </Label>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Choose Target Mentor */}
        {step === 2 && (
          <div className="space-y-3">
            <div>
              <Span className="mb-1 block text-xs font-semibold text-slate-700">
                Select target mentor
              </Span>
              <Input
                placeholder="Search mentors by name or email..."
                value={mentorSearch}
                onChange={(e) => setMentorSearch(e.target.value)}
              />
            </div>

            <MentorSelectionList
              isLoading={isLoadingMentors}
              isError={isErrorMentors}
              errorMessage={mentorsError instanceof Error ? mentorsError.message : undefined}
              onRetry={() => {
                void refetchMentors();
              }}
              mentors={filteredMentors}
              selectedMentorId={selectedMentorId}
              onSelectMentor={setSelectedMentorId}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
