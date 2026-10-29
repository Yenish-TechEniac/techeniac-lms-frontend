'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';

import { AssignCourseModal } from '@/components/app/allocations/AssignCourseModal';
import { AddMemberModal } from '@/components/app/batches/AddMemberModal';
import { BatchStatusModal } from '@/components/app/batches/BatchStatusModal';
import { CreateBatchModal } from '@/components/app/batches/CreateBatchModal';
import { MapMenteeModal } from '@/components/app/batches/MapMenteeModal';
import {
  type BatchOption,
  TransferMenteeModal,
} from '@/components/app/batches/TransferMenteeModal';
import { PortalSessionState } from '@/components/app/navigation/PortalSessionState';
import { Modal } from '@/components/patterns/Modal';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { H1, H3, P, Span } from '@/components/ui/Typography';
import { useBatchAllocations } from '@/hooks/useAllocations';
import {
  useAvailableBatches,
  useBatchDetail,
  useRemoveBatchMemberMutation,
} from '@/hooks/useBatches';
import { useRoleRedirect } from '@/hooks/useRoleRedirect';
import { formatErrorMessage } from '@/lib/errors';
import { type BatchStatus, isBatchLocked } from '@/lib/validation';

export interface BatchMemberItem {
  id: string;
  name: string;
  email: string;
  memberRole: 'MENTOR' | 'MENTEE';
  mappedToName?: string | undefined;
  joinedAt: string;
}

export interface AllocatedCourseItem {
  id: string;
  title: string;
  dueDate: string;
  averageProgress: number;
  status: string;
}

export interface StatusHistoryEntry {
  id: string;
  fromStatus: BatchStatus;
  toStatus: BatchStatus;
  changedBy: string;
  changedAt: string;
  reason?: string | undefined;
}

export interface BatchDetailData {
  id: string;
  name: string;
  code: string;
  status: BatchStatus;
  startDate: string;
  endDate: string;
  description?: string | undefined;
  members: BatchMemberItem[];
  courses: AllocatedCourseItem[];
  history: StatusHistoryEntry[];
}

function getBatchStatusBadgeClass(status: BatchStatus): string {
  switch (status) {
    case 'LIVE':
      return 'bg-emerald-100 text-emerald-800';
    case 'DRAFT':
      return 'bg-blue-100 text-blue-800';
    case 'ON_HOLD':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-slate-200 text-slate-800';
  }
}

function MentorMappingCell({
  member,
  onOpenMapping,
  isArchived = false,
}: Readonly<{
  member: BatchMemberItem;
  onOpenMapping: (targetMentee: {
    id: string;
    name: string;
    currentMentorName?: string | undefined;
  }) => void;
  isArchived?: boolean | undefined;
}>) {
  if (member.memberRole !== 'MENTEE') {
    return <Span className="text-slate-400">—</Span>;
  }

  if (member.mappedToName) {
    return (
      <div className="flex items-center gap-2">
        <Span className="font-semibold text-slate-900">{member.mappedToName}</Span>
        {!isArchived ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              onOpenMapping({
                id: member.id,
                name: member.name,
                currentMentorName: member.mappedToName,
              })
            }
            className="h-6 px-1.5 text-[11px] font-bold text-blue-600 hover:bg-blue-50"
          >
            Reassign
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Span className="rounded-md bg-amber-100 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-800">
        Unmapped
      </Span>
      {!isArchived ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            onOpenMapping({
              id: member.id,
              name: member.name,
            })
          }
          className="h-6 px-1.5 text-[11px] font-bold text-blue-600 hover:bg-blue-50"
        >
          Assign Mentor
        </Button>
      ) : null}
    </div>
  );
}

export function BatchDashboardView({
  batchId,
  initialBatch,
}: Readonly<{
  batchId?: string | undefined;
  initialBatch?: BatchDetailData | undefined;
}>) {
  const router = useRouter();
  const { user, isAuthorized, sessionError } = useRoleRedirect({ allowedRoles: ['SUPER_ADMIN'] });

  const [activeTab, setActiveTab] = useState<'members' | 'courses' | 'timeline'>('members');

  // Modals state
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [menteeToTransfer, setMenteeToTransfer] = useState<{
    id: string;
    name: string;
    currentBatchId: string;
    currentBatchName: string;
  } | null>(null);
  const [mapMenteeTarget, setMapMenteeTarget] = useState<{
    isOpen: boolean;
    targetMentee?: { id: string; name: string; currentMentorName?: string | undefined } | null;
  }>({ isOpen: false, targetMentee: null });

  const activeId = batchId ?? initialBatch?.id ?? '';
  const [isAssignCourseModalOpen, setIsAssignCourseModalOpen] = useState(false);
  const {
    data: serverBatchDetail,
    isLoading,
    isError,
    error: batchError,
    refetch: refetchBatch,
  } = useBatchDetail(activeId);
  const { data: batchAllocationsData, refetch: refetchAllocations } = useBatchAllocations(activeId);
  const { data: availableBatchesList } = useAvailableBatches();
  const removeMemberMutation = useRemoveBatchMemberMutation();

  const [memberToRemove, setMemberToRemove] = useState<{
    id: string;
    name: string;
    role: string;
  } | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const handleConfirmRemoveMember = async () => {
    if (!memberToRemove) return;
    setRemoveError(null);
    try {
      await removeMemberMutation.mutateAsync({ batchId: activeId, userId: memberToRemove.id });
      setMemberToRemove(null);
    } catch (err: unknown) {
      setRemoveError(formatErrorMessage(err, 'Failed to remove member from batch.'));
    }
  };

  const allocatedCourses = useMemo<AllocatedCourseItem[]>(() => {
    const allocs = batchAllocationsData?.items ?? [];
    if (allocs.length === 0) return [];

    const map = new Map<
      string,
      { title: string; dueDate: string; totalProgress: number; count: number; status: string }
    >();

    for (const a of allocs) {
      const cId = a.courseId;
      const title = a.course?.title ?? 'Untitled Course';
      const existing = map.get(cId);
      if (!existing) {
        map.set(cId, {
          title,
          dueDate: new Date(a.dueDate).toLocaleDateString(),
          totalProgress: a.progressPercent,
          count: 1,
          status: a.status,
        });
      } else {
        existing.totalProgress += a.progressPercent;
        existing.count += 1;
      }
    }

    return Array.from(map.entries()).map(([id, val]) => ({
      id,
      title: val.title,
      dueDate: val.dueDate,
      averageProgress: Math.round(val.totalProgress / val.count),
      status: val.status,
    }));
  }, [batchAllocationsData]);

  const batch: BatchDetailData | null = useMemo(() => {
    if (serverBatchDetail) {
      return {
        id: serverBatchDetail.id,
        name: serverBatchDetail.name,
        code: serverBatchDetail.code,
        status: serverBatchDetail.status,
        startDate: serverBatchDetail.startDate,
        endDate: serverBatchDetail.endDate,
        description: serverBatchDetail.description ?? initialBatch?.description,
        members: serverBatchDetail.members ?? [],
        courses: allocatedCourses,
        history: serverBatchDetail.history ?? [],
      };
    }
    return initialBatch ?? null;
  }, [serverBatchDetail, initialBatch, allocatedCourses]);

  const availableBatches: BatchOption[] = useMemo(() => {
    if (!availableBatchesList || !Array.isArray(availableBatchesList)) return [];
    return availableBatchesList.map((b) => ({
      id: b.id,
      name: b.name,
      code: b.code,
      status: b.status,
    }));
  }, [availableBatchesList]);

  const mentees = useMemo(() => {
    if (!batch) return [];
    return batch.members.filter((m) => m.memberRole === 'MENTEE');
  }, [batch]);

  const mentors = useMemo(() => {
    if (!batch) return [];
    return batch.members.filter((m) => m.memberRole === 'MENTOR');
  }, [batch]);

  const unmappedMentees = useMemo(() => {
    return mentees
      .filter((m) => !m.mappedToName)
      .map((m) => ({ id: m.id, name: m.name, email: m.email }));
  }, [mentees]);

  const mentorOptions = useMemo(() => {
    return mentors.map((m) => ({ id: m.id, name: m.name, email: m.email }));
  }, [mentors]);

  const isArchived = Boolean(batch && isBatchLocked(batch.status));

  const handleStatusSuccess = () => {
    // TanStack Query invalidation automatically synchronizes batch state
  };

  const handleTransferSuccess = () => {
    // TanStack Query invalidation automatically synchronizes batch state
  };

  if (!isAuthorized || !user) {
    return (
      <PortalSessionState
        sessionError={sessionError}
        loadingMessage="Verifying administrator authorization..."
        spinnerColor="border-blue-600"
      />
    );
  }

  if (isLoading || !batch) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <P className="text-sm font-medium text-slate-500">Loading batch details from database...</P>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4 rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
        <Alert
          variant="error"
          title="Failed to Load Batch Details"
          message={
            batchError instanceof Error
              ? batchError.message
              : 'An unexpected error occurred while fetching the batch details.'
          }
        />
        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/batches')}
          >
            ← Back to Batches
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              void refetchBatch();
            }}
          >
            Retry Fetch
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
          <Link href="/admin/batches" className="transition-colors hover:text-blue-600">
            <Span>Batches</Span>
          </Link>
          <Span>/</Span>
          <Span className="text-blue-600">{batch.code}</Span>
        </div>

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <H1 className="text-3xl font-extrabold tracking-tight text-slate-900">{batch.name}</H1>
            <Span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 font-mono text-xs font-bold text-slate-800">
              {batch.code}
            </Span>
            <Span
              className={`rounded-full px-3 py-1 font-mono text-xs font-bold uppercase ${getBatchStatusBadgeClass(
                batch.status,
              )}`}
            >
              {batch.status}
            </Span>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border-slate-300 bg-white font-bold text-slate-800 shadow-xs hover:bg-slate-50"
            >
              <Span className="text-sm font-extrabold text-blue-600">+</Span>
              <Span>Create Batch</Span>
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsStatusOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm shadow-blue-600/25 hover:bg-blue-700"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <Span>Change Status</Span>
            </Button>
          </div>
        </div>

        <P className="mt-1 text-sm text-slate-600">
          {batch.description || 'Dedicated cohort training track.'}
        </P>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <Span className="block text-xs font-bold tracking-wider text-slate-400 uppercase">
            Active Mentees
          </Span>
          <P className="mt-1 font-mono text-3xl font-bold text-slate-900">{mentees.length}</P>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <Span className="block text-xs font-bold tracking-wider text-slate-400 uppercase">
            Assigned Mentors
          </Span>
          <P className="mt-1 font-mono text-3xl font-bold text-slate-900">{mentors.length}</P>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <Span className="block text-xs font-bold tracking-wider text-slate-400 uppercase">
              Allocated Courses
            </Span>
            <Span className="rounded-full bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-blue-700">
              Module 6
            </Span>
          </div>
          <P className="mt-1 font-mono text-3xl font-bold text-slate-900">
            {batch.courses.length > 0 ? batch.courses.length : '—'}
          </P>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <Span className="block text-xs font-bold tracking-wider text-slate-400 uppercase">
            Timeline Window
          </Span>
          <P className="mt-2 font-mono text-sm font-semibold text-slate-800">
            {batch.startDate} → {batch.endDate}
          </P>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setActiveTab('members')}
          className={`h-auto rounded-none border-b-2 px-4 py-3 text-sm font-bold transition-all ${
            activeTab === 'members'
              ? 'border-blue-600 text-blue-600 hover:text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Members ({batch.members.length})
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setActiveTab('courses')}
          className={`h-auto rounded-none border-b-2 px-4 py-3 text-sm font-bold transition-all ${
            activeTab === 'courses'
              ? 'border-blue-600 text-blue-600 hover:text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Allocated Courses (Module 6)
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setActiveTab('timeline')}
          className={`h-auto rounded-none border-b-2 px-4 py-3 text-sm font-bold transition-all ${
            activeTab === 'timeline'
              ? 'border-blue-600 text-blue-600 hover:text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Status Timeline ({batch.history.length})
        </Button>
      </div>

      {/* Tab 1: Members */}
      {activeTab === 'members' ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <div>
              <H3 className="text-sm font-bold text-slate-800">Cohort Roster</H3>
              <P className="text-xs text-slate-500">
                A mentee can belong to only 1 active cohort at a time (FR-5.2)
              </P>
            </div>
            <div className="flex items-center gap-2">
              {mentors.length > 0 && unmappedMentees.length > 0 && !isArchived ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMapMenteeTarget({ isOpen: true, targetMentee: null })}
                  className="flex items-center gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  <Span>Map Mentees ({unmappedMentees.length})</Span>
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isArchived}
                title={isArchived ? "Can't add in archived batch" : undefined}
                onClick={() => setIsAddMemberOpen(true)}
                className="flex items-center gap-1.5"
              >
                <Span>+</Span>
                <Span>Add Members</Span>
              </Button>
            </div>
          </div>

          {batch.members.length === 0 ? (
            <div className="p-12 text-center">
              <svg
                className="mx-auto h-10 w-10 text-slate-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <H3 className="mt-3 text-sm font-bold text-slate-800">No Members Enrolled Yet</H3>
              <P className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                {isArchived
                  ? 'This batch is archived. Members cannot be added to an archived cohort.'
                  : 'This batch has no mentors or mentees assigned. Use the “Add Members” button above to enroll users.'}
              </P>
            </div>
          ) : (
            <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Mapped Mentor</TableHead>
                    <TableHead>Enrolled Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batch.members.map((m) => (
                    <TableRow key={m.id} className="transition-colors hover:bg-slate-50/60">
                      <TableCell>
                        <P className="font-semibold text-slate-900">{m.name}</P>
                        <P className="font-mono text-xs text-slate-500">{m.email}</P>
                      </TableCell>
                      <TableCell>
                        <Span
                          className={`inline-block rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold ${
                            m.memberRole === 'MENTOR'
                              ? 'border border-blue-200 bg-blue-50 text-blue-700'
                              : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {m.memberRole}
                        </Span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-700">
                        <MentorMappingCell
                          member={m}
                          isArchived={isArchived}
                          onOpenMapping={(target) =>
                            setMapMenteeTarget({ isOpen: true, targetMentee: target })
                          }
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">
                        <Span>{m.joinedAt}</Span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {m.memberRole === 'MENTEE' && !isArchived ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setMenteeToTransfer({
                                  id: m.id,
                                  name: m.name,
                                  currentBatchId: batch.id,
                                  currentBatchName: batch.name,
                                })
                              }
                              className="px-2.5 py-1 text-xs text-[#0044D3] hover:bg-blue-50"
                            >
                              Transfer
                            </Button>
                          ) : null}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={removeMemberMutation.isPending || isArchived}
                            title={isArchived ? "Can't remove from archived batch" : undefined}
                            onClick={() => {
                              setMemberToRemove({ id: m.id, name: m.name, role: m.memberRole });
                            }}
                            className="px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            Remove
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </div>
      ) : null}

      {/* Tab 2: Courses */}
      {activeTab === 'courses' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <P className="text-xs text-slate-500">
              Curriculum allocations assigned to members of this cohort.
            </P>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAssignCourseModalOpen(true)}
              className="text-xs font-semibold"
            >
              + Allocate Course
            </Button>
          </div>
          {batch.courses.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Target Due Date</TableHead>
                    <TableHead>Cohort Avg Progress</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batch.courses.map((c) => (
                    <TableRow key={c.id} className="transition-colors hover:bg-slate-50/60">
                      <TableCell className="font-semibold text-slate-900">
                        <Span>{c.title}</Span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-600">
                        <Span>{c.dueDate}</Span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-[#0044D3]"
                              style={{ width: `${c.averageProgress}%` }}
                            />
                          </div>
                          <Span className="font-mono text-xs font-semibold text-slate-700">
                            {c.averageProgress}%
                          </Span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-mono text-xs font-medium text-emerald-700">
                          {c.status}
                        </Span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-sm">
              <svg
                className="mx-auto h-10 w-10 text-slate-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <H3 className="mt-3 text-base font-bold text-slate-900">No Courses Allocated Yet</H3>
              <P className="mx-auto mt-1 max-w-md text-xs text-slate-500">
                Allocate active curriculum from the Course Library to this cohort.
              </P>
              <div className="mt-4">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setIsAssignCourseModalOpen(true)}
                >
                  Allocate Course
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Tab 3: Timeline */}
      {activeTab === 'timeline' ? (
        <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <H3 className="text-sm font-bold text-slate-900">Batch Status Transition Timeline</H3>
          {batch.history.length === 0 ? (
            <P className="text-xs text-slate-500">
              No status transitions recorded for this batch yet.
            </P>
          ) : (
            <div className="relative space-y-6 pl-6 before:absolute before:top-2 before:bottom-2 before:left-2.5 before:w-0.5 before:bg-slate-200">
              {batch.history.map((h) => (
                <div key={h.id} className="relative">
                  <Span className="absolute top-1 -left-6 h-3.5 w-3.5 rounded-full bg-blue-600 ring-4 ring-white" />
                  <div className="flex items-center gap-3">
                    <Span className="font-mono text-xs font-bold text-slate-800">
                      {h.fromStatus} → {h.toStatus}
                    </Span>
                    <Span className="font-mono text-xs text-slate-400">{h.changedAt}</Span>
                  </div>
                  <P className="mt-1 text-xs text-slate-600">
                    By <strong className="font-semibold text-slate-800">{h.changedBy}</strong>
                    {h.reason ? ` — "${h.reason}"` : ''}
                  </P>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* Modals */}
      <BatchStatusModal
        key={`batch-status-${batch.id}-${batch.status}-${isStatusOpen ? 'open' : 'closed'}`}
        batchId={batch.id}
        batchName={batch.name}
        currentStatus={batch.status}
        isOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        onSuccess={handleStatusSuccess}
      />

      <TransferMenteeModal
        key={`transfer-mentee-${menteeToTransfer?.id ?? 'none'}`}
        mentee={menteeToTransfer}
        availableBatches={availableBatches}
        isOpen={Boolean(menteeToTransfer)}
        onClose={() => setMenteeToTransfer(null)}
        onSuccess={handleTransferSuccess}
      />

      <AddMemberModal
        key={`add-member-${batch.id}-${batch.status}-${isAddMemberOpen ? 'open' : 'closed'}`}
        batchId={batch.id}
        batchName={batch.name}
        batchStatus={batch.status}
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onSuccess={() => {}}
        existingMemberUserIds={batch.members.map((m) => m.id)}
      />

      <MapMenteeModal
        key={`map-mentee-${batch.id}-${batch.status}-${mapMenteeTarget.targetMentee?.id ?? 'batch-map'}`}
        isOpen={mapMenteeTarget.isOpen}
        onClose={() => setMapMenteeTarget({ isOpen: false, targetMentee: null })}
        onSuccess={() => setMapMenteeTarget({ isOpen: false, targetMentee: null })}
        batchId={batch.id}
        batchName={batch.name}
        batchStatus={batch.status}
        mentors={mentorOptions}
        targetMentee={mapMenteeTarget.targetMentee}
        unmappedMentees={unmappedMentees}
      />

      <CreateBatchModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          setIsCreateOpen(false);
          router.push('/admin/batches');
        }}
      />

      {/* Remove Member Confirmation Modal */}
      <Modal
        isOpen={Boolean(memberToRemove)}
        onClose={() => {
          if (!removeMemberMutation.isPending) {
            setMemberToRemove(null);
            setRemoveError(null);
          }
        }}
        title="Remove Batch Member"
        description="Confirm membership revocation from this batch cohort."
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={removeMemberMutation.isPending}
              onClick={() => {
                setMemberToRemove(null);
                setRemoveError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              disabled={removeMemberMutation.isPending}
              onClick={() => {
                void handleConfirmRemoveMember();
              }}
            >
              {removeMemberMutation.isPending ? 'Removing...' : 'Remove Member'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {removeError ? <Alert variant="error" message={removeError} /> : null}
          <P className="text-sm text-slate-700">
            Are you sure you want to remove {memberToRemove?.role.toLowerCase()}{' '}
            <strong className="font-semibold text-slate-900">{memberToRemove?.name}</strong> from
            this batch?
          </P>
          <P className="text-xs text-slate-500">
            The user will be unlinked from this cohort. Their historical logs, evaluations, and
            learning history will be preserved.
          </P>
        </div>
      </Modal>

      <AssignCourseModal
        isOpen={isAssignCourseModalOpen}
        onClose={() => setIsAssignCourseModalOpen(false)}
        userRole="SUPER_ADMIN"
        onSuccess={() => {
          void refetchAllocations();
        }}
      />
    </div>
  );
}
