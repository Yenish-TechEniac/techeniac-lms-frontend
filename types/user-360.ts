import type { UserRole } from '@/lib/validation';
import type { ApiUser } from '@/services/users.service';

export type UserRoleType = UserRole;

export interface User360SafeUser extends ApiUser {
  deletedAt: string | null;
}

export interface User360RoleHistoryItem {
  id: string;
  role: UserRoleType;
  fromAt: string;
  toAt: string | null;
  reason: string;
  changedBy: string | null;
  periodLabel: string;
}

export interface User360BatchHistoryItem {
  id: string;
  batchId: string;
  batchName: string;
  batchCode: string;
  role: string;
  joinedAt: string;
  leftAt: string | null;
  reasonToLeave: string | null;
  isActive: boolean;
  periodLabel: string;
}

export interface User360MentorMappingItem {
  id: string;
  batchId: string;
  batchCode: string;
  mappedRole: 'MENTOR' | 'MENTEE';
  peerId: string;
  peerName: string;
  peerEmail: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  endReason: string | null;
  periodLabel: string;
}

export interface User360CourseHistoryItem {
  id: string;
  courseId: string;
  courseTitle: string;
  batchId: string | null;
  batchCode: string | null;
  status: string;
  startDate: string;
  dueDate: string;
  completedAt: string | null;
  progressPercent: number;
  periodLabel: string;
}

export interface User360SubmissionHistoryItem {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  courseAllocationId: string;
  batchId: string | null;
  version: number;
  status: string;
  submittedAt: string;
  isLate: boolean;
  marks: number | null;
  gradeLabel: string | null;
  feedback: string | null;
  gradedAt: string | null;
  graderName: string | null;
  periodLabel: string;
}

export interface User360PerformanceSummary {
  totalAllocations: number;
  completedAllocations: number;
  inProgressAllocations: number;
  averageProgressPercent: number;
  totalSubmissions: number;
  gradedSubmissions: number;
  averageMarks: number | null;
  onTimeSubmissions: number;
  lateSubmissions: number;
  onTimeRatePercent: number;
  gradeDistribution: Record<string, number>;
}

export interface User360AuditHistoryItem {
  id: string;
  type: string;
  action: string;
  timestamp: string;
  actorId: string | null;
  details: Record<string, unknown>;
  periodLabel: string;
}

export interface User360Profile {
  user: User360SafeUser;
  tabs: {
    profile: User360SafeUser;
    roleHistory: User360RoleHistoryItem[];
    batchHistory: User360BatchHistoryItem[];
    mentorMappingHistory: User360MentorMappingItem[];
    courseHistory: User360CourseHistoryItem[];
    assignmentGradeHistory: User360SubmissionHistoryItem[];
    performanceSummary: User360PerformanceSummary;
    audit: User360AuditHistoryItem[];
  };
}

export interface User360FilterState {
  rolePeriod?: string | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
  auditType?: string | undefined;
}
