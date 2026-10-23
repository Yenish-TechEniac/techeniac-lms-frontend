'use client';

import React, { useMemo, useState } from 'react';

import { Modal } from '@/components/patterns/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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

export function ReassignWizardModal({
  isOpen,
  onClose,
  sourceMentor,
  activeMentees,
  onComplete,
}: ReassignWizardModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedMenteeIds, setSelectedMenteeIds] = useState<string[]>(() =>
    activeMentees.map((m) => m.id),
  );
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);
  const [mentorSearch, setMentorSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const batchIds = useMemo(() => activeMentees.map((m) => m.batchId), [activeMentees]);
  const { data: rawMentors = [], isLoading: isLoadingMentors } = useBatchesMentors(batchIds);

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
    try {
      const selectedMentees = activeMentees.filter((m) => selectedMenteeIds.includes(m.id));

      for (const mentee of selectedMentees) {
        await reassignMutation.mutateAsync({
          batchId: mentee.batchId,
          menteeId: mentee.id,
          newMentorId: selectedMentorId,
          reason: 'Mentor role transition reassignment wizard',
        });
      }

      onComplete();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reassign mentees';
      setError(message);
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
        {error ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700"
          >
            <Span className="font-bold">Error:</Span>
            <Span>{error}</Span>
          </div>
        ) : null}

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
              <button
                type="button"
                onClick={() => {
                  if (selectedMenteeIds.length === activeMentees.length) {
                    setSelectedMenteeIds([]);
                  } else {
                    setSelectedMenteeIds(activeMentees.map((m) => m.id));
                  }
                }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                {selectedMenteeIds.length === activeMentees.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
              {activeMentees.map((mentee) => {
                const isChecked = selectedMenteeIds.includes(mentee.id);
                return (
                  <label
                    key={mentee.id}
                    onClick={() => toggleMentee(mentee.id)}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-2.5 transition-all ${
                      isChecked
                        ? 'border-blue-300 bg-blue-50/50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
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
                  </label>
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

            {isLoadingMentors ? (
              <P className="py-6 text-center text-xs text-slate-400">
                Loading available mentors in batch...
              </P>
            ) : filteredMentors.length === 0 ? (
              <P className="rounded-xl border border-dashed border-amber-300 bg-amber-50/50 p-4 text-center text-xs text-amber-800">
                No alternative mentors found in this batch. Please add another mentor to the batch
                first.
              </P>
            ) : (
              <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
                {filteredMentors.map((mentor) => {
                  const isSelected = selectedMentorId === mentor.id;
                  return (
                    <div
                      key={mentor.id}
                      onClick={() => setSelectedMentorId(mentor.id)}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
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
                          <Span className="block text-xs font-bold text-slate-900">
                            {mentor.name}
                          </Span>
                          <Span className="block text-[11px] text-slate-500">{mentor.email}</Span>
                        </div>
                      </div>
                      <Span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        Batch: {mentor.batchName}
                      </Span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
