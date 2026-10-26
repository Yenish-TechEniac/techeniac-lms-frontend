'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';

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
import { H1, H3, P, Span } from '@/components/ui/Typography';
import {
  useAvailableBatches,
  useBatchDetail,
  useRemoveBatchMemberMutation,
} from '@/hooks/useBatches';
import { useRoleRedirect } from '@/hooks/useRoleRedirect';
import { type BatchStatus } from '@/lib/validation';

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
}: Readonly<{
  member: BatchMemberItem;
  onOpenMapping: (targetMentee: {
    id: string;
    name: string;
    currentMentorName?: string | undefined;
  }) => void;
}>) {
  if (member.memberRole !== 'MENTEE') {
    return <Span className="text-slate-400">—</Span>;
  }

  if (member.mappedToName) {
    return (
      <div className="flex items-center gap-2">
        <Span className="font-semibold text-slate-900">{member.mappedToName}</Span>
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
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Span className="rounded-md bg-amber-100 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-800">
        Unmapped
      </Span>
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
  const {
    data: serverBatchDetail,
    isLoading,
    isError,
    error: batchError,
    refetch: refetchBatch,
  } = useBatchDetail(activeId);
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
      setRemoveError(err instanceof Error ? err.message : 'Failed to remove member from batch.');
    }
  };

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
        courses: [],
        history: serverBatchDetail.history ?? [],
      };
    }
    return initialBatch ?? null;
  }, [serverBatchDetail, initialBatch]);

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

  const isArchived = batch?.status === 'ARCHIVED';

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
              <Span>🔄</Span>
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
                  <Span>🔗</Span>
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
                className={`flex items-center gap-1.5 ${isArchived ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                <Span>{isArchived ? '🚫' : '+'}</Span>
                <Span>{isArchived ? "Can't add in archived batch" : 'Add Members'}</Span>
              </Button>
            </div>
          </div>

          {batch.members.length === 0 ? (
            <div className="p-12 text-center">
              <Span className="text-3xl">👥</Span>
              <H3 className="mt-3 text-sm font-bold text-slate-800">No Members Enrolled Yet</H3>
              <P className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                {isArchived
                  ? 'This batch is archived. Members cannot be added to an archived cohort.'
                  : 'This batch has no mentors or mentees assigned. Use the “Add Members” button above to enroll users.'}
              </P>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="border-b border-slate-200/80 bg-slate-50/80 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  <tr>
                    <th className="px-6 py-3">
                      <Span>Member</Span>
                    </th>
                    <th className="px-4 py-3">
                      <Span>Role</Span>
                    </th>
                    <th className="px-4 py-3">
                      <Span>Mapped Mentor</Span>
                    </th>
                    <th className="px-4 py-3">
                      <Span>Enrolled Date</Span>
                    </th>
                    <th className="px-6 py-3 text-right">
                      <Span>Actions</Span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {batch.members.map((m) => (
                    <tr key={m.id} className="transition-colors hover:bg-slate-50/60">
                      <td className="px-6 py-3.5">
                        <P className="font-semibold text-slate-900">{m.name}</P>
                        <P className="font-mono text-xs text-slate-500">{m.email}</P>
                      </td>
                      <td className="px-4 py-3.5">
                        <Span
                          className={`inline-block rounded-full px-2 py-0.5 font-mono text-[11px] font-bold ${
                            m.memberRole === 'MENTOR'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {m.memberRole}
                        </Span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-700">
                        <MentorMappingCell
                          member={m}
                          onOpenMapping={(target) =>
                            setMapMenteeTarget({ isOpen: true, targetMentee: target })
                          }
                        />
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-500">
                        <Span>{m.joinedAt}</Span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
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
                              className="px-2.5 py-1 text-xs text-blue-600 hover:bg-blue-50"
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}

      {/* Tab 2: Courses */}
      {activeTab === 'courses' ? (
        <div className="space-y-4">
          <Alert
            variant="info"
            title="Course Allocation Launches with Module 6"
            message="Curriculum sequencing, syllabus assignment, and automated progress monitoring will become active when Module 6 (Course Management) is connected."
          />
          {batch.courses.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="border-b border-slate-200/80 bg-slate-50/80 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    <tr>
                      <th className="px-6 py-3">
                        <Span>Course</Span>
                      </th>
                      <th className="px-4 py-3">
                        <Span>Target Due Date</Span>
                      </th>
                      <th className="px-4 py-3">
                        <Span>Cohort Avg Progress</Span>
                      </th>
                      <th className="px-6 py-3 text-right">
                        <Span>Status</Span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {batch.courses.map((c) => (
                      <tr key={c.id} className="transition-colors hover:bg-slate-50/60">
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          <Span>{c.title}</Span>
                        </td>
                        <td className="px-4 py-4 font-mono text-xs text-slate-600">
                          <Span>{c.dueDate}</Span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-blue-600"
                                style={{ width: `${c.averageProgress}%` }}
                              />
                            </div>
                            <Span className="font-mono text-xs font-bold text-slate-700">
                              {c.averageProgress}%
                            </Span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-mono text-xs font-medium text-emerald-700">
                            {c.status}
                          </Span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-sm">
              <Span className="text-3xl">📚</Span>
              <H3 className="mt-3 text-base font-bold text-slate-900">No Courses Allocated Yet</H3>
              <P className="mx-auto mt-1 max-w-md text-xs text-slate-500">
                Course allocation and track-level curriculum assignment will be enabled in Module 6.
              </P>
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
        key={`add-member-${batch.id}-${isAddMemberOpen ? 'open' : 'closed'}`}
        batchId={batch.id}
        batchName={batch.name}
        batchStatus={batch.status}
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onSuccess={() => {}}
        existingMemberUserIds={batch.members.map((m) => m.id)}
      />

      <MapMenteeModal
        key={mapMenteeTarget.targetMentee?.id ?? 'batch-map'}
        isOpen={mapMenteeTarget.isOpen}
        onClose={() => setMapMenteeTarget({ isOpen: false, targetMentee: null })}
        onSuccess={() => setMapMenteeTarget({ isOpen: false, targetMentee: null })}
        batchId={batch.id}
        batchName={batch.name}
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
    </div>
  );
}
