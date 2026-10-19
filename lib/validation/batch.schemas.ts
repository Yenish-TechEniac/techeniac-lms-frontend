import { z } from 'zod';

import { createTrimmedStringSchema, uuidSchema } from './common.schemas';

export const batchStatusEnum = z.enum(['DRAFT', 'LIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED']);

export type BatchStatus = z.infer<typeof batchStatusEnum>;

export const ALLOWED_STATUS_TRANSITIONS: Record<BatchStatus, BatchStatus[]> = {
  DRAFT: ['LIVE', 'ARCHIVED'],
  LIVE: ['ON_HOLD', 'COMPLETED'],
  ON_HOLD: ['LIVE', 'COMPLETED'],
  COMPLETED: ['ARCHIVED'],
  ARCHIVED: [],
};

export const createBatchSchema = z
  .object({
    name: createTrimmedStringSchema('Batch name', 3, 100),
    code: z
      .string({ required_error: 'Batch code is required' })
      .trim()
      .min(3, 'Batch code must be at least 3 characters')
      .max(20, 'Batch code must not exceed 20 characters')
      .regex(/^[A-Z0-9-]+$/, 'Batch code must be uppercase alphanumeric and hyphens only')
      .transform((val) => val.toUpperCase()),
    startDate: z.string({ required_error: 'Start date is required' }),
    endDate: z.string({ required_error: 'End date is required' }),
    description: z.string().max(1000, 'Description must not exceed 1000 characters').optional(),
  })
  .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: 'Start date must be earlier than or equal to end date',
    path: ['endDate'],
  });

export type CreateBatchFormData = z.infer<typeof createBatchSchema>;

export const changeBatchStatusSchema = z.object({
  newStatus: batchStatusEnum,
  reason: z.string().max(500, 'Reason must not exceed 500 characters').optional(),
});

export type ChangeBatchStatusFormData = z.infer<typeof changeBatchStatusSchema>;

export const transferMenteeSchema = z.object({
  menteeId: uuidSchema,
  targetBatchId: uuidSchema,
  reason: z.string().max(500).optional(),
});

export type TransferMenteeFormData = z.infer<typeof transferMenteeSchema>;
