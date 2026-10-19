import { z } from 'zod';

export const auditTypeEnum = z.enum([
  'AUTH',
  'USER',
  'MENTOR_MAPPING',
  'BATCH',
  'COURSE',
  'COURSE_ALLOCATION',
  'SUBMISSION',
  'GRADING',
]);

export type AuditType = z.infer<typeof auditTypeEnum>;

export const auditLogFilterSchema = z.object({
  type: auditTypeEnum.optional(),
  actor: z.string().optional(),
  entity: z.string().optional(),
  action: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type AuditLogFilter = z.infer<typeof auditLogFilterSchema>;
