'use client';

import React, { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { FieldError } from '@/components/ui/FieldError';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { H2, H3, H4, P } from '@/components/ui/Typography';
import { formatErrorMessage } from '@/lib/errors';
import {
  Assignment,
  CourseImpact,
  ResourceItem,
  SubmissionMode,
  UpdateAssignmentInput,
} from '@/types/courses';

function isValidWebUrl(urlString: string): boolean {
  try {
    const trimmed = urlString.trim();
    if (!trimmed) return false;
    const url = new URL(trimmed);
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname.length > 0;
  } catch {
    return false;
  }
}

interface AssignmentEditorProps {
  assignment: Assignment;
  impact?: CourseImpact | null | undefined;
  onSaveAssignment: (payload: UpdateAssignmentInput) => Promise<Assignment>;
  onConflict: () => void;
  onDirtyChange: (dirty: boolean) => void;
}

export function AssignmentEditor({
  assignment,
  impact,
  onSaveAssignment,
  onConflict,
  onDirtyChange,
}: AssignmentEditorProps) {
  const [title, setTitle] = useState(assignment.title);
  const [instructions, setInstructions] = useState(assignment.instructions || '');

  const initialHours = assignment.estimatedMinutes
    ? Math.floor(assignment.estimatedMinutes / 60)
    : 0;
  const initialMinutes = assignment.estimatedMinutes ? assignment.estimatedMinutes % 60 : 0;

  const [durationHours, setDurationHours] = useState<string>(
    initialHours > 0 || initialMinutes > 0 ? String(initialHours) : '',
  );
  const [durationMinutes, setDurationMinutes] = useState<string>(
    initialHours > 0 || initialMinutes > 0 ? String(initialMinutes) : '',
  );
  const [maxMarks, setMaxMarks] = useState<number>(Number(assignment.maxMarks) || 0);
  const [passMarks, setPassMarks] = useState<number>(Number(assignment.passMarks) || 0);
  const [allowLate, setAllowLate] = useState<boolean>(assignment.allowLate);

  const [pdfMode, setPdfMode] = useState<SubmissionMode>(assignment.pdfMode);
  const [zipMode, setZipMode] = useState<SubmissionMode>(assignment.zipMode);
  const [urlMode, setUrlMode] = useState<SubmissionMode>(assignment.urlMode);

  const [resources, setResources] = useState<ResourceItem[]>(assignment.resources || []);
  const [newResourceTitle, setNewResourceTitle] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');
  const [newResourceType, setNewResourceType] = useState<'LINK' | 'ATTACHMENT'>('LINK');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const totalDurationMinutes =
    (parseInt(durationHours, 10) || 0) * 60 + (parseInt(durationMinutes, 10) || 0);

  const handleAddResource = () => {
    const trimmedTitle = newResourceTitle.trim();
    const trimmedUrl = newResourceUrl.trim();

    if (!trimmedTitle) {
      setErrorMsg('Resource title is required.');
      return;
    }
    if (!trimmedUrl) {
      setErrorMsg('Resource URL is required.');
      return;
    }
    if (!isValidWebUrl(trimmedUrl)) {
      setErrorMsg(
        'Invalid resource URL format. Please provide a valid web link (e.g. https://github.com/...).',
      );
      return;
    }

    const updated = [
      ...resources,
      {
        id: crypto.randomUUID(),
        title: trimmedTitle,
        url: trimmedUrl,
        type: newResourceType,
      },
    ];
    setResources(updated);
    setNewResourceTitle('');
    setNewResourceUrl('');
    setErrorMsg(null);
    onDirtyChange(true);
  };

  const handleRemoveResource = (index: number) => {
    const updated = resources.filter((_, i) => i !== index);
    setResources(updated);
    onDirtyChange(true);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Assignment title cannot be empty.');
      return;
    }

    if (totalDurationMinutes <= 0) {
      setErrorMsg('Estimated duration must be greater than 0 minutes.');
      return;
    }

    if (durationMinutes !== '') {
      const parsedMins = parseInt(durationMinutes, 10);
      if (isNaN(parsedMins) || parsedMins < 0 || parsedMins > 59) {
        setErrorMsg('Minutes must be between 0 and 59.');
        return;
      }
    }

    const numMaxMarks = Number(maxMarks);
    const numPassMarks = Number(passMarks);

    if (isNaN(numMaxMarks) || numMaxMarks <= 0) {
      setErrorMsg('Max marks must be greater than 0.');
      return;
    }
    if (isNaN(numPassMarks) || numPassMarks <= 0) {
      setErrorMsg('Pass marks must be greater than 0.');
      return;
    }
    if (numPassMarks > numMaxMarks) {
      setErrorMsg('Pass marks cannot be greater than max marks.');
      return;
    }

    if (
      pdfMode === SubmissionMode.OFF &&
      zipMode === SubmissionMode.OFF &&
      urlMode === SubmissionMode.OFF
    ) {
      setErrorMsg(
        'Validation error: At least one submission mode (PDF, ZIP, or URL) must not be Off.',
      );
      return;
    }

    // Validate pending resource inputs if user typed in title or URL
    const updatedResources = [...resources];
    const pendingTitle = newResourceTitle.trim();
    const pendingUrl = newResourceUrl.trim();

    if (pendingTitle || pendingUrl) {
      if (!pendingTitle) {
        setErrorMsg('Resource title is required (or clear the resource input before saving).');
        return;
      }
      if (!pendingUrl || !isValidWebUrl(pendingUrl)) {
        setErrorMsg(
          'Invalid resource URL format. Please provide a valid web link (e.g. https://github.com/...) or clear the pending resource fields.',
        );
        return;
      }
      updatedResources.push({
        id: crypto.randomUUID(),
        title: pendingTitle,
        url: pendingUrl,
        type: newResourceType,
      });
      setResources(updatedResources);
      setNewResourceTitle('');
      setNewResourceUrl('');
    }

    // Verify all resources in list have valid URL format
    for (const res of updatedResources) {
      if (!isValidWebUrl(res.url)) {
        setErrorMsg(
          `Resource "${res.title}" has an invalid URL format. Links must start with http:// or https://`,
        );
        return;
      }
    }

    setIsSaving(true);
    setErrorMsg(null);
    setSaveSuccess(false);

    try {
      await onSaveAssignment({
        title: title.trim(),
        instructions: instructions.trim() || null,
        estimatedMinutes: totalDurationMinutes,
        maxMarks: numMaxMarks,
        passMarks: numPassMarks,
        allowLate,
        pdfMode,
        zipMode,
        urlMode,
        resources: updatedResources.length > 0 ? updatedResources : null,
        expectedUpdatedAt: assignment.updatedAt,
      });

      onDirtyChange(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'status' in err &&
        (err as { status: number }).status === 409
      ) {
        onConflict();
      } else {
        setErrorMsg(formatErrorMessage(err, 'Failed to save assignment changes'));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (updater: () => void) => {
    updater();
    if (errorMsg) setErrorMsg(null);
    onDirtyChange(true);
  };

  const hasSubmissions = impact?.hasSubmissions ?? false;

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4 sm:p-6">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-800 uppercase">
              {assignment.scope} Task
            </span>
            <span className="font-mono text-xs text-slate-400">#{assignment.id.slice(0, 8)}</span>
          </div>
          <H2 className="mt-1 text-2xl font-bold text-slate-900">{assignment.title}</H2>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Saved Live
            </span>
          )}

          <Button
            type="button"
            disabled={isSaving}
            isLoading={isSaving}
            onClick={() => {
              void handleSave();
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-slate-800 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Submission modification warning if submissions exist */}
      {hasSubmissions && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900">
          <div className="flex items-center gap-2 font-bold">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
            Existing Submissions Notice
          </div>
          <P className="mt-1 leading-relaxed">
            Mentees have already submitted responses to this assignment. Changing submission modes
            or marks will apply to subsequent submissions; existing submissions will remain valid.
          </P>
        </div>
      )}

      {errorMsg && (
        <FieldError
          error={errorMsg}
          className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
        />
      )}

      {/* Main Form Fields */}
      <form
        noValidate
        onSubmit={(e) => {
          void handleSave(e);
        }}
        className="mt-6 grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-12"
      >
        <div className="space-y-6 lg:col-span-7">
          {/* Assignment Title */}
          <div>
            <Label
              required={true}
              className="block text-sm font-bold tracking-wide text-slate-800 uppercase"
            >
              Assignment Title
            </Label>
            <Input
              type="text"
              value={title}
              hasError={Boolean(errorMsg && !title.trim())}
              onChange={(e) => handleChange(() => setTitle(e.target.value))}
              placeholder="e.g. Build a Raft Distributed Consensus Node"
              className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 shadow-xs focus:border-blue-600 focus:outline-hidden"
            />
          </div>

          {/* Instructions */}
          <div>
            <Label className="block text-xs font-bold tracking-wide text-slate-700 uppercase">
              Instructions & Problem Statement (Rich Text)
            </Label>
            <textarea
              rows={6}
              value={instructions}
              onChange={(e) => handleChange(() => setInstructions(e.target.value))}
              placeholder="State the technical specifications, requirements, and constraints for cadets..."
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-3.5 font-mono text-xs leading-relaxed text-slate-900 shadow-xs focus:border-blue-600 focus:outline-hidden"
            />
          </div>

          {/* Time, Marks, Late Submission Controls */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label
                required={true}
                className="block text-xs font-bold tracking-wide text-slate-700 uppercase"
              >
                Est. Duration
              </Label>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                <div>
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      value={durationHours}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleChange(() => setDurationHours(val));
                      }}
                      placeholder="0"
                      className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-10 text-sm text-slate-900 shadow-xs focus:border-blue-600 focus:outline-hidden"
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-slate-400">
                      hrs
                    </span>
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      max={59}
                      value={durationMinutes}
                      onChange={(e) => {
                        const val = e.target.value;
                        const sanitized =
                          val === ''
                            ? ''
                            : Math.min(59, Math.max(0, parseInt(val, 10) || 0)).toString();
                        handleChange(() => setDurationMinutes(sanitized));
                      }}
                      placeholder="0"
                      className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-10 text-sm text-slate-900 shadow-xs focus:border-blue-600 focus:outline-hidden"
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-slate-400">
                      mins
                    </span>
                  </div>
                </div>
              </div>
              <span className="mt-1 block text-[10px] text-slate-500">
                {totalDurationMinutes > 0
                  ? `${totalDurationMinutes} minutes total`
                  : 'Required (hrs/mins)'}
              </span>
            </div>

            <div>
              <Label
                required={true}
                className="block text-xs font-bold tracking-wide text-slate-700 uppercase"
              >
                Max Marks
              </Label>
              <Input
                type="number"
                value={maxMarks || ''}
                onChange={(e) => handleChange(() => setMaxMarks(Number(e.target.value)))}
                className="mt-1.5 h-9 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-blue-600 focus:outline-hidden"
              />
            </div>

            <div>
              <Label
                required={true}
                className="block text-xs font-bold tracking-wide text-slate-700 uppercase"
              >
                Pass Marks
              </Label>
              <Input
                type="number"
                value={passMarks || ''}
                onChange={(e) => handleChange(() => setPassMarks(Number(e.target.value)))}
                className="mt-1.5 h-9 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-blue-600 focus:outline-hidden"
              />
              <span className="mt-1 block text-[10px] text-slate-500">Must be &le; Max Marks</span>
            </div>
          </div>

          {/* Late Submission Flag */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <span className="block text-xs font-bold text-slate-900">
                Late Submissions Allowed
              </span>
              <span className="text-[11px] text-slate-500">
                Allow cadets to turn in assignments after the scheduled allocation due date.
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleChange(() => setAllowLate(!allowLate))}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                allowLate ? 'bg-purple-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  allowLate ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Submission Modes Chooser */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <H3 className="text-sm font-bold text-slate-900">Mentee Submission Modes</H3>
            <P className="text-[11px] text-slate-500">
              Configure accepted submission deliverables. At least one field must not be
              &apos;Off&apos;.
            </P>

            <div className="mt-4 space-y-3">
              {/* PDF Mode */}
              <div className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-800">PDF Upload</span>
                  <span className="text-[10px] text-slate-500">
                    Technical reports, architecture diagrams
                  </span>
                </div>
                <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs">
                  {(['OFF', 'OPTIONAL', 'REQUIRED'] as SubmissionMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => handleChange(() => setPdfMode(mode))}
                      className={`rounded px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                        pdfMode === mode
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* ZIP Mode */}
              <div className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-800">ZIP Archive</span>
                  <span className="text-[10px] text-slate-500">
                    Source code bundles, project repos
                  </span>
                </div>
                <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs">
                  {(['OFF', 'OPTIONAL', 'REQUIRED'] as SubmissionMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => handleChange(() => setZipMode(mode))}
                      className={`rounded px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                        zipMode === mode
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* URL Mode */}
              <div className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-800">URL Text Box</span>
                  <span className="text-[10px] text-slate-500">
                    GitHub repo link, live deployment preview
                  </span>
                </div>
                <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs">
                  {(['OFF', 'OPTIONAL', 'REQUIRED'] as SubmissionMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => handleChange(() => setUrlMode(mode))}
                      className={`rounded px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                        urlMode === mode
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Resources Manager */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Assignment Resources</h3>
                <p className="text-[11px] text-slate-500">Starter kits, rubrics, and references</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                {resources.length}
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {resources.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[9px] font-bold text-purple-800 uppercase">
                      {item.type}
                    </span>
                    <span className="truncate font-semibold text-slate-900">{item.title}</span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-[11px] text-slate-400 hover:text-blue-600"
                    >
                      {item.url}
                    </a>
                  </div>
                  <Button
                    type="button"
                    onClick={() => handleRemoveResource(idx)}
                    className="h-auto rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-rose-600"
                  >
                    &times;
                  </Button>
                </div>
              ))}
            </div>

            {errorMsg && (
              <FieldError
                error={errorMsg}
                className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700"
              />
            )}

            <div className="mt-4 grid grid-cols-1 gap-2 border-t border-slate-100 pt-3 sm:grid-cols-12">
              <div className="sm:col-span-4">
                <Input
                  type="text"
                  placeholder="Resource title"
                  value={newResourceTitle}
                  onChange={(e) => {
                    setNewResourceTitle(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  className="h-8 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 shadow-xs focus:border-blue-600 focus:outline-hidden"
                />
              </div>
              <div className="sm:col-span-5">
                <Input
                  type="url"
                  placeholder="https://github.com/..."
                  value={newResourceUrl}
                  onChange={(e) => {
                    setNewResourceUrl(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  className="h-8 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 shadow-xs focus:border-blue-600 focus:outline-hidden"
                />
              </div>
              <div className="sm:col-span-2">
                <select
                  value={newResourceType}
                  onChange={(e) => setNewResourceType(e.target.value as 'LINK' | 'ATTACHMENT')}
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-slate-900 shadow-xs focus:border-blue-600 focus:outline-hidden"
                >
                  <option value="LINK">LINK</option>
                  <option value="ATTACHMENT">FILE</option>
                </select>
              </div>
              <div className="sm:col-span-1">
                <Button
                  type="button"
                  onClick={handleAddResource}
                  className="h-auto w-full rounded-lg bg-blue-600 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
                >
                  <span className="sm:hidden">+ Add Resource</span>
                  <span className="hidden sm:inline">+</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Mentee Submission Form Preview */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Mentee Form Preview
              </span>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                Live Rendering
              </span>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <H4 className="text-sm font-bold text-slate-900">
                  {title || 'Untitled Assignment'}
                </H4>
                <P className="mt-1 text-[11px] text-slate-500">
                  Est. {totalDurationMinutes > 0 ? `${totalDurationMinutes}m` : '0m'} • Max{' '}
                  {maxMarks} marks (Pass: {passMarks})
                </P>
              </div>

              {instructions && (
                <div className="max-h-32 overflow-y-auto rounded-lg bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-700">
                  {instructions}
                </div>
              )}

              {/* Mentee Deliverables Fields */}
              <div className="space-y-3 pt-2">
                {pdfMode !== SubmissionMode.OFF && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700">
                      Upload PDF Document{' '}
                      {pdfMode === SubmissionMode.REQUIRED ? (
                        <span className="text-rose-600">*</span>
                      ) : (
                        <span className="font-normal text-slate-400">(Optional)</span>
                      )}
                    </label>
                    <div className="mt-1 flex items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50/50 p-3 text-center">
                      <span className="text-[11px] text-slate-400">Choose .pdf file</span>
                    </div>
                  </div>
                )}

                {zipMode !== SubmissionMode.OFF && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700">
                      Upload ZIP Archive{' '}
                      {zipMode === SubmissionMode.REQUIRED ? (
                        <span className="text-rose-600">*</span>
                      ) : (
                        <span className="font-normal text-slate-400">(Optional)</span>
                      )}
                    </label>
                    <div className="mt-1 flex items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50/50 p-3 text-center">
                      <span className="text-[11px] text-slate-400">Choose .zip archive</span>
                    </div>
                  </div>
                )}

                {urlMode !== SubmissionMode.OFF && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700">
                      Submission Repository URL{' '}
                      {urlMode === SubmissionMode.REQUIRED ? (
                        <span className="text-rose-600">*</span>
                      ) : (
                        <span className="font-normal text-slate-400">(Optional)</span>
                      )}
                    </label>
                    <input
                      type="url"
                      disabled
                      placeholder="https://github.com/mentee/submission"
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-400"
                    />
                  </div>
                )}
              </div>

              {/* Mandatory Mentee Completion Checkbox (FR-6.5) */}
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/60 p-3">
                <label className="flex cursor-not-allowed items-start gap-2.5">
                  <input
                    type="checkbox"
                    disabled
                    checked
                    readOnly
                    className="mt-0.5 rounded border-slate-300 text-blue-600"
                  />
                  <span className="text-[11px] leading-tight font-semibold text-blue-900">
                    &ldquo;I have completed this assignment&rdquo; confirmation
                    <span className="block text-[10px] font-normal text-blue-700">
                      Mandatory for all cadets (cannot be turned off)
                    </span>
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
