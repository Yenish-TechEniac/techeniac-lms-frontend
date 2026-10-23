'use client';

import React, { useState } from 'react';

import { formatErrorMessage } from '@/lib/errors';
import type { CourseImpact, ResourceItem, Topic, UpdateTopicInput } from '@/types/courses';

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

interface TopicEditorProps {
  topic: Topic;
  impact?: CourseImpact | null | undefined;
  courseEstimatedMinutes?: number | null | undefined;
  otherTopicsMinutes?: number | undefined;
  onSaveTopic: (payload: UpdateTopicInput) => Promise<Topic>;
  onConflict: () => void;
  onDirtyChange: (dirty: boolean) => void;
}

export function TopicEditor({
  topic,
  impact,
  courseEstimatedMinutes = null,
  otherTopicsMinutes = 0,
  onSaveTopic,
  onConflict,
  onDirtyChange,
}: TopicEditorProps) {
  const [title, setTitle] = useState(topic.title);
  const [description, setDescription] = useState(topic.description || '');
  const [resources, setResources] = useState<ResourceItem[]>(topic.resources || []);

  const initialHours = topic.estimatedMinutes ? Math.floor(topic.estimatedMinutes / 60) : 0;
  const initialMinutes = topic.estimatedMinutes ? topic.estimatedMinutes % 60 : 0;

  const [durationHours, setDurationHours] = useState<string>(
    initialHours > 0 || initialMinutes > 0 ? String(initialHours) : '',
  );
  const [durationMinutes, setDurationMinutes] = useState<string>(
    initialHours > 0 || initialMinutes > 0 ? String(initialMinutes) : '',
  );
  const [isActive, setIsActive] = useState(topic.isActive);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const subtopicsTotalMinutes =
    topic.subtopics?.reduce((acc, s) => acc + (s.estimatedMinutes || 0), 0) || 0;

  const remainingBudget =
    courseEstimatedMinutes !== undefined &&
    courseEstimatedMinutes !== null &&
    courseEstimatedMinutes > 0
      ? Math.max(0, courseEstimatedMinutes - (otherTopicsMinutes || 0))
      : null;

  const totalEstimatedMins =
    durationHours !== '' || durationMinutes !== ''
      ? (parseInt(durationHours, 10) || 0) * 60 + (parseInt(durationMinutes, 10) || 0)
      : null;

  const [newResourceTitle, setNewResourceTitle] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');
  const [newResourceType, setNewResourceType] = useState<'LINK' | 'ATTACHMENT'>('LINK');

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

  const handleRemoveResource = (indexToRemove: number) => {
    const updated = resources.filter((_, idx) => idx !== indexToRemove);
    setResources(updated);
    onDirtyChange(true);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Topic title cannot be empty.');
      return;
    }

    if (totalEstimatedMins !== null && totalEstimatedMins <= 0) {
      setErrorMsg('Please enter a valid positive duration greater than 0 minutes.');
      return;
    }

    if (durationMinutes !== '') {
      const parsedMins = parseInt(durationMinutes, 10);
      if (isNaN(parsedMins) || parsedMins < 0 || parsedMins > 59) {
        setErrorMsg('Minutes must be between 0 and 59.');
        return;
      }
    }

    if (
      remainingBudget !== null &&
      totalEstimatedMins !== null &&
      totalEstimatedMins > remainingBudget
    ) {
      setErrorMsg(
        `Topic duration (${Math.floor(totalEstimatedMins / 60)}h ${totalEstimatedMins % 60}m) exceeds the course's remaining duration budget (${Math.floor(remainingBudget / 60)}h ${remainingBudget % 60}m remaining out of ${Math.floor(courseEstimatedMinutes! / 60)}h ${courseEstimatedMinutes! % 60}m total).`,
      );
      return;
    }

    if (
      subtopicsTotalMinutes > 0 &&
      totalEstimatedMins !== null &&
      totalEstimatedMins < subtopicsTotalMinutes
    ) {
      setErrorMsg(
        `Topic duration (${Math.floor(totalEstimatedMins / 60)}h ${totalEstimatedMins % 60}m) cannot be less than the total allocated duration of its subtopics (${Math.floor(subtopicsTotalMinutes / 60)}h ${subtopicsTotalMinutes % 60}m).`,
      );
      return;
    }

    // Validate pending resource inputs if user entered anything in title or URL
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
      await onSaveTopic({
        title: title.trim(),
        description: description.trim() || null,
        resources: updatedResources.length > 0 ? updatedResources : null,
        estimatedMinutes: totalEstimatedMins,
        isActive,
        expectedUpdatedAt: topic.updatedAt,
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
        setErrorMsg(formatErrorMessage(err, 'Failed to save topic changes'));
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

  const affectedMentees = impact?.affectedMenteesCount ?? 0;

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4 sm:p-6">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Topic Parameters
          </span>
          <h2 className="text-xl font-bold text-slate-900">{topic.title}</h2>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Saved Live
            </span>
          )}

          <button
            type="button"
            disabled={isSaving}
            onClick={() => {
              void handleSave();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-slate-800 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {affectedMentees > 0 && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900">
          <div className="flex items-center gap-2 font-bold">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
            Impact Notice
          </div>
          <p className="mt-1 leading-relaxed">
            Editing or deactivating this topic affects{' '}
            <strong>{affectedMentees} active mentees</strong>. Adding, deactivating, or reactivating
            triggers an automatic progress recalculation event.
          </p>
        </div>
      )}

      {errorMsg && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          {errorMsg}
        </div>
      )}

      <form
        noValidate
        onSubmit={(e) => {
          void handleSave(e);
        }}
        className="mt-6 max-w-2xl space-y-5"
      >
        <div>
          <label className="block text-xs font-bold tracking-wide text-slate-700 uppercase">
            Topic Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleChange(() => setTitle(e.target.value))}
            placeholder="e.g. Branching & Trunk Strategies"
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-xs focus:border-blue-600 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-bold tracking-wide text-slate-700 uppercase">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => handleChange(() => setDescription(e.target.value))}
            placeholder="Brief scope of this topic..."
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-xs focus:border-blue-600 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-bold tracking-wide text-slate-700 uppercase">
            Estimated Duration
          </label>
          <div className="mt-1.5 grid max-w-xs grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                Hours
              </label>
              <div className="relative mt-1">
                <input
                  type="number"
                  min={0}
                  value={durationHours}
                  onChange={(e) => handleChange(() => setDurationHours(e.target.value))}
                  placeholder="0"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-10 text-sm text-slate-900 shadow-xs focus:border-blue-600 focus:outline-hidden"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-slate-400">
                  hrs
                </span>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                Minutes
              </label>
              <div className="relative mt-1">
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={durationMinutes}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const sanitized =
                      raw === ''
                        ? ''
                        : Math.min(59, Math.max(0, parseInt(raw, 10) || 0)).toString();
                    handleChange(() => setDurationMinutes(sanitized));
                  }}
                  placeholder="0"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-10 text-sm text-slate-900 shadow-xs focus:border-blue-600 focus:outline-hidden"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-slate-400">
                  mins
                </span>
              </div>
            </div>
          </div>
          <span className="mt-1.5 block text-xs text-slate-500">
            {totalEstimatedMins !== null && totalEstimatedMins > 0
              ? `${totalEstimatedMins} minutes total (${Math.floor(totalEstimatedMins / 60)}h ${totalEstimatedMins % 60}m)`
              : 'Optional'}
          </span>
          {remainingBudget !== null && (
            <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700">
              <span>
                Available budget:{' '}
                <strong>
                  {Math.floor(remainingBudget / 60)}h {remainingBudget % 60}m remaining
                </strong>{' '}
                (Course total: {Math.floor(courseEstimatedMinutes! / 60)}h{' '}
                {courseEstimatedMinutes! % 60}m, other topics:{' '}
                {Math.floor((otherTopicsMinutes || 0) / 60)}h {(otherTopicsMinutes || 0) % 60}m)
              </span>
            </div>
          )}
          {subtopicsTotalMinutes > 0 && (
            <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600">
              <span>
                Currently allocated across subtopics:{' '}
                <strong>
                  {Math.floor(subtopicsTotalMinutes / 60)}h {subtopicsTotalMinutes % 60}m
                </strong>
                . Topic duration cannot be lower than this total.
              </span>
            </div>
          )}
        </div>

        {/* Resources Manager */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Resource Links & Attachments</h3>
              <p className="text-[11px] text-slate-500">
                Supplementary links, documentation references, and download URLs.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
              {resources.length}
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {resources.map((resItem, idx) => (
              <div
                key={resItem.id || idx}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                      resItem.type === 'LINK'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {resItem.type}
                  </span>
                  <span className="truncate font-semibold text-slate-900">{resItem.title}</span>
                  <a
                    href={resItem.url}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-[11px] text-slate-400 hover:text-blue-600"
                  >
                    {resItem.url}
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveResource(idx)}
                  className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-rose-600"
                >
                  &times;
                </button>
              </div>
            ))}

            {resources.length === 0 && (
              <div className="py-2 text-center text-xs text-slate-400 italic">
                No external resources attached.
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              {errorMsg}
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 gap-2 border-t border-slate-100 pt-3 sm:grid-cols-12">
            <div className="sm:col-span-4">
              <input
                type="text"
                placeholder="Resource title"
                value={newResourceTitle}
                onChange={(e) => {
                  setNewResourceTitle(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 shadow-xs focus:border-blue-600 focus:outline-hidden"
              />
            </div>
            <div className="sm:col-span-5">
              <input
                type="url"
                placeholder="https://example.com/spec.pdf"
                value={newResourceUrl}
                onChange={(e) => {
                  setNewResourceUrl(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 shadow-xs focus:border-blue-600 focus:outline-hidden"
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
              <button
                type="button"
                onClick={handleAddResource}
                className="w-full rounded-lg bg-slate-900 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
              >
                <span className="sm:hidden">+ Add Resource</span>
                <span className="hidden sm:inline">+</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div>
            <span className="block text-xs font-bold text-slate-900">Topic Active Status</span>
            <span className="text-[11px] text-slate-500">
              When inactive, hidden from mentees and excluded from progress calculations.
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleChange(() => setIsActive(!isActive))}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
              isActive ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                isActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </form>
    </div>
  );
}
