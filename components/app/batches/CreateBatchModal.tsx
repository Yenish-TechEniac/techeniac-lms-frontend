'use client';

import React, { useState } from 'react';

import { Modal } from '@/components/patterns/Modal';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { FieldError } from '@/components/ui/FieldError';
import { Form } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { P, Span } from '@/components/ui/Typography';
import { useCreateBatchMutation } from '@/hooks/useBatches';
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

  const { mutateAsync: createBatch, isPending: isSubmitting } = useCreateBatchMutation();

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

    try {
      await createBatch(result.data);
      onSuccess(result.data);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create batch.';
      setErrors({ general: message });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Batch"
      description="Set up a cohort for grouped course allocations and mentor mappings."
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-batch-form"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
          >
            Create Batch
          </Button>
        </>
      }
    >
      <Form
        id="create-batch-form"
        onSubmit={(e) => {
          void handleSubmit(e);
        }}
        className="space-y-4"
      >
        {errors.general ? (
          <Alert variant="error" title="Batch Creation Failed" message={errors.general} />
        ) : null}

        {/* Name */}
        <div className="space-y-1">
          <Label htmlFor="batch-name" required>
            Batch Name
          </Label>
          <Input
            id="batch-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Frontend Engineering Cohort 2025"
            hasError={Boolean(errors.name)}
            disabled={isSubmitting}
          />
          {errors.name ? <FieldError error={errors.name} /> : null}
        </div>

        {/* Code */}
        <div className="space-y-1">
          <Label htmlFor="batch-code" required>
            Unique Code
          </Label>
          <Input
            id="batch-code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. FE-25Q1"
            hasError={Boolean(errors.code)}
            disabled={isSubmitting}
            className="font-mono uppercase"
          />
          {errors.code ? <FieldError error={errors.code} /> : null}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="batch-start" required>
              Start Date
            </Label>
            <Input
              id="batch-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              hasError={Boolean(errors.startDate)}
              disabled={isSubmitting}
            />
            {errors.startDate ? <FieldError error={errors.startDate} /> : null}
          </div>

          <div className="space-y-1">
            <Label htmlFor="batch-end" required>
              End Date
            </Label>
            <Input
              id="batch-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              hasError={Boolean(errors.endDate)}
              disabled={isSubmitting}
            />
            {errors.endDate ? <FieldError error={errors.endDate} /> : null}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <Label htmlFor="batch-desc">
            Description <Span className="text-xs font-normal text-slate-400">(optional)</Span>
          </Label>
          <Textarea
            id="batch-desc"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief objective of this training cohort..."
            disabled={isSubmitting}
          />
        </div>

        {/* Initial Status Notice */}
        <div className="rounded-[12px] border border-blue-200 bg-blue-50 p-3.5 text-xs leading-relaxed text-blue-900">
          <Span className="mb-0.5 block font-semibold">Initial Status: DRAFT</Span>
          <P className="text-xs text-blue-900">
            New batches begin in Draft status. You can configure mentor-mentee members and courses
            before making the batch Live for mentees.
          </P>
        </div>
      </Form>
    </Modal>
  );
}
