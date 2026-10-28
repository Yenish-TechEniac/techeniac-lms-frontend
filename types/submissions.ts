import { Assignment, SubmissionMode } from './courses';

export { SubmissionMode };

export type AssignmentDerivedStatus =
  'PENDING' | 'SUBMITTED' | 'RESUBMIT_REQUESTED' | 'GRADED' | 'OVERDUE' | 'CLOSED';

export type SubmissionStatus = 'SUBMITTED' | 'GRADED' | 'RESUBMIT_REQUESTED';

export interface SubmissionData {
  pdfUrl?: string | null;
  zipUrl?: string | null;
  linkUrl?: string | null;
  pdf_url?: string | null;
  zip_url?: string | null;
  url?: string | null;
}

export interface SubmissionVersion {
  id: string;
  courseAllocationId: string;
  assignmentId: string;
  version: number;
  submissionData: SubmissionData;
  confirmedCompleteAt: string;
  submittedAt: string;
  isLate: boolean;
  status: SubmissionStatus;
  marks: number | null;
  gradeLabel: string | null;
  feedback: string | null;
  gradedBy: string | null;
  gradedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentWithSubmissionStatus {
  id: string;
  courseId: string;
  courseTitle: string;
  topicId: string | null;
  topicTitle: string | null;
  scope: string;
  title: string;
  instructions: string | null;
  estimatedMinutes: number;
  maxMarks: number;
  passMarks: number;
  allowLate: boolean;
  pdfMode: SubmissionMode;
  zipMode: SubmissionMode;
  urlMode: SubmissionMode;
  resources: unknown;
  dueDate: string;
  status: AssignmentDerivedStatus;
  latestSubmission?: {
    id: string;
    version: number;
    submittedAt: string;
    isLate: boolean;
    status: SubmissionStatus;
    marks: number | null;
    gradeLabel: string | null;
    feedback: string | null;
  } | null;
}

export interface ListMyAssignmentsQuery {
  page?: number | undefined;
  limit?: number | undefined;
  status?: AssignmentDerivedStatus | undefined;
  courseId?: string | undefined;
}

export interface PaginatedAssignmentsResponse {
  items: AssignmentWithSubmissionStatus[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AssignmentSubmissionDetails {
  assignment: Assignment;
  allocation: {
    allocationId: string;
    dueDate: string;
    batchId: string | null;
    batchStatus: string;
    isBatchActive: boolean;
  };
  versions: SubmissionVersion[];
}

export interface CreateSubmissionInput {
  assignmentId: string;
  submissionData: SubmissionData;
  confirmedComplete: boolean;
}
