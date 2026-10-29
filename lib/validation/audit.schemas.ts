import { z } from 'zod';

export const auditTypeEnum = z.enum([
  'AUTH',
  'USER',
  'MENTOR_MAPPING',
  'COURSE',
  'BATCH',
  'COURSE_ALLOCATION',
  'SUBMISSION',
  'GRADING',
]);

export type AuditType = z.infer<typeof auditTypeEnum>;

export const auditLogFilterSchema = z.object({
  type: auditTypeEnum.optional(),
  actorId: z.string().uuid().optional(),
  entity: z.string().max(100).optional(),
  action: z.string().max(100).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type AuditLogFilter = z.infer<typeof auditLogFilterSchema>;

export interface ApiAuditActor {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface ApiAuditItem {
  id: string;
  actorId: string | null;
  actor: ApiAuditActor | null;
  type: AuditType;
  entity: string;
  entityId: string | null;
  action: string;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuditPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AuditLogsResponse {
  success: boolean;
  data: ApiAuditItem[];
  pagination: AuditPagination;
}
