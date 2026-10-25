'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';

import { AssignmentEditor } from '@/components/app/courses/AssignmentEditor';
import { ConflictResolutionModal } from '@/components/app/courses/ConflictResolutionModal';
import { CourseDetailsEditor } from '@/components/app/courses/CourseDetailsEditor';
import { CourseOutlineTree } from '@/components/app/courses/CourseOutlineTree';
import { ImpactNoticeModal } from '@/components/app/courses/ImpactNoticeModal';
import { SubtopicEditor } from '@/components/app/courses/SubtopicEditor';
import { TopicEditor } from '@/components/app/courses/TopicEditor';
import { ActiveNodeSelection } from '@/components/app/courses/types';
import { UnsavedChangesModal } from '@/components/app/courses/UnsavedChangesModal';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { FieldError } from '@/components/ui/FieldError';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { H3 } from '@/components/ui/Typography';
import { useAuth } from '@/hooks/useAuth';
import { useCourseBuilder } from '@/hooks/useCourses';
import { formatErrorMessage } from '@/lib/errors';
import { Assignment, AssignmentScope, SubmissionMode, Subtopic, Topic } from '@/types/courses';

function CourseBuilderContent() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { user, isAuthenticated, isLoading } = useAuth();

  const {
    course,
    impact,
    reloadCourse,
    updateCourse,
    createTopic,
    updateTopic,
    deleteTopic,
    reorderTopics,
    createSubtopic,
    updateSubtopic,
    deleteSubtopic,
    reorderSubtopics,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    reorderAssignments,
  } = useCourseBuilder(courseId);

  // Active selection in outline tree
  const [selectedNode, setSelectedNode] = useState<ActiveNodeSelection>({
    type: 'COURSE',
    id: courseId,
  });
  const [pendingSelection, setPendingSelection] = useState<ActiveNodeSelection | null>(null);
  const [mobileTab, setMobileTab] = useState<'outline' | 'editor'>('outline');

  // Form states
  const [isDirty, setIsDirty] = useState(false);
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState(false);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);

  // Add Item Modals State
  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [topicModalError, setTopicModalError] = useState<string | null>(null);

  const [isAddSubtopicOpen, setIsAddSubtopicOpen] = useState(false);
  const [targetTopicId, setTargetTopicId] = useState<string | null>(null);
  const [newSubtopicTitle, setNewSubtopicTitle] = useState('');
  const [isCreatingSubtopic, setIsCreatingSubtopic] = useState(false);
  const [subtopicModalError, setSubtopicModalError] = useState<string | null>(null);

  const [isAddAssignmentOpen, setIsAddAssignmentOpen] = useState(false);
  const [assignmentScope, setAssignmentScope] = useState<AssignmentScope>(AssignmentScope.COURSE);
  const [assignmentTopicId, setAssignmentTopicId] = useState<string | null>(null);
  const [newAssignmentTitle, setNewAssignmentTitle] = useState('');
  const [newAssignmentHours, setNewAssignmentHours] = useState('1');
  const [newAssignmentMinutes, setNewAssignmentMinutes] = useState('0');
  const [newAssignmentMaxMarks, setNewAssignmentMaxMarks] = useState(100);
  const [newAssignmentPassMarks, setNewAssignmentPassMarks] = useState(50);
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
  const [assignmentModalError, setAssignmentModalError] = useState<string | null>(null);

  // Delete Safeguard State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'TOPIC' | 'SUBTOPIC' | 'ASSIGNMENT';
    id: string;
    title: string;
  } | null>(null);
  const [isDeletingNode, setIsDeletingNode] = useState(false);

  // Reorder loading state - array of active reordering IDs for non-blocking concurrent reorders
  const [reorderingIds, setReorderingIds] = useState<string[]>([]);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.replace('/login');
      } else if (user.role !== 'SUPER_ADMIN' && user.role !== 'MENTOR') {
        router.replace('/mentee');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Node Selection with Unsaved Changes Guard (FR-6.14, CRS-22)
  const handleSelectNode = (selection: ActiveNodeSelection) => {
    if (selection.type === selectedNode.type && selection.id === selectedNode.id) {
      setMobileTab('editor');
      return;
    }
    if (isDirty) {
      setPendingSelection(selection);
      setIsUnsavedModalOpen(true);
      return;
    }
    setSelectedNode(selection);
    setMobileTab('editor');
  };

  const confirmDiscardChanges = () => {
    setIsDirty(false);
    setIsUnsavedModalOpen(false);
    if (pendingSelection) {
      setSelectedNode(pendingSelection);
      setPendingSelection(null);
      setMobileTab('editor');
    }
  };

  // Reorder states
  const [isReorderingTopics, setIsReorderingTopics] = useState(false);
  const [reorderingSubtopicTopicIds, setReorderingSubtopicTopicIds] = useState<string[]>([]);
  const [reorderingTopicAssignmentTopicIds, setReorderingTopicAssignmentTopicIds] = useState<
    string[]
  >([]);
  const [isReorderingCourseAssignments, setIsReorderingCourseAssignments] = useState(false);

  // Reorder handlers
  const handleReorderTopics = async (targetId: string, orderedIds: string[]) => {
    setIsReorderingTopics(true);
    setReorderingIds((prev) => (prev.includes(targetId) ? prev : [...prev, targetId]));
    const items = orderedIds.map((id, index) => ({ id, displayOrder: index }));
    try {
      await reorderTopics(items);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to reorder topics');
    } finally {
      setIsReorderingTopics(false);
      setReorderingIds((prev) => prev.filter((id) => id !== targetId));
    }
  };

  const handleReorderSubtopics = async (
    targetId: string,
    topicId: string,
    orderedIds: string[],
  ) => {
    setReorderingSubtopicTopicIds((prev) => (prev.includes(topicId) ? prev : [...prev, topicId]));
    setReorderingIds((prev) => (prev.includes(targetId) ? prev : [...prev, targetId]));
    const items = orderedIds.map((id, index) => ({ id, displayOrder: index }));
    try {
      await reorderSubtopics(topicId, items);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to reorder subtopics');
    } finally {
      setReorderingSubtopicTopicIds((prev) => prev.filter((id) => id !== topicId));
      setReorderingIds((prev) => prev.filter((id) => id !== targetId));
    }
  };

  const handleReorderAssignments = async (
    targetId: string,
    orderedIds: string[],
    topicId?: string,
  ) => {
    if (topicId) {
      setReorderingTopicAssignmentTopicIds((prev) =>
        prev.includes(topicId) ? prev : [...prev, topicId],
      );
    } else {
      setIsReorderingCourseAssignments(true);
    }
    setReorderingIds((prev) => (prev.includes(targetId) ? prev : [...prev, targetId]));
    const items = orderedIds.map((id, index) => ({ id, displayOrder: index }));
    try {
      await reorderAssignments(items);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to reorder assignments');
    } finally {
      if (topicId) {
        setReorderingTopicAssignmentTopicIds((prev) => prev.filter((id) => id !== topicId));
      } else {
        setIsReorderingCourseAssignments(false);
      }
      setReorderingIds((prev) => prev.filter((id) => id !== targetId));
    }
  };

  // Add Item Actions
  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;
    const trimmedTitle = newTopicTitle.trim();
    if (!trimmedTitle) {
      setTopicModalError('Topic title cannot be empty.');
      return;
    }
    if (trimmedTitle.length > 150) {
      setTopicModalError('Topic title cannot exceed 150 characters.');
      return;
    }
    setTopicModalError(null);
    setIsCreatingTopic(true);
    try {
      const created = await createTopic({
        title: trimmedTitle,
        displayOrder: (course.topics?.length ?? 0) + 1,
      });
      setIsAddTopicOpen(false);
      setNewTopicTitle('');
      setSelectedNode({ type: 'TOPIC', id: created.id });
      setMobileTab('editor');
    } catch (err: unknown) {
      setTopicModalError(formatErrorMessage(err, 'Failed to create topic'));
    } finally {
      setIsCreatingTopic(false);
    }
  };

  const handleCreateSubtopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTopicId) return;
    const trimmedTitle = newSubtopicTitle.trim();
    if (!trimmedTitle) {
      setSubtopicModalError('Subtopic title cannot be empty.');
      return;
    }
    if (trimmedTitle.length > 150) {
      setSubtopicModalError('Subtopic title cannot exceed 150 characters.');
      return;
    }
    setSubtopicModalError(null);
    setIsCreatingSubtopic(true);
    try {
      const created = await createSubtopic(targetTopicId, {
        title: trimmedTitle,
      });
      setIsAddSubtopicOpen(false);
      setNewSubtopicTitle('');
      setSelectedNode({
        type: 'SUBTOPIC',
        id: created.id,
        parentTopicId: targetTopicId,
      });
      setMobileTab('editor');
    } catch (err: unknown) {
      setSubtopicModalError(formatErrorMessage(err, 'Failed to create subtopic'));
    } finally {
      setIsCreatingSubtopic(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    const trimmedTitle = newAssignmentTitle.trim();
    if (!trimmedTitle) {
      setAssignmentModalError('Assignment title cannot be empty.');
      return;
    }
    if (trimmedTitle.length > 150) {
      setAssignmentModalError('Assignment title cannot exceed 150 characters.');
      return;
    }

    const calculatedMinutes =
      (parseInt(newAssignmentHours, 10) || 0) * 60 + (parseInt(newAssignmentMinutes, 10) || 0);

    if (calculatedMinutes <= 0) {
      setAssignmentModalError('Estimated duration must be greater than 0 minutes.');
      return;
    }
    if (newAssignmentMinutes !== '') {
      const parsedMins = parseInt(newAssignmentMinutes, 10);
      if (isNaN(parsedMins) || parsedMins < 0 || parsedMins > 59) {
        setAssignmentModalError('Minutes must be between 0 and 59.');
        return;
      }
    }
    if (!newAssignmentMaxMarks || newAssignmentMaxMarks <= 0) {
      setAssignmentModalError('Max marks must be greater than 0.');
      return;
    }
    if (newAssignmentMaxMarks > 1000) {
      setAssignmentModalError('Max marks cannot exceed 1000.');
      return;
    }
    if (!newAssignmentPassMarks || newAssignmentPassMarks <= 0) {
      setAssignmentModalError('Pass marks must be greater than 0.');
      return;
    }
    if (newAssignmentPassMarks > newAssignmentMaxMarks) {
      setAssignmentModalError('Pass marks cannot be greater than max marks.');
      return;
    }

    setAssignmentModalError(null);
    setIsCreatingAssignment(true);

    try {
      const created = await createAssignment({
        scope: assignmentScope,
        topicId: assignmentScope === AssignmentScope.TOPIC ? assignmentTopicId : null,
        title: trimmedTitle,
        estimatedMinutes: calculatedMinutes,
        maxMarks: newAssignmentMaxMarks,
        passMarks: newAssignmentPassMarks,
        pdfMode: SubmissionMode.REQUIRED,
        zipMode: SubmissionMode.OFF,
        urlMode: SubmissionMode.OFF,
      });
      setIsAddAssignmentOpen(false);
      setNewAssignmentTitle('');
      setNewAssignmentHours('1');
      setNewAssignmentMinutes('0');
      setSelectedNode({
        type: 'ASSIGNMENT',
        id: created.id,
        parentTopicId: assignmentTopicId ?? undefined,
      });
      setMobileTab('editor');
    } catch (err: unknown) {
      setAssignmentModalError(formatErrorMessage(err, 'Failed to create assignment'));
    } finally {
      setIsCreatingAssignment(false);
    }
  };

  // Delete Action Confirmation (FR-6.10, CRS-14)
  const handleConfirmDeleteNode = async () => {
    if (!deleteTarget) return;
    setIsDeletingNode(true);
    try {
      if (deleteTarget.type === 'TOPIC') {
        await deleteTopic(deleteTarget.id);
      } else if (deleteTarget.type === 'SUBTOPIC') {
        await deleteSubtopic(deleteTarget.id);
      } else if (deleteTarget.type === 'ASSIGNMENT') {
        await deleteAssignment(deleteTarget.id);
      }
      setDeleteTarget(null);
      setSelectedNode({ type: 'COURSE', id: courseId });
      setMobileTab('outline');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete item');
    } finally {
      setIsDeletingNode(false);
    }
  };

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-xs font-medium text-slate-500">Loading Course Builder...</p>
        </div>
      </div>
    );
  }

  // Active node entity lookup
  let activeEditorComponent: React.ReactNode = null;

  if (selectedNode.type === 'COURSE') {
    const topicsTotalMinutes =
      course.topics?.reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0) || 0;

    activeEditorComponent = (
      <CourseDetailsEditor
        key={course.id}
        course={course}
        impact={impact}
        topicsTotalMinutes={topicsTotalMinutes}
        onSaveCourse={updateCourse}
        onConflict={() => setIsConflictModalOpen(true)}
        onDirtyChange={setIsDirty}
      />
    );
  } else if (selectedNode.type === 'TOPIC') {
    const topic = course.topics?.find((t) => t.id === selectedNode.id);
    if (topic) {
      const otherTopicsMinutes =
        course.topics
          ?.filter((t) => t.id !== topic.id)
          .reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0) || 0;

      activeEditorComponent = (
        <TopicEditor
          key={topic.id}
          topic={topic}
          impact={impact}
          courseEstimatedMinutes={course.estimatedMinutes}
          otherTopicsMinutes={otherTopicsMinutes}
          onSaveTopic={(payload) => updateTopic(topic.id, payload)}
          onConflict={() => setIsConflictModalOpen(true)}
          onDirtyChange={setIsDirty}
        />
      );
    }
  } else if (selectedNode.type === 'SUBTOPIC') {
    let subtopic: Subtopic | undefined;
    let parentTopic: Topic | undefined;
    for (const t of course.topics || []) {
      const match = t.subtopics?.find((s) => s.id === selectedNode.id);
      if (match) {
        subtopic = match;
        parentTopic = t;
        break;
      }
    }
    if (subtopic) {
      const otherSubtopicsMinutes =
        parentTopic?.subtopics
          ?.filter((s) => s.id !== subtopic?.id)
          .reduce((acc, s) => acc + (s.estimatedMinutes || 0), 0) || 0;

      activeEditorComponent = (
        <SubtopicEditor
          key={subtopic.id}
          subtopic={subtopic}
          impact={impact}
          parentTopicTitle={parentTopic?.title}
          parentTopicEstimatedMinutes={parentTopic?.estimatedMinutes}
          otherSubtopicsMinutes={otherSubtopicsMinutes}
          onSaveSubtopic={(payload) => {
            if (!subtopic) throw new Error('Subtopic not found');
            return updateSubtopic(subtopic.id, payload);
          }}
          onConflict={() => setIsConflictModalOpen(true)}
          onDirtyChange={setIsDirty}
        />
      );
    }
  } else if (selectedNode.type === 'ASSIGNMENT') {
    let assignment: Assignment | undefined = (course.courseAssignments || course.assignments)?.find(
      (a) => a.id === selectedNode.id,
    );
    if (!assignment) {
      for (const t of course.topics || []) {
        const match = t.assignments?.find((a) => a.id === selectedNode.id);
        if (match) {
          assignment = match;
          break;
        }
      }
    }
    if (assignment) {
      activeEditorComponent = (
        <AssignmentEditor
          key={assignment.id}
          assignment={assignment}
          impact={impact}
          onSaveAssignment={(payload) => {
            if (!assignment) throw new Error('Assignment not found');
            return updateAssignment(assignment.id, payload);
          }}
          onConflict={() => setIsConflictModalOpen(true)}
          onDirtyChange={setIsDirty}
        />
      );
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 text-slate-900">
      <Header />

      {/* Builder Top Command Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-2.5 sm:px-6">
        <div className="flex items-center gap-2 truncate sm:gap-3">
          <Link
            href="/admin/courses"
            className="rounded-lg p-1 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            title="Return to Course Library"
          >
            &larr; Library
          </Link>

          <span className="h-4 w-px bg-slate-200" />

          <div className="flex items-center gap-1.5 truncate text-sm font-semibold text-slate-500 sm:gap-2">
            <span className="hidden sm:inline">Course Builder</span>
            <span className="hidden sm:inline">/</span>
            <span className="truncate font-bold text-slate-900">{course.title}</span>
          </div>

          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
              course.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {course.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* View Switcher on < lg screens */}
        <div className="flex items-center rounded-lg bg-slate-100 p-0.5 text-xs font-medium lg:hidden">
          <button
            type="button"
            onClick={() => setMobileTab('outline')}
            className={`rounded px-2.5 py-1 transition-colors ${
              mobileTab === 'outline'
                ? 'bg-white font-bold text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Outline
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('editor')}
            className={`flex items-center gap-1 rounded px-2.5 py-1 transition-colors ${
              mobileTab === 'editor'
                ? 'bg-white font-bold text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Editor</span>
            {isDirty && (
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" title="Unsaved changes" />
            )}
          </button>
        </div>
      </div>

      {/* Dual Pane Layout: 320px Left Tree + Fluid Right Editor on lg+; Switched tabs on <lg */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Pane: Outline Tree */}
        <div
          className={`w-full lg:flex lg:w-[400px] lg:flex-none lg:flex-col ${
            mobileTab === 'outline' ? 'flex flex-1 flex-col overflow-hidden' : 'hidden'
          }`}
        >
          <CourseOutlineTree
            course={course}
            selectedNode={selectedNode}
            reorderingIds={reorderingIds}
            isReorderingTopics={isReorderingTopics}
            isReorderingCourseAssignments={isReorderingCourseAssignments}
            reorderingSubtopicTopicIds={reorderingSubtopicTopicIds}
            reorderingTopicAssignmentTopicIds={reorderingTopicAssignmentTopicIds}
            onSelectNode={handleSelectNode}
            onAddTopic={() => setIsAddTopicOpen(true)}
            onAddSubtopic={(topicId) => {
              setTargetTopicId(topicId);
              setIsAddSubtopicOpen(true);
            }}
            onAddTopicAssignment={(topicId) => {
              setAssignmentScope(AssignmentScope.TOPIC);
              setAssignmentTopicId(topicId);
              setIsAddAssignmentOpen(true);
            }}
            onAddCourseAssignment={() => {
              setAssignmentScope(AssignmentScope.COURSE);
              setAssignmentTopicId(null);
              setIsAddAssignmentOpen(true);
            }}
            onReorderTopics={(targetId, orderedIds) => {
              void handleReorderTopics(targetId, orderedIds);
            }}
            onReorderSubtopics={(targetId, topicId, orderedIds) => {
              void handleReorderSubtopics(targetId, topicId, orderedIds);
            }}
            onReorderAssignments={(targetId, orderedIds, topicId) => {
              void handleReorderAssignments(targetId, orderedIds, topicId);
            }}
            onRequestDeleteNode={(type, id, title) => setDeleteTarget({ type, id, title })}
          />
        </div>

        {/* Right Pane: Dynamic Editor */}
        <div
          className={`w-full overflow-hidden bg-white lg:flex lg:flex-1 lg:flex-col ${
            mobileTab === 'editor' ? 'flex flex-1 flex-col' : 'hidden'
          }`}
        >
          {/* Mobile quick-return banner (< lg) */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileTab('outline')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              &larr; Back to Outline
            </button>
            <span className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">
              {selectedNode.type}
            </span>
          </div>
          <div className="flex-1 overflow-hidden">{activeEditorComponent}</div>
        </div>
      </div>

      {/* Unsaved Changes Guard Modal (FR-6.14, CRS-22) */}
      <UnsavedChangesModal
        isOpen={isUnsavedModalOpen}
        onStay={() => {
          setIsUnsavedModalOpen(false);
          setPendingSelection(null);
        }}
        onDiscard={confirmDiscardChanges}
      />

      {/* Concurrency Conflict Modal (FR-6.13, CRS-19) */}
      <ConflictResolutionModal
        isOpen={isConflictModalOpen}
        onReload={() => {
          setIsConflictModalOpen(false);
          void reloadCourse();
        }}
      />

      {/* Delete Item Impact Notice Modal (FR-6.10, CRS-14) */}
      {deleteTarget && (
        <ImpactNoticeModal
          isOpen={true}
          impact={impact}
          isLoading={isDeletingNode}
          loadingLabel="Deleting..."
          actionTitle={`Delete ${deleteTarget.type.toLowerCase()} "${deleteTarget.title}"?`}
          actionMessage="This item will be soft-deleted. Existing submissions and audit logs will be permanently retained."
          isDestructive={true}
          confirmLabel="Confirm Deletion"
          onConfirm={() => {
            void handleConfirmDeleteNode();
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Add Topic Modal */}
      {isAddTopicOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <H3 className="text-base font-bold text-slate-900">Add New Topic</H3>

            {topicModalError && (
              <FieldError
                error={topicModalError}
                className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700"
              />
            )}

            <form
              noValidate
              onSubmit={(e) => {
                void handleCreateTopic(e);
              }}
              className="mt-4 space-y-4"
            >
              <div>
                <Label required={true} className="block text-xs font-bold text-slate-700 uppercase">
                  Topic Title
                </Label>
                <Input
                  type="text"
                  value={newTopicTitle}
                  hasError={Boolean(topicModalError)}
                  onChange={(e) => {
                    setNewTopicTitle(e.target.value);
                    if (topicModalError) setTopicModalError(null);
                  }}
                  placeholder="e.g. Distributed Consensus"
                  className="mt-1 h-8 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isCreatingTopic}
                  onClick={() => {
                    setIsAddTopicOpen(false);
                    setTopicModalError(null);
                  }}
                  className="h-auto rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreatingTopic}
                  isLoading={isCreatingTopic}
                  className="inline-flex h-auto items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Create Topic
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subtopic Modal */}
      {isAddSubtopicOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <H3 className="text-base font-bold text-slate-900">Add New Subtopic Lesson</H3>

            {subtopicModalError && (
              <FieldError
                error={subtopicModalError}
                className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700"
              />
            )}

            <form
              noValidate
              onSubmit={(e) => {
                void handleCreateSubtopic(e);
              }}
              className="mt-4 space-y-4"
            >
              <div>
                <Label required={true} className="block text-xs font-bold text-slate-700 uppercase">
                  Subtopic Title
                </Label>
                <Input
                  type="text"
                  value={newSubtopicTitle}
                  hasError={Boolean(subtopicModalError)}
                  onChange={(e) => {
                    setNewSubtopicTitle(e.target.value);
                    if (subtopicModalError) setSubtopicModalError(null);
                  }}
                  placeholder="e.g. Raft Leader Election Protocol"
                  className="mt-1 h-8 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isCreatingSubtopic}
                  onClick={() => {
                    setIsAddSubtopicOpen(false);
                    setSubtopicModalError(null);
                  }}
                  className="h-auto rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreatingSubtopic}
                  isLoading={isCreatingSubtopic}
                  className="inline-flex h-auto items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Create Subtopic
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Assignment Modal */}
      {isAddAssignmentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <H3 className="text-base font-bold text-slate-900">Add {assignmentScope} Assignment</H3>

            {assignmentModalError && (
              <FieldError
                error={assignmentModalError}
                className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700"
              />
            )}

            <form
              noValidate
              onSubmit={(e) => {
                void handleCreateAssignment(e);
              }}
              className="mt-4 space-y-4"
            >
              <div>
                <Label required={true} className="block text-xs font-bold text-slate-700 uppercase">
                  Assignment Title
                </Label>
                <Input
                  type="text"
                  value={newAssignmentTitle}
                  hasError={Boolean(assignmentModalError)}
                  onChange={(e) => {
                    setNewAssignmentTitle(e.target.value);
                    if (assignmentModalError) setAssignmentModalError(null);
                  }}
                  placeholder="e.g. Implement Raft Log Compaction"
                  className="mt-1 h-8 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label
                    required={true}
                    className="block text-[11px] font-bold text-slate-700 uppercase"
                  >
                    Est. Hours
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      type="number"
                      min={0}
                      value={newAssignmentHours}
                      onChange={(e) => {
                        setNewAssignmentHours(e.target.value);
                        if (assignmentModalError) setAssignmentModalError(null);
                      }}
                      className="h-8 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 pr-8 text-xs focus:border-blue-600 focus:outline-hidden"
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-[10px] font-medium text-slate-400">
                      hrs
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="block text-[11px] font-bold text-slate-700 uppercase">
                    Est. Minutes
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      type="number"
                      min={0}
                      max={59}
                      value={newAssignmentMinutes}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const sanitized =
                          raw === ''
                            ? ''
                            : Math.min(59, Math.max(0, parseInt(raw, 10) || 0)).toString();
                        setNewAssignmentMinutes(sanitized);
                        if (assignmentModalError) setAssignmentModalError(null);
                      }}
                      className="h-8 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 pr-8 text-xs focus:border-blue-600 focus:outline-hidden"
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-[10px] font-medium text-slate-400">
                      mins
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label
                    required={true}
                    className="block text-[11px] font-bold text-slate-700 uppercase"
                  >
                    Max Marks
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={1000}
                    value={newAssignmentMaxMarks || ''}
                    onChange={(e) => {
                      setNewAssignmentMaxMarks(Number(e.target.value));
                      if (assignmentModalError) setAssignmentModalError(null);
                    }}
                    className="mt-1 h-8 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <Label
                    required={true}
                    className="block text-[11px] font-bold text-slate-700 uppercase"
                  >
                    Pass Marks
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    value={newAssignmentPassMarks || ''}
                    onChange={(e) => {
                      setNewAssignmentPassMarks(Number(e.target.value));
                      if (assignmentModalError) setAssignmentModalError(null);
                    }}
                    className="mt-1 h-8 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isCreatingAssignment}
                  onClick={() => {
                    setIsAddAssignmentOpen(false);
                    setAssignmentModalError(null);
                  }}
                  className="h-auto rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreatingAssignment}
                  isLoading={isCreatingAssignment}
                  className="inline-flex h-auto items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 focus-visible:ring-purple-500 active:bg-purple-800 disabled:opacity-50"
                >
                  Create Assignment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CourseBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="text-xs font-medium text-slate-500">Loading Course Builder...</p>
          </div>
        </div>
      }
    >
      <CourseBuilderContent />
    </Suspense>
  );
}
