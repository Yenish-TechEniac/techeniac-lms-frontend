'use client';

import React, { useId, useMemo, useState } from 'react';

import { Modal } from '@/components/patterns/Modal';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { H3, H4, Muted, P, Span } from '@/components/ui/Typography';
import {
  useGradeSubmissionMutation,
  useRequestResubmissionMutation,
  useReviewDetails,
} from '@/hooks/useGrading';
import { formatDateIST } from '@/lib/date';
import {
  calculateGradeLabel,
  type SubmissionReviewDetails,
  SubmissionStatus,
} from '@/types/grading';
import { AssignmentDerivedStatus } from '@/types/submissions';

import { SubmissionStatusBadge } from './SubmissionStatusBadge';

interface SubmissionReviewContentProps {
  readonly reviewDetails: SubmissionReviewDetails;
}

function SubmissionReviewContent({ reviewDetails }: SubmissionReviewContentProps) {
  const marksInputId = useId();
  const feedbackInputId = useId();
  const resubmitInputId = useId();

  const gradeMutation = useGradeSubmissionMutation();
  const resubmitMutation = useRequestResubmissionMutation();

  const [activeTab, setActiveTab] = useState<'grade' | 'resubmit'>('grade');
  const [marks, setMarks] = useState<string>(
    reviewDetails.grading.marks !== null ? String(reviewDetails.grading.marks) : '',
  );
  const [feedback, setFeedback] = useState<string>(reviewDetails.grading.feedback ?? '');
  const [resubmitFeedback, setResubmitFeedback] = useState<string>('');
  const [isEditingExisting, setIsEditingExisting] = useState<boolean>(
    reviewDetails.grading.marks === null,
  );
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const maxMarks = reviewDetails.maxMarks;
  const numMarks = marks.trim() === '' ? null : Number(marks);

  const previewGradeLabel = useMemo(() => {
    if (numMarks === null || isNaN(numMarks)) return null;
    return calculateGradeLabel(numMarks, maxMarks);
  }, [numMarks, maxMarks]);

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numMarks === null || isNaN(numMarks)) return;

    try {
      await gradeMutation.mutateAsync({
        submissionId: reviewDetails.id,
        payload: {
          marks: numMarks,
          feedback: feedback.trim() || null,
        },
      });
      setActionSuccess('Grade submitted successfully');
      setIsEditingExisting(false);
    } catch {
      // Handled by mutation error state
    }
  };

  const handleResubmitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resubmitFeedback.trim()) return;

    try {
      await resubmitMutation.mutateAsync({
        submissionId: reviewDetails.id,
        payload: {
          feedback: resubmitFeedback.trim(),
        },
      });
      setActionSuccess('Resubmission requested successfully');
    } catch {
      // Handled by mutation error state
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Metadata Banner */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <div className="flex items-center gap-2">
              <H3 className="text-lg font-bold text-slate-900">{reviewDetails.assignmentTitle}</H3>
              <Span className="rounded bg-slate-200 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700">
                v{reviewDetails.version}
              </Span>
            </div>
            <P className="mt-1 text-xs text-slate-500">
              Course: <strong className="text-slate-700">{reviewDetails.courseTitle}</strong>
              {reviewDetails.topicTitle && ` • Topic: ${reviewDetails.topicTitle}`}
              {reviewDetails.batchName && ` • Batch: ${reviewDetails.batchName}`}
            </P>
            <P className="mt-0.5 text-xs text-slate-600">
              Student: <strong className="text-slate-900">{reviewDetails.mentee.name}</strong> (
              {reviewDetails.mentee.email})
            </P>
          </div>

          <div className="flex flex-col items-start gap-1 sm:items-end">
            <SubmissionStatusBadge
              status={reviewDetails.status as unknown as AssignmentDerivedStatus}
              isLate={reviewDetails.isLate}
            />
            <Muted className="font-mono text-[11px]">
              Submitted: {formatDateIST(reviewDetails.submittedAt)}
            </Muted>
          </div>
        </div>

        {reviewDetails.instructions && (
          <div className="mt-4 border-t border-slate-200/70 pt-3">
            <H4 className="font-mono text-xs font-bold text-slate-700 uppercase">
              Assignment Instructions
            </H4>
            <P className="mt-1 text-xs whitespace-pre-wrap text-slate-600">
              {reviewDetails.instructions}
            </P>
          </div>
        )}
      </div>

      {/* Submitted Artifacts Section (FR-10.4) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <H4 className="font-mono text-xs font-bold tracking-wider text-slate-700 uppercase">
          Submitted Artifacts & Links
        </H4>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Web Link */}
          {reviewDetails.submissionData.linkUrl ? (
            <div className="flex flex-col gap-1 rounded-xl border border-blue-200 bg-blue-50/50 p-3">
              <Span className="font-mono text-[11px] font-bold text-blue-700 uppercase">
                Project / Git URL
              </Span>
              <a
                href={reviewDetails.submissionData.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate font-mono text-xs text-blue-600 underline hover:text-blue-800"
              >
                {reviewDetails.submissionData.linkUrl} ↗
              </a>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-3 text-center">
              <Muted className="text-xs">No web link submitted</Muted>
            </div>
          )}

          {/* PDF Document */}
          {reviewDetails.submissionData.pdfUrl ? (
            <div className="flex flex-col gap-1 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
              <Span className="font-mono text-[11px] font-bold text-emerald-700 uppercase">
                PDF Document
              </Span>
              <a
                href={reviewDetails.submissionData.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate font-mono text-xs text-emerald-600 underline hover:text-emerald-800"
              >
                Download PDF 📄
              </a>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-3 text-center">
              <Muted className="text-xs">No PDF submitted</Muted>
            </div>
          )}

          {/* ZIP Archive */}
          {reviewDetails.submissionData.zipUrl ? (
            <div className="flex flex-col gap-1 rounded-xl border border-purple-200 bg-purple-50/50 p-3">
              <Span className="font-mono text-[11px] font-bold text-purple-700 uppercase">
                ZIP Archive
              </Span>
              <a
                href={reviewDetails.submissionData.zipUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate font-mono text-xs text-purple-600 underline hover:text-purple-800"
              >
                Download ZIP 📦
              </a>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-3 text-center">
              <Muted className="text-xs">No ZIP submitted</Muted>
            </div>
          )}
        </div>
      </div>

      {/* Action Success / Error Alerts */}
      {actionSuccess && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800"
        >
          <span>✓</span>
          <span>{actionSuccess}</span>
        </div>
      )}

      {gradeMutation.isError && (
        <ErrorMessage title="Grading failed" error={gradeMutation.error} className="mt-2" />
      )}

      {resubmitMutation.isError && (
        <ErrorMessage
          title="Resubmission request failed"
          error={resubmitMutation.error}
          className="mt-2"
        />
      )}

      {/* Existing Grade Card (if already graded and not currently editing) */}
      {reviewDetails.status === SubmissionStatus.GRADED && !isEditingExisting && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5">
          <div className="flex items-center justify-between">
            <div>
              <Span className="font-mono text-[11px] font-bold text-emerald-700 uppercase">
                Assigned Grade
              </Span>
              <H3 className="mt-1 text-2xl font-bold text-slate-900">
                {reviewDetails.grading.marks} / {reviewDetails.maxMarks} Marks (
                {reviewDetails.grading.gradeLabel})
              </H3>
              {reviewDetails.grading.feedback && (
                <P className="mt-2 text-xs whitespace-pre-wrap text-slate-700">
                  Feedback: {reviewDetails.grading.feedback}
                </P>
              )}
              {reviewDetails.grading.gradedAt && (
                <Muted className="mt-2 block font-mono text-[10.5px]">
                  Graded on: {formatDateIST(reviewDetails.grading.gradedAt)}
                </Muted>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditingExisting(true)}
              className="border-emerald-300 text-xs text-emerald-700 hover:bg-emerald-100"
            >
              Edit Grade (REV-09)
            </Button>
          </div>
        </div>
      )}

      {/* Grading & Resubmission Controls */}
      {(reviewDetails.status !== SubmissionStatus.GRADED || isEditingExisting) && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          {/* Tab Selector */}
          <div className="mb-4 flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('grade')}
              className={`border-b-2 px-4 py-2 text-xs font-semibold transition-colors ${
                activeTab === 'grade'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Grade Submission (FR-10.5)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('resubmit')}
              className={`border-b-2 px-4 py-2 text-xs font-semibold transition-colors ${
                activeTab === 'resubmit'
                  ? 'border-amber-600 text-amber-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Request Resubmission (REV-13)
            </button>
          </div>

          {/* Grade Form Tab */}
          {activeTab === 'grade' && (
            <form onSubmit={(e) => void handleGradeSubmit(e)} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={marksInputId} className="text-xs font-semibold text-slate-700">
                    Marks (Max: {reviewDetails.maxMarks}) *
                  </Label>
                  <Input
                    id={marksInputId}
                    type="number"
                    min={0}
                    max={reviewDetails.maxMarks}
                    step="0.5"
                    required
                    value={marks}
                    onChange={(e) => setMarks(e.target.value)}
                    placeholder={`0 to ${reviewDetails.maxMarks}`}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="flex flex-col justify-end gap-1.5">
                  <Span className="text-xs font-semibold text-slate-700">Computed Grade Label</Span>
                  <div className="flex h-9 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 font-mono text-xs font-bold text-slate-800">
                    {previewGradeLabel ? `Grade: ${previewGradeLabel}` : '—'}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor={feedbackInputId} className="text-xs font-semibold text-slate-700">
                  Constructive Feedback (optional)
                </Label>
                <textarea
                  id={feedbackInputId}
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Add guidance, praise, or code review points for the mentee..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  maxLength={5000}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                {isEditingExisting && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingExisting(false)}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={gradeMutation.isPending || numMarks === null || isNaN(numMarks)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {gradeMutation.isPending ? 'Saving Grade...' : 'Save & Publish Grade ✓'}
                </Button>
              </div>
            </form>
          )}

          {/* Resubmit Form Tab */}
          {activeTab === 'resubmit' && (
            <form onSubmit={(e) => void handleResubmitSubmit(e)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={resubmitInputId} className="text-xs font-semibold text-slate-700">
                  Reason for Resubmission Request *
                </Label>
                <textarea
                  id={resubmitInputId}
                  rows={4}
                  required
                  value={resubmitFeedback}
                  onChange={(e) => setResubmitFeedback(e.target.value)}
                  placeholder="Explain specifically what requirements were missed and what changes are required before re-grading..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
                  maxLength={5000}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={resubmitMutation.isPending || !resubmitFeedback.trim()}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  {resubmitMutation.isPending
                    ? 'Requesting...'
                    : 'Request Resubmission from Mentee ↺'}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export interface SubmissionReviewModalProps {
  readonly submissionId: string | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function SubmissionReviewModal({
  submissionId,
  isOpen,
  onClose,
}: SubmissionReviewModalProps) {
  const { reviewDetails, isLoading, error: reviewError } = useReviewDetails(submissionId, isOpen);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assignment Review & Grading" size="xl">
      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <P className="text-sm text-slate-500">Loading submission details...</P>
        </div>
      )}

      {reviewError && (
        <ErrorMessage
          title="Could not load submission details"
          error={reviewError}
          className="my-4"
        />
      )}

      {reviewDetails && (
        <SubmissionReviewContent
          key={`${reviewDetails.id}-${reviewDetails.version}`}
          reviewDetails={reviewDetails}
        />
      )}
    </Modal>
  );
}
