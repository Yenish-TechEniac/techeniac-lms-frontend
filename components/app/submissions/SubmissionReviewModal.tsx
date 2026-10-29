'use client';

import React, { useId, useMemo, useRef, useState } from 'react';

import { Modal } from '@/components/patterns/Modal';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { H3, H4, P, Span } from '@/components/ui/Typography';
import {
  useGradeSubmissionMutation,
  useRequestResubmissionMutation,
  useReviewDetails,
} from '@/hooks/useGrading';
import { formatDateIST } from '@/lib/date';
import { ApiError } from '@/lib/errors';
import { isSafeHttpUrl } from '@/lib/url';
import {
  calculateGradeLabel,
  type SubmissionReviewDetails,
  SubmissionStatus,
} from '@/types/grading';

import { SubmissionStatusBadge } from './SubmissionStatusBadge';

interface SubmissionReviewContentProps {
  readonly reviewDetails: SubmissionReviewDetails;
  readonly onRefetch?: () => void;
}

function SubmissionReviewContent({ reviewDetails, onRefetch }: SubmissionReviewContentProps) {
  const marksInputId = useId();
  const feedbackInputId = useId();
  const resubmitInputId = useId();
  const gradeTabId = useId();
  const resubmitTabId = useId();
  const gradePanelId = useId();
  const resubmitPanelId = useId();

  const isSubmittingGradeRef = useRef(false);
  const isSubmittingResubmitRef = useRef(false);

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
    if (numMarks === null || isNaN(numMarks) || numMarks < 0 || numMarks > maxMarks) return null;
    return calculateGradeLabel(numMarks, maxMarks);
  }, [numMarks, maxMarks]);

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingGradeRef.current) return;
    if (numMarks === null || isNaN(numMarks) || numMarks < 0 || numMarks > maxMarks) return;

    isSubmittingGradeRef.current = true;
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
    } finally {
      isSubmittingGradeRef.current = false;
    }
  };

  const handleResubmitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingResubmitRef.current) return;
    if (!resubmitFeedback.trim()) return;

    isSubmittingResubmitRef.current = true;
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
    } finally {
      isSubmittingResubmitRef.current = false;
    }
  };

  const isGradeConflict =
    (gradeMutation.error instanceof ApiError &&
      (gradeMutation.error.status === 422 || gradeMutation.error.status === 409)) ||
    gradeMutation.error?.message?.toLowerCase().includes('version') ||
    gradeMutation.error?.message?.toLowerCase().includes('stale');

  return (
    <div className="flex flex-col gap-6">
      {/* Header Metadata Banner */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-800/60">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <div className="flex items-center gap-2">
              <H3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {reviewDetails.assignmentTitle}
              </H3>
              <Span className="rounded bg-slate-200 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                v{reviewDetails.version}
              </Span>
            </div>
            <P className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Course:{' '}
              <Span className="font-semibold text-slate-700 dark:text-slate-300">
                {reviewDetails.courseTitle}
              </Span>
              {reviewDetails.topicTitle && ` • Topic: ${reviewDetails.topicTitle}`}
              {reviewDetails.batchName && ` • Batch: ${reviewDetails.batchName}`}
            </P>
            <P className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
              Student:{' '}
              <Span className="font-semibold text-slate-900 dark:text-slate-200">
                {reviewDetails.mentee.name}
              </Span>{' '}
              ({reviewDetails.mentee.email})
            </P>
          </div>

          <div className="flex flex-col items-start gap-1 sm:items-end">
            <SubmissionStatusBadge status={reviewDetails.status} isLate={reviewDetails.isLate} />
            <Span className="font-mono text-xs text-slate-500 dark:text-slate-400">
              Submitted: {formatDateIST(reviewDetails.submittedAt)}
            </Span>
          </div>
        </div>

        {reviewDetails.instructions && (
          <div className="mt-4 border-t border-slate-200/70 pt-3 dark:border-slate-700">
            <H4 className="text-xs font-bold text-slate-700 uppercase dark:text-slate-300">
              Assignment Instructions
            </H4>
            <P className="mt-1 text-xs whitespace-pre-wrap text-slate-600 dark:text-slate-400">
              {reviewDetails.instructions}
            </P>
          </div>
        )}
      </div>

      {/* Submitted Artifacts Section (FR-10.4) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <H4 className="text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300">
          Submitted Artifacts & Links
        </H4>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Web Link */}
          {reviewDetails.submissionData.linkUrl ? (
            <div className="flex flex-col gap-1 rounded-xl border border-blue-200 bg-blue-50/50 p-3 dark:border-blue-900/50 dark:bg-blue-950/30">
              <Span className="font-mono text-xs font-bold text-blue-700 uppercase dark:text-blue-300">
                Project / Git URL
              </Span>
              {isSafeHttpUrl(reviewDetails.submissionData.linkUrl) ? (
                <a
                  href={reviewDetails.submissionData.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate font-mono text-xs text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {reviewDetails.submissionData.linkUrl} ↗
                </a>
              ) : (
                <Span className="truncate font-mono text-xs text-slate-600 dark:text-slate-400">
                  {reviewDetails.submissionData.linkUrl}
                </Span>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-3 text-center dark:border-slate-800">
              <P className="text-xs text-slate-400">No web link submitted</P>
            </div>
          )}

          {/* PDF Document */}
          {reviewDetails.submissionData.pdfUrl ? (
            <div className="flex flex-col gap-1 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/30">
              <Span className="font-mono text-xs font-bold text-emerald-700 uppercase dark:text-emerald-300">
                PDF Document
              </Span>
              {isSafeHttpUrl(reviewDetails.submissionData.pdfUrl) ? (
                <a
                  href={reviewDetails.submissionData.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate font-mono text-xs text-emerald-600 underline hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  Download PDF 📄
                </a>
              ) : (
                <Span className="truncate font-mono text-xs text-slate-600 dark:text-slate-400">
                  {reviewDetails.submissionData.pdfUrl}
                </Span>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-3 text-center dark:border-slate-800">
              <P className="text-xs text-slate-400">No PDF submitted</P>
            </div>
          )}

          {/* ZIP Archive */}
          {reviewDetails.submissionData.zipUrl ? (
            <div className="flex flex-col gap-1 rounded-xl border border-purple-200 bg-purple-50/50 p-3 dark:border-purple-900/50 dark:bg-purple-950/30">
              <Span className="font-mono text-xs font-bold text-purple-700 uppercase dark:text-purple-300">
                ZIP Archive
              </Span>
              {isSafeHttpUrl(reviewDetails.submissionData.zipUrl) ? (
                <a
                  href={reviewDetails.submissionData.zipUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate font-mono text-xs text-purple-600 underline hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                >
                  Download ZIP 📦
                </a>
              ) : (
                <Span className="truncate font-mono text-xs text-slate-600 dark:text-slate-400">
                  {reviewDetails.submissionData.zipUrl}
                </Span>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-3 text-center dark:border-slate-800">
              <P className="text-xs text-slate-400">No ZIP submitted</P>
            </div>
          )}
        </div>
      </div>

      {/* Action Success / Error Alerts */}
      {actionSuccess && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          <Span>✓</Span>
          <Span>{actionSuccess}</Span>
        </div>
      )}

      {gradeMutation.isError && (
        <ErrorMessage
          title={isGradeConflict ? 'New Version Available' : 'Grading failed'}
          error={
            isGradeConflict
              ? 'A newer version of this submission exists — reload to review and grade the latest version.'
              : gradeMutation.error
          }
          onRetry={isGradeConflict && onRefetch ? onRefetch : undefined}
          className="mt-2"
        />
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
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 dark:border-emerald-800 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <div>
              <Span className="block font-mono text-xs font-bold text-emerald-700 uppercase dark:text-emerald-400">
                Assigned Grade
              </Span>
              <P className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {reviewDetails.grading.marks} / {reviewDetails.maxMarks} Marks (
                {reviewDetails.grading.gradeLabel})
              </P>
              {reviewDetails.grading.feedback && (
                <P className="mt-2 text-xs whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                  Feedback: {reviewDetails.grading.feedback}
                </P>
              )}
              {reviewDetails.grading.gradedAt && (
                <Span className="mt-2 block font-mono text-xs text-slate-500 dark:text-slate-400">
                  Graded on: {formatDateIST(reviewDetails.grading.gradedAt)}
                </Span>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditingExisting(true)}
              className="border-emerald-300 text-xs text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
            >
              Edit Grade
            </Button>
          </div>
        </div>
      )}

      {/* Grading & Resubmission Controls */}
      {(reviewDetails.status !== SubmissionStatus.GRADED || isEditingExisting) && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          {/* Tab Selector */}
          <div
            role="tablist"
            aria-label="Submission action tabs"
            className="mb-4 flex border-b border-slate-200 dark:border-slate-800"
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                e.preventDefault();
                const next = activeTab === 'grade' ? 'resubmit' : 'grade';
                setActiveTab(next);
                document.getElementById(next === 'grade' ? gradeTabId : resubmitTabId)?.focus();
              }
            }}
          >
            <Button
              id={gradeTabId}
              role="tab"
              aria-selected={activeTab === 'grade'}
              aria-controls={gradePanelId}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('grade')}
              className={`rounded-none border-b-2 px-4 py-2 text-xs font-semibold transition-colors hover:bg-transparent ${
                activeTab === 'grade'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Grade Submission
            </Button>
            <Button
              id={resubmitTabId}
              role="tab"
              aria-selected={activeTab === 'resubmit'}
              aria-controls={resubmitPanelId}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('resubmit')}
              className={`rounded-none border-b-2 px-4 py-2 text-xs font-semibold transition-colors hover:bg-transparent ${
                activeTab === 'resubmit'
                  ? 'border-amber-600 text-amber-600 dark:border-amber-400 dark:text-amber-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Request Resubmission
            </Button>
          </div>

          {/* Grade Form Tab */}
          {activeTab === 'grade' && (
            <form
              id={gradePanelId}
              role="tabpanel"
              aria-labelledby={gradeTabId}
              onSubmit={(e) => void handleGradeSubmit(e)}
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor={marksInputId}
                    required
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Marks (Max: {reviewDetails.maxMarks})
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
                  <Span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Computed Grade Label
                  </Span>
                  <div className="flex h-9 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 font-mono text-xs font-bold text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200">
                    <Span>{previewGradeLabel ? `Grade: ${previewGradeLabel}` : '—'}</Span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor={feedbackInputId}
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Constructive Feedback (optional)
                </Label>
                <Textarea
                  id={feedbackInputId}
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Add guidance, praise, or code review points for the mentee..."
                  className="text-xs"
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
                  disabled={
                    gradeMutation.isPending ||
                    numMarks === null ||
                    isNaN(numMarks) ||
                    numMarks < 0 ||
                    numMarks > maxMarks
                  }
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {gradeMutation.isPending ? 'Saving Grade...' : 'Save & Publish Grade ✓'}
                </Button>
              </div>
            </form>
          )}

          {/* Resubmit Form Tab */}
          {activeTab === 'resubmit' && (
            <form
              id={resubmitPanelId}
              role="tabpanel"
              aria-labelledby={resubmitTabId}
              onSubmit={(e) => void handleResubmitSubmit(e)}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor={resubmitInputId}
                  required
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Reason for Resubmission Request
                </Label>
                <Textarea
                  id={resubmitInputId}
                  rows={4}
                  required
                  value={resubmitFeedback}
                  onChange={(e) => setResubmitFeedback(e.target.value)}
                  placeholder="Explain specifically what requirements were missed and what changes are required before re-grading..."
                  className="text-xs"
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
  const {
    reviewDetails,
    isLoading,
    error: reviewError,
    refetch,
  } = useReviewDetails(submissionId, isOpen);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assignment Review & Grading" size="xl">
      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <P className="text-sm text-slate-500 dark:text-slate-400">
            Loading submission details...
          </P>
        </div>
      )}

      {reviewError && !reviewDetails && (
        <ErrorMessage
          title="Could not load submission details"
          error={reviewError}
          onRetry={() => void refetch()}
          className="my-4"
        />
      )}

      {reviewDetails && (
        <SubmissionReviewContent
          key={`${reviewDetails.id}-${reviewDetails.version}-${reviewDetails.status}-${reviewDetails.grading.gradedAt ?? 'ungraded'}`}
          reviewDetails={reviewDetails}
          onRefetch={() => void refetch()}
        />
      )}
    </Modal>
  );
}
