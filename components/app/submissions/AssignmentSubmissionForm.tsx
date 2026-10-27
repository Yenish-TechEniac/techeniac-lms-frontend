'use client';

import React, { useState } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { FieldError } from '@/components/ui/FieldError';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { H3, P, Span } from '@/components/ui/Typography';
import { useSubmitAssignment } from '@/hooks/useSubmissions';
import { formatDateTimeIST, isDatePast } from '@/lib/date';
import type { Assignment } from '@/types/courses';
import { SubmissionMode } from '@/types/courses';
import type { SubmissionData, SubmissionVersion } from '@/types/submissions';

interface AssignmentSubmissionFormProps {
  assignment: Assignment;
  dueDate: string;
  isBatchActive: boolean;
  batchStatus: string;
  latestVersion?: SubmissionVersion | null | undefined;
  onSuccess?: ((submission: SubmissionVersion) => void) | undefined;
}

export function AssignmentSubmissionForm({
  assignment,
  dueDate,
  isBatchActive,
  batchStatus,
  latestVersion,
  onSuccess,
}: Readonly<AssignmentSubmissionFormProps>) {
  const [pdfUrl, setPdfUrl] = useState('');
  const [zipUrl, setZipUrl] = useState('');
  const [url, setUrl] = useState('');
  const [confirmedComplete, setConfirmedComplete] = useState(false);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const submitMutation = useSubmitAssignment();

  const isPastDue = isDatePast(dueDate);
  const isLateBlocked = isPastDue && !assignment.allowLate;
  const isReadOnlyBatch =
    !isBatchActive || batchStatus === 'COMPLETED' || batchStatus === 'ARCHIVED';

  const nextVersion = latestVersion ? latestVersion.version + 1 : 1;
  const isResubmission = Boolean(latestVersion);

  const isValidUrl = (testUrl: string): boolean => {
    try {
      const parsed = new URL(testUrl);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (assignment.pdfMode === SubmissionMode.REQUIRED && !pdfUrl.trim()) {
      errors.pdfUrl = 'PDF document link is required.';
    } else if (pdfUrl.trim() && !isValidUrl(pdfUrl.trim())) {
      errors.pdfUrl = 'Please enter a valid HTTP or HTTPS URL for the PDF document.';
    }

    if (assignment.zipMode === SubmissionMode.REQUIRED && !zipUrl.trim()) {
      errors.zipUrl = 'ZIP archive link is required.';
    } else if (zipUrl.trim() && !isValidUrl(zipUrl.trim())) {
      errors.zipUrl = 'Please enter a valid HTTP or HTTPS URL for the ZIP archive.';
    }

    if (assignment.urlMode === SubmissionMode.REQUIRED && !url.trim()) {
      errors.url = 'Project / repository URL is required.';
    } else if (url.trim() && !isValidUrl(url.trim())) {
      errors.url = 'Please enter a valid HTTP or HTTPS URL.';
    }

    const hasAnyContent = Boolean(pdfUrl.trim() || zipUrl.trim() || url.trim());
    if (!hasAnyContent) {
      errors.general = 'At least one submission field must be provided.';
    }

    if (!confirmedComplete) {
      errors.confirmedComplete =
        'You must confirm that you have completed this assignment before submitting.';
    }

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const submissionData: SubmissionData = {};
    if (pdfUrl.trim()) submissionData.pdf_url = pdfUrl.trim();
    if (zipUrl.trim()) submissionData.zip_url = zipUrl.trim();
    if (url.trim()) submissionData.url = url.trim();

    try {
      const result = await submitMutation.mutateAsync({
        assignmentId: assignment.id,
        submissionData,
        confirmedComplete,
      });

      // Clear form on success
      setPdfUrl('');
      setZipUrl('');
      setUrl('');
      setConfirmedComplete(false);
      setClientErrors({});

      onSuccess?.(result);
    } catch {
      // Handled by TanStack mutation state
    }
  };

  if (isReadOnlyBatch) {
    return (
      <Alert
        variant="warning"
        title="Submissions Closed"
        message={`This assignment is part of a batch with status "${batchStatus}". Submissions are closed.`}
      />
    );
  }

  if (isLateBlocked) {
    return (
      <Alert
        variant="error"
        title="Assignment Deadline Expired"
        message={`The due date for this assignment was ${formatDateTimeIST(dueDate)}. Late submissions are not accepted.`}
      />
    );
  }

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(e);
      }}
      className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
        <H3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {isResubmission ? `Submit Revision (Version ${nextVersion})` : 'Submit Assignment'}
        </H3>
        <P className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Due Date:{' '}
          <strong className="text-slate-700 dark:text-slate-300">
            {formatDateTimeIST(dueDate)}
          </strong>
        </P>
      </div>

      {/* Due date and Late submission warnings */}
      {isPastDue && assignment.allowLate ? (
        <Alert
          variant="warning"
          title="Late Submission Warning"
          message={`The due date was ${formatDateTimeIST(dueDate)}. Because late submissions are permitted, you can still submit, but your work will be flagged as Late.`}
        />
      ) : null}

      {submitMutation.error ? (
        <Alert
          variant="error"
          title="Submission Failed"
          message={
            submitMutation.error.message || 'An error occurred while submitting your assignment.'
          }
        />
      ) : null}

      {clientErrors.general ? <Alert variant="error" message={clientErrors.general} /> : null}

      {submitMutation.isSuccess ? (
        <Alert
          variant="success"
          title="Submission Successful!"
          message={`Your submission (Version ${nextVersion}) was successfully recorded. Your mentor has been notified.`}
        />
      ) : null}

      <div className="space-y-4">
        {/* PDF Link Field */}
        {assignment.pdfMode !== SubmissionMode.OFF ? (
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <Label htmlFor="pdf_url">PDF Document URL</Label>
              <Span
                className={
                  assignment.pdfMode === SubmissionMode.REQUIRED
                    ? 'text-xs font-semibold text-rose-600 dark:text-rose-400'
                    : 'text-xs text-slate-500 dark:text-slate-400'
                }
              >
                {assignment.pdfMode === SubmissionMode.REQUIRED ? 'Required' : 'Optional'}
              </Span>
            </div>
            <Input
              id="pdf_url"
              type="url"
              placeholder="https://example.com/my-document.pdf"
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              hasError={Boolean(clientErrors.pdfUrl)}
              disabled={submitMutation.isPending}
            />
            {clientErrors.pdfUrl ? <FieldError error={clientErrors.pdfUrl} /> : null}
          </div>
        ) : null}

        {/* ZIP Link Field */}
        {assignment.zipMode !== SubmissionMode.OFF ? (
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <Label htmlFor="zip_url">ZIP Archive URL</Label>
              <Span
                className={
                  assignment.zipMode === SubmissionMode.REQUIRED
                    ? 'text-xs font-semibold text-rose-600 dark:text-rose-400'
                    : 'text-xs text-slate-500 dark:text-slate-400'
                }
              >
                {assignment.zipMode === SubmissionMode.REQUIRED ? 'Required' : 'Optional'}
              </Span>
            </div>
            <Input
              id="zip_url"
              type="url"
              placeholder="https://example.com/project-files.zip"
              value={zipUrl}
              onChange={(e) => setZipUrl(e.target.value)}
              hasError={Boolean(clientErrors.zipUrl)}
              disabled={submitMutation.isPending}
            />
            {clientErrors.zipUrl ? <FieldError error={clientErrors.zipUrl} /> : null}
          </div>
        ) : null}

        {/* Project URL Field */}
        {assignment.urlMode !== SubmissionMode.OFF ? (
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <Label htmlFor="url">Project / Repository URL</Label>
              <Span
                className={
                  assignment.urlMode === SubmissionMode.REQUIRED
                    ? 'text-xs font-semibold text-rose-600 dark:text-rose-400'
                    : 'text-xs text-slate-500 dark:text-slate-400'
                }
              >
                {assignment.urlMode === SubmissionMode.REQUIRED ? 'Required' : 'Optional'}
              </Span>
            </div>
            <Input
              id="url"
              type="url"
              placeholder="https://github.com/my-repo or https://my-app.vercel.app"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              hasError={Boolean(clientErrors.url)}
              disabled={submitMutation.isPending}
            />
            {clientErrors.url ? <FieldError error={clientErrors.url} /> : null}
          </div>
        ) : null}

        {/* Mandatory Completion Confirmation Checkbox */}
        <div className="mt-4 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex items-start gap-3">
            <Checkbox
              id="confirmed_complete"
              checked={confirmedComplete}
              onChange={(e) => setConfirmedComplete(e.target.checked)}
              disabled={submitMutation.isPending}
              className="mt-0.5"
            />
            <label
              htmlFor="confirmed_complete"
              className="cursor-pointer text-xs leading-relaxed font-medium text-slate-700 select-none dark:text-slate-300"
            >
              <strong className="text-slate-900 dark:text-slate-100">
                I confirm that I have completed this assignment
              </strong>{' '}
              and that all submitted work and resources represent my own original effort.
            </label>
          </div>
          {clientErrors.confirmedComplete ? (
            <FieldError error={clientErrors.confirmedComplete} />
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
        <Button
          type="submit"
          variant="primary"
          isLoading={submitMutation.isPending}
          disabled={submitMutation.isPending}
        >
          {submitMutation.isPending
            ? 'Submitting...'
            : isResubmission
              ? `Submit Revision (v${nextVersion})`
              : 'Submit Assignment'}
        </Button>
      </div>
    </form>
  );
}
