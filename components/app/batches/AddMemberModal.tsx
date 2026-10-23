'use client';

import React, { useState } from 'react';

import { Modal } from '@/components/patterns/Modal';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { P, Span } from '@/components/ui/Typography';
import { useAddBatchMembersMutation } from '@/hooks/useBatches';
import { useUsers } from '@/hooks/useUsers';

export interface AddMemberModalProps {
  batchId: string;
  batchName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingMemberUserIds: string[];
}

export function AddMemberModal({
  batchId,
  batchName,
  isOpen,
  onClose,
  onSuccess,
  existingMemberUserIds,
}: AddMemberModalProps) {
  const [role, setRole] = useState<'MENTEE' | 'MENTOR'>('MENTEE');
  const [search, setSearch] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    users: candidates,
    isLoading: isLoadingCandidates,
    fetchUsers,
  } = useUsers({
    role,
    status: 'active',
    limit: 100,
  });

  const { mutateAsync: addMembers, isPending: isSubmitting } = useAddBatchMembersMutation();

  const handleRoleChange = (newRole: 'MENTEE' | 'MENTOR') => {
    setRole(newRole);
    setSelectedUserIds([]);
    setSubmitError(null);
    void fetchUsers({ role: newRole, status: 'active', limit: 100 });
  };

  if (!isOpen) return null;

  const filteredCandidates = candidates.filter((user) => {
    if (existingMemberUserIds.includes(user.id)) return false;
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term);
  });

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedUserIds.length === 0) {
      setSubmitError('Please select at least one user to add.');
      return;
    }
    setSubmitError(null);

    try {
      await addMembers({
        batchId,
        userIds: selectedUserIds,
        memberRole: role,
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to add members to batch.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Batch Members"
      description={
        <Span className="text-xs text-slate-600">
          Enroll mentors or mentees into <strong className="text-slate-900">{batchName}</strong>
        </Span>
      }
      size="lg"
      footer={
        <div className="flex w-full items-center justify-between">
          <Span className="text-xs font-semibold text-slate-600">
            {selectedUserIds.length} candidate{selectedUserIds.length === 1 ? '' : 's'} selected
          </Span>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="add-member-form"
              variant="primary"
              size="sm"
              disabled={isSubmitting || selectedUserIds.length === 0}
              isLoading={isSubmitting}
            >
              Add Selected ({selectedUserIds.length})
            </Button>
          </div>
        </div>
      }
    >
      <form
        id="add-member-form"
        onSubmit={(e) => {
          void handleSubmit(e);
        }}
        className="space-y-4"
      >
        {submitError ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 p-3.5 text-xs text-red-800"
          >
            <Span className="mt-0.5 text-sm">⚠️</Span>
            <P className="text-xs leading-relaxed font-semibold text-red-800">{submitError}</P>
          </div>
        ) : null}

        {/* Role toggle */}
        <div className="space-y-1.5">
          <Label required>Select Role to Enroll</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={role === 'MENTEE' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handleRoleChange('MENTEE')}
              className={
                role === 'MENTEE'
                  ? 'bg-blue-600 font-bold text-white shadow-xs'
                  : 'font-semibold text-slate-700'
              }
            >
              Mentees
            </Button>
            <Button
              type="button"
              variant={role === 'MENTOR' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handleRoleChange('MENTOR')}
              className={
                role === 'MENTOR'
                  ? 'bg-blue-600 font-bold text-white shadow-xs'
                  : 'font-semibold text-slate-700'
              }
            >
              Mentors
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="space-y-1.5">
          <Label htmlFor="candidate-search">Search Candidates</Label>
          <Input
            id="candidate-search"
            type="text"
            placeholder={`Search ${role.toLowerCase()}s by name or email...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Candidate list */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label>
              Eligible {role === 'MENTEE' ? 'Mentees' : 'Mentors'} ({filteredCandidates.length})
            </Label>
            {filteredCandidates.length > 0 ? (
              <Span className="text-[11px] text-slate-500">Click to select</Span>
            ) : null}
          </div>
          <div className="max-h-60 space-y-1.5 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/70 p-2">
            {isLoadingCandidates ? (
              <P className="p-4 text-center text-xs font-medium text-slate-500">
                Loading candidate users...
              </P>
            ) : filteredCandidates.length === 0 ? (
              <P className="p-4 text-center text-xs font-medium text-slate-500">
                No eligible active {role.toLowerCase()}s available to add.
              </P>
            ) : (
              filteredCandidates.map((user) => {
                const isSelected = selectedUserIds.includes(user.id);
                return (
                  <Label
                    key={user.id}
                    htmlFor={`user-select-${user.id}`}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-2.5 text-xs font-normal transition-all ${
                      isSelected
                        ? 'border-blue-400 bg-blue-50/90 text-blue-900 shadow-xs ring-1 ring-blue-300'
                        : 'border-slate-200 bg-white text-slate-800 shadow-xs hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`user-select-${user.id}`}
                        checked={isSelected}
                        onChange={() => toggleUser(user.id)}
                      />
                      <div>
                        <P className="text-xs font-bold text-slate-900">{user.name}</P>
                        <Span className="text-[11px] text-slate-500">{user.email}</Span>
                      </div>
                    </div>
                    <Span
                      className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold ${
                        user.role === 'MENTOR'
                          ? 'border-purple-200 bg-purple-100 text-purple-800'
                          : 'border-blue-200 bg-blue-100 text-blue-800'
                      }`}
                    >
                      {user.role}
                    </Span>
                  </Label>
                );
              })
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}
