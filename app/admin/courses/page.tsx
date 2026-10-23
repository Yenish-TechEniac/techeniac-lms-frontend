'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';

import { CourseCard } from '@/components/app/courses/CourseCard';
import { ImpactNoticeModal } from '@/components/app/courses/ImpactNoticeModal';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { useCourses } from '@/hooks/useCourses';
import { formatErrorMessage } from '@/lib/errors';
import type { Course, CourseImpact } from '@/types/courses';

export default function CourseLibraryPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'true' | 'false'>('all');

  const courseQuery = useMemo(
    () => ({
      page: 1,
      limit: 50,
      search: search.trim() || undefined,
      isActive: activeFilter === 'all' ? ('all' as const) : activeFilter === 'true',
    }),
    [search, activeFilter],
  );

  const {
    courses,
    total,
    isLoading: loadingCourses,
    fetchCourses,
    createCourse,
    deleteCourse,
    toggleCourseStatus,
    cloneCourse,
    getCourseImpact,
  } = useCourses(courseQuery);

  // Create Course Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [durationHours, setDurationHours] = useState('40');
  const [durationMinutes, setDurationMinutes] = useState('0');
  const [newIsActive, setNewIsActive] = useState(true);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Impact & Action Modals State
  const [activeActionCourse, setActiveActionCourse] = useState<Course | null>(null);
  const [courseImpact, setCourseImpact] = useState<CourseImpact | null>(null);
  const [modalActionType, setModalActionType] = useState<'DELETE' | 'TOGGLE_STATUS' | null>(null);
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.replace('/login');
      } else if (user.role !== 'SUPER_ADMIN' && user.role !== 'MENTOR') {
        router.replace('/mentee');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) {
      setCreateError('Course title cannot be empty.');
      return;
    }
    if (trimmedTitle.length < 3) {
      setCreateError('Course title must be at least 3 characters.');
      return;
    }
    if (trimmedTitle.length > 150) {
      setCreateError('Course title cannot exceed 150 characters.');
      return;
    }

    const totalEstimatedMins =
      durationHours !== '' || durationMinutes !== ''
        ? (parseInt(durationHours, 10) || 0) * 60 + (parseInt(durationMinutes, 10) || 0)
        : null;

    if (totalEstimatedMins !== null && totalEstimatedMins <= 0) {
      setCreateError('Please enter a valid positive duration greater than 0 minutes.');
      return;
    }

    if (durationMinutes !== '') {
      const parsedMins = parseInt(durationMinutes, 10);
      if (isNaN(parsedMins) || parsedMins < 0 || parsedMins > 59) {
        setCreateError('Minutes must be between 0 and 59.');
        return;
      }
    }

    setIsSubmittingCreate(true);
    setCreateError(null);

    try {
      const created = await createCourse({
        title: trimmedTitle,
        description: newDescription.trim() || undefined,
        estimatedMinutes: totalEstimatedMins ?? undefined,
        isActive: newIsActive,
      });

      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      router.push(`/admin/courses/${created.id}/builder`);
    } catch (err: unknown) {
      setCreateError(formatErrorMessage(err, 'Failed to create course'));
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const onRequestDelete = async (course: Course) => {
    setActiveActionCourse(course);
    setModalActionType('DELETE');
    try {
      const impactData = await getCourseImpact(course.id);
      setCourseImpact(impactData);
    } catch {
      setCourseImpact(null);
    }
  };

  const onRequestToggleStatus = async (course: Course) => {
    setActiveActionCourse(course);
    setModalActionType('TOGGLE_STATUS');
    try {
      const impactData = await getCourseImpact(course.id);
      setCourseImpact(impactData);
    } catch {
      setCourseImpact(null);
    }
  };

  const handleConfirmAction = async () => {
    if (!activeActionCourse || !modalActionType) return;

    setIsActionSubmitting(true);
    try {
      if (modalActionType === 'DELETE') {
        await deleteCourse(activeActionCourse.id);
      } else if (modalActionType === 'TOGGLE_STATUS') {
        await toggleCourseStatus(
          activeActionCourse.id,
          !activeActionCourse.isActive,
          activeActionCourse.updatedAt,
        );
      }
      setActiveActionCourse(null);
      setModalActionType(null);
      setCourseImpact(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setIsActionSubmitting(false);
    }
  };

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const activeCount = courses.filter((c) => c.isActive).length;
  const totalMenteesReached = courses.reduce((acc, c) => acc + (c.allocationCount ?? 0), 0);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Top Breadcrumb & Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Link href="/admin" className="hover:text-slate-900">
                Admin
              </Link>
              <span>/</span>
              <span className="text-slate-900">Curriculum & Course Library</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Course Library
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Manage enterprise learning tracks, syllabus outlines, and live assignments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-slate-800"
            >
              + Create New Course
            </button>
          </div>
        </div>

        {/* Telemetry Stat Cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Total Courses
            </span>
            <div className="mt-1 text-2xl font-bold text-slate-900">{total}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Active Tracks
            </span>
            <div className="mt-1 text-2xl font-bold text-emerald-600">{activeCount}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Mentees Enrolled
            </span>
            <div className="mt-1 text-2xl font-bold text-blue-600">{totalMenteesReached}</div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses by title or topic..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Segmented Filter */}
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs">
              {(['all', 'true', 'false'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setActiveFilter(st)}
                  className={`rounded-md px-3 py-1 font-semibold transition-colors ${
                    activeFilter === st
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st === 'all' ? 'All' : st === 'true' ? 'Active' : 'Inactive'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="mt-6">
          {loadingCourses ? (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : courses.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <h3 className="text-sm font-bold text-slate-800">No courses found</h3>
              <p className="mt-1 text-xs text-slate-500">
                Try modifying your search or filter settings, or click &quot;Create New
                Course&quot;.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((c) => (
                <CourseCard
                  key={c.id}
                  course={c}
                  onRefresh={() => {
                    void fetchCourses();
                  }}
                  onCloneCourse={async (targetCourse) => {
                    await cloneCourse(targetCourse.id);
                  }}
                  onRequestDelete={(targetCourse) => {
                    void onRequestDelete(targetCourse);
                  }}
                  onRequestToggleStatus={(targetCourse) => {
                    void onRequestToggleStatus(targetCourse);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Course Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Create New Course</h3>
            <p className="mt-1 text-xs text-slate-500">
              Initialize a curriculum standard. You will be redirected to the Course Builder to add
              topics and assignments.
            </p>

            {createError && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                {createError}
              </div>
            )}

            <form
              noValidate
              onSubmit={(e) => {
                void handleCreateCourse(e);
              }}
              className="mt-5 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold tracking-wide text-slate-700 uppercase">
                  Course Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    if (createError) setCreateError(null);
                  }}
                  placeholder="e.g. Git & GitHub Mastery"
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-xs focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold tracking-wide text-slate-700 uppercase">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Core objectives and competency goals..."
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-xs focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold tracking-wide text-slate-700 uppercase">
                  Estimated Duration
                </label>
                <div className="mt-1.5 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                      Hours
                    </label>
                    <div className="relative mt-1">
                      <input
                        type="number"
                        min={0}
                        value={durationHours}
                        onChange={(e) => setDurationHours(e.target.value)}
                        placeholder="0"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-10 text-xs text-slate-900 shadow-xs focus:border-blue-600 focus:outline-hidden"
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-slate-400">
                        hrs
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                      Minutes
                    </label>
                    <div className="relative mt-1">
                      <input
                        type="number"
                        min={0}
                        max={59}
                        value={durationMinutes}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const sanitized =
                            raw === ''
                              ? ''
                              : Math.min(59, Math.max(0, parseInt(raw, 10) || 0)).toString();
                          setDurationMinutes(sanitized);
                        }}
                        placeholder="0"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-10 text-xs text-slate-900 shadow-xs focus:border-blue-600 focus:outline-hidden"
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-slate-400">
                        mins
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3">
                <span className="text-xs font-bold text-slate-800">Initial Active State</span>
                <button
                  type="button"
                  onClick={() => setNewIsActive(!newIsActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    newIsActive ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      newIsActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCreate}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50"
                >
                  {isSubmittingCreate ? 'Creating...' : 'Create & Open Builder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Impact & Action Notice Modal */}
      {activeActionCourse && modalActionType && (
        <ImpactNoticeModal
          isOpen={true}
          isLoading={isActionSubmitting}
          loadingLabel={
            modalActionType === 'DELETE'
              ? 'Deleting...'
              : activeActionCourse.isActive
                ? 'Deactivating...'
                : 'Activating...'
          }
          impact={courseImpact}
          actionTitle={
            modalActionType === 'DELETE'
              ? `Delete Course "${activeActionCourse.title}"?`
              : activeActionCourse.isActive
                ? `Deactivate Course "${activeActionCourse.title}"?`
                : `Activate Course "${activeActionCourse.title}"?`
          }
          actionMessage={
            modalActionType === 'DELETE'
              ? 'Are you sure you want to delete this course? Courses with active mentee allocations cannot be deleted.'
              : activeActionCourse.isActive
                ? 'Deactivating this course prevents new allocations. Existing mentee enrollments continue normally.'
                : 'Activating this course makes it available for immediate mentee assignment across batches.'
          }
          isDestructive={modalActionType === 'DELETE' || activeActionCourse.isActive}
          isBlocked={modalActionType === 'DELETE' && (courseImpact?.openAllocationsCount ?? 0) > 0}
          blockedMessage="This course has active mentee allocations. It cannot be deleted. Please deactivate the course instead."
          confirmLabel={
            modalActionType === 'DELETE'
              ? 'Confirm Deletion'
              : activeActionCourse.isActive
                ? 'Confirm Deactivation'
                : 'Confirm Activation'
          }
          onConfirm={() => {
            void handleConfirmAction();
          }}
          onCancel={() => {
            setActiveActionCourse(null);
            setModalActionType(null);
            setCourseImpact(null);
          }}
        />
      )}
    </div>
  );
}
