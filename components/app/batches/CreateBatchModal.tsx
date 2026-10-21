'use client';

import React, { useState } from 'react';

import { Input } from '@/components/ui/Input';
import { env } from '@/lib/config';
import { type CreateBatchFormData, createBatchSchema } from '@/lib/validation';

export interface CreateBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: CreateBatchFormData) => void;
}

export function CreateBatchModal({ isOpen, onClose, onSuccess }: CreateBatchModalProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const result = createBatchSchema.safeParse({
      name,
      code,
      startDate,
      endDate,
      description: description || undefined,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field && !fieldErrors[field.toString()]) {
          fieldErrors[field.toString()] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/batches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(result.data),
      });

      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as {
          error?: { message?: string };
          message?: string;
        } | null;
        setErrors({
          general: json?.error?.message || json?.message || 'Failed to create batch.',
        });
        return;
      }

      onSuccess(result.data);
      onClose();
    } catch {
      setErrors({
        general: 'Unable to connect to server. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm duration-150">
      <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Create New Batch</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Set up a cohort for grouped course allocations and mentor mappings.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form
          id="create-batch-form"
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          className="space-y-4 p-6"
          noValidate
        >
          {errors.general ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {errors.general}
            </div>
          ) : null}

          {/* Name */}
          <div className="space-y-1">
            <label htmlFor="batch-name" className="block text-sm font-semibold text-slate-900">
              Batch Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="batch-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Frontend Engineering Cohort 2025"
              hasError={Boolean(errors.name)}
              disabled={isSubmitting}
            />
            {errors.name ? <p className="text-xs text-red-500">{errors.name}</p> : null}
          </div>

          {/* Code */}
          <div className="space-y-1">
            <label htmlFor="batch-code" className="block text-sm font-semibold text-slate-900">
              Unique Code <span className="text-red-500">*</span>
            </label>
            <Input
              id="batch-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. FE-25Q1"
              hasError={Boolean(errors.code)}
              disabled={isSubmitting}
              className="font-mono uppercase"
            />
            {errors.code ? <p className="text-xs text-red-500">{errors.code}</p> : null}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="batch-start" className="block text-sm font-semibold text-slate-900">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                id="batch-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-12 w-full rounded-[12px] border border-slate-200 bg-white px-3 text-sm text-slate-900 transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none"
              />
              {errors.startDate ? <p className="text-xs text-red-500">{errors.startDate}</p> : null}
            </div>

            <div className="space-y-1">
              <label htmlFor="batch-end" className="block text-sm font-semibold text-slate-900">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                id="batch-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-12 w-full rounded-[12px] border border-slate-200 bg-white px-3 text-sm text-slate-900 transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none"
              />
              {errors.endDate ? <p className="text-xs text-red-500">{errors.endDate}</p> : null}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label htmlFor="batch-desc" className="block text-sm font-semibold text-slate-900">
              Description <span className="text-xs font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="batch-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief objective of this training cohort..."
              className="w-full rounded-[12px] border border-slate-200 bg-white p-3 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none"
            />
          </div>

          {/* Initial Status Notice */}
          <div className="rounded-[12px] border border-blue-200 bg-blue-50 p-3.5 text-xs leading-relaxed text-blue-900">
            <span className="mb-0.5 block font-semibold">Initial Status: DRAFT</span>
            New batches begin in Draft status. You can configure mentor-mentee members and courses
            before making the batch Live for mentees.
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 p-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-[10px] border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-batch-form"
            disabled={isSubmitting}
            className="rounded-[10px] bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Creating...' : 'Create Batch'}
          </button>
        </div>
      </div>
    </div>
  );
}
