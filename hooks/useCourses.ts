'use client';

import { useCallback, useEffect, useState } from 'react';

import { coursesService } from '@/services/courses.service';
import type {
  Assignment,
  Course,
  CourseImpact,
  CreateAssignmentInput,
  CreateCourseInput,
  CreateSubtopicInput,
  CreateTopicInput,
  ListCoursesQuery,
  ReorderItemInput,
  Subtopic,
  Topic,
  UpdateAssignmentInput,
  UpdateCourseInput,
  UpdateSubtopicInput,
  UpdateTopicInput,
} from '@/types/courses';

export function useCourses(initialQuery?: ListCoursesQuery) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async (query?: ListCoursesQuery) => {
    setIsLoading(true);
    try {
      const data = await coursesService.listCourses(query);
      setCourses(data.courses);
      setTotal(data.pagination.total);
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch courses';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const queryKey = JSON.stringify(initialQuery ?? {});

  useEffect(() => {
    let ignore = false;
    async function load() {
      setIsLoading(true);
      try {
        const query = JSON.parse(queryKey) as ListCoursesQuery;
        const data = await coursesService.listCourses(query);
        if (!ignore) {
          setCourses(data.courses);
          setTotal(data.pagination.total);
          setError(null);
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : 'Failed to fetch courses';
          setError(msg);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }
    void load();
    return () => {
      ignore = true;
    };
  }, [queryKey]);

  const createCourse = async (payload: CreateCourseInput): Promise<Course> => {
    const created = await coursesService.createCourse(payload);
    await fetchCourses(initialQuery);
    return created;
  };

  const deleteCourse = async (id: string): Promise<void> => {
    await coursesService.deleteCourse(id);
    await fetchCourses(initialQuery);
  };

  const toggleCourseStatus = async (
    id: string,
    isActive: boolean,
    expectedUpdatedAt?: string,
  ): Promise<Course> => {
    const updated = await coursesService.toggleCourseStatus(id, isActive, expectedUpdatedAt);
    await fetchCourses(initialQuery);
    return updated;
  };

  const cloneCourse = async (id: string): Promise<Course> => {
    const cloned = await coursesService.cloneCourse(id);
    await fetchCourses(initialQuery);
    return cloned;
  };

  const getCourseImpact = async (id: string): Promise<CourseImpact> => {
    return await coursesService.getCourseImpact(id);
  };

  return {
    courses,
    total,
    isLoading,
    error,
    fetchCourses,
    createCourse,
    deleteCourse,
    toggleCourseStatus,
    cloneCourse,
    getCourseImpact,
  };
}

export function useCourseBuilder(courseId: string) {
  const [course, setCourse] = useState<Course | null>(null);
  const [impact, setImpact] = useState<CourseImpact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reloadCourse = useCallback(async () => {
    try {
      const data = await coursesService.getCourseById(courseId, true);
      setCourse(data);
      const impactData = await coursesService.getCourseImpact(courseId);
      setImpact(impactData);
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load course';
      setError(msg);
    }
  }, [courseId]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setIsLoading(true);
      try {
        const data = await coursesService.getCourseById(courseId, true);
        const impactData = await coursesService.getCourseImpact(courseId);
        if (!ignore) {
          setCourse(data);
          setImpact(impactData);
          setError(null);
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : 'Failed to load course';
          setError(msg);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }
    void load();
    return () => {
      ignore = true;
    };
  }, [courseId]);

  const updateCourse = async (payload: UpdateCourseInput): Promise<Course> => {
    const updated = await coursesService.updateCourse(courseId, payload);
    setCourse((prev) => (prev ? { ...prev, ...updated } : updated));
    return updated;
  };

  const createTopic = async (payload: CreateTopicInput): Promise<Topic> => {
    const created = await coursesService.createTopic(courseId, payload);
    await reloadCourse();
    return created;
  };

  const updateTopic = async (id: string, payload: UpdateTopicInput): Promise<Topic> => {
    const updated = await coursesService.updateTopic(id, payload);
    setCourse((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        topics: prev.topics?.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)),
      };
    });
    return updated;
  };

  const deleteTopic = async (id: string): Promise<void> => {
    await coursesService.deleteTopic(id);
    await reloadCourse();
  };

  const reorderTopics = async (items: ReorderItemInput[]): Promise<void> => {
    setCourse((prev) => {
      if (!prev || !prev.topics) return prev;
      const orderMap = new Map(items.map((it) => [it.id, it.displayOrder]));
      const sortedTopics = [...prev.topics]
        .map((t) => ({ ...t, displayOrder: orderMap.get(t.id) ?? t.displayOrder }))
        .sort((a, b) => a.displayOrder - b.displayOrder);
      return { ...prev, topics: sortedTopics };
    });
    await coursesService.reorderTopics(courseId, items);
    await reloadCourse();
  };

  const createSubtopic = async (
    topicId: string,
    payload: CreateSubtopicInput,
  ): Promise<Subtopic> => {
    const created = await coursesService.createSubtopic(topicId, payload);
    await reloadCourse();
    return created;
  };

  const updateSubtopic = async (id: string, payload: UpdateSubtopicInput): Promise<Subtopic> => {
    const updated = await coursesService.updateSubtopic(id, payload);
    setCourse((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        topics: prev.topics?.map((t) => ({
          ...t,
          subtopics: t.subtopics?.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)),
        })),
      };
    });
    return updated;
  };

  const deleteSubtopic = async (id: string): Promise<void> => {
    await coursesService.deleteSubtopic(id);
    await reloadCourse();
  };

  const reorderSubtopics = async (topicId: string, items: ReorderItemInput[]): Promise<void> => {
    setCourse((prev) => {
      if (!prev || !prev.topics) return prev;
      const orderMap = new Map(items.map((it) => [it.id, it.displayOrder]));
      const updatedTopics = prev.topics.map((t) => {
        if (t.id !== topicId || !t.subtopics) return t;
        const sortedSubtopics = [...t.subtopics]
          .map((s) => ({ ...s, displayOrder: orderMap.get(s.id) ?? s.displayOrder }))
          .sort((a, b) => a.displayOrder - b.displayOrder);
        return { ...t, subtopics: sortedSubtopics };
      });
      return { ...prev, topics: updatedTopics };
    });
    await coursesService.reorderSubtopics(topicId, items);
    await reloadCourse();
  };

  const createAssignment = async (payload: CreateAssignmentInput): Promise<Assignment> => {
    const created = await coursesService.createAssignment(courseId, payload);
    await reloadCourse();
    return created;
  };

  const updateAssignment = async (
    id: string,
    payload: UpdateAssignmentInput,
  ): Promise<Assignment> => {
    const updated = await coursesService.updateAssignment(id, payload);
    setCourse((prev) => {
      if (!prev) return prev;
      const updatedCourseAssignments = (prev.courseAssignments || prev.assignments)?.map((a) =>
        a.id === updated.id ? { ...a, ...updated } : a,
      );
      const updatedTopics = prev.topics?.map((t) => ({
        ...t,
        assignments: t.assignments?.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)),
      }));
      return {
        ...prev,
        assignments: updatedCourseAssignments,
        courseAssignments: updatedCourseAssignments,
        topics: updatedTopics,
      };
    });
    return updated;
  };

  const deleteAssignment = async (id: string): Promise<void> => {
    await coursesService.deleteAssignment(id);
    await reloadCourse();
  };

  const reorderAssignments = async (items: ReorderItemInput[]): Promise<void> => {
    setCourse((prev) => {
      if (!prev) return prev;
      const orderMap = new Map(items.map((it) => [it.id, it.displayOrder]));
      const currentCourseAssigns = prev.courseAssignments || prev.assignments || [];
      const updatedCourseAssigns = currentCourseAssigns
        .map((a) => ({ ...a, displayOrder: orderMap.get(a.id) ?? a.displayOrder }))
        .sort((a, b) => a.displayOrder - b.displayOrder);
      const updatedTopics = prev.topics?.map((t) => {
        if (!t.assignments) return t;
        const sortedTopicAssigns = [...t.assignments]
          .map((a) => ({ ...a, displayOrder: orderMap.get(a.id) ?? a.displayOrder }))
          .sort((a, b) => a.displayOrder - b.displayOrder);
        return { ...t, assignments: sortedTopicAssigns };
      });
      return {
        ...prev,
        assignments: updatedCourseAssigns,
        courseAssignments: updatedCourseAssigns,
        topics: updatedTopics,
      };
    });
    await coursesService.reorderAssignments(courseId, items);
    await reloadCourse();
  };

  return {
    course,
    impact,
    isLoading,
    error,
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
  };
}
