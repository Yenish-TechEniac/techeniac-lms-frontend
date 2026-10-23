import {
  Assignment,
  AssignmentScope,
  Course,
  CourseImpact,
  CoursePagination,
  CreateAssignmentInput,
  CreateCourseInput,
  CreateSubtopicInput,
  CreateTopicInput,
  ListCoursesQuery,
  ReorderItemInput,
  ResourceItem,
  SubmissionMode,
  Subtopic,
  Topic,
  UpdateAssignmentInput,
  UpdateCourseInput,
  UpdateSubtopicInput,
  UpdateTopicInput,
} from '@/types/courses';

import { apiClient } from './api.client';

export {
  type Assignment,
  AssignmentScope,
  type Course,
  type CourseImpact,
  type CoursePagination,
  type CreateAssignmentInput,
  type CreateCourseInput,
  type CreateSubtopicInput,
  type CreateTopicInput,
  type ListCoursesQuery,
  type ReorderItemInput,
  type ResourceItem,
  SubmissionMode,
  type Subtopic,
  type Topic,
  type UpdateAssignmentInput,
  type UpdateCourseInput,
  type UpdateSubtopicInput,
  type UpdateTopicInput,
};

// API Response Wrappers
interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

export const coursesService = {
  // Course APIs
  async listCourses(
    params?: ListCoursesQuery,
  ): Promise<{ courses: Course[]; pagination: CoursePagination }> {
    const res = await apiClient<ApiResponse<{ courses: Course[]; pagination: CoursePagination }>>(
      '/courses',
      {
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
          search: params?.search || undefined,
          isActive:
            params?.isActive !== undefined && params.isActive !== 'all'
              ? String(params.isActive)
              : undefined,
          sortBy: params?.sortBy ?? 'createdAt',
          sortOrder: params?.sortOrder ?? 'desc',
        },
      },
    );
    return res.data;
  },

  async getCourseById(id: string, outline = true): Promise<Course> {
    const res = await apiClient<ApiResponse<{ course: Course }>>(`/courses/${id}`, {
      params: { outline: String(outline) },
    });
    return res.data.course;
  },

  async createCourse(payload: CreateCourseInput): Promise<Course> {
    const res = await apiClient<ApiResponse<{ course: Course }>>('/courses', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data.course;
  },

  async updateCourse(id: string, payload: UpdateCourseInput): Promise<Course> {
    const res = await apiClient<ApiResponse<{ course: Course }>>(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return res.data.course;
  },

  async toggleCourseStatus(
    id: string,
    isActive: boolean,
    expectedUpdatedAt?: string,
  ): Promise<Course> {
    const res = await apiClient<ApiResponse<{ course: Course }>>(`/courses/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive, expectedUpdatedAt }),
    });
    return res.data.course;
  },

  async deleteCourse(id: string): Promise<void> {
    await apiClient<ApiResponse<void>>(`/courses/${id}`, {
      method: 'DELETE',
    });
  },

  async cloneCourse(id: string): Promise<Course> {
    const res = await apiClient<ApiResponse<{ course: Course }>>(`/courses/${id}/clone`, {
      method: 'POST',
    });
    return res.data.course;
  },

  async getCourseImpact(id: string): Promise<CourseImpact> {
    const res = await apiClient<ApiResponse<{ impact: CourseImpact }>>(`/courses/${id}/impact`);
    return res.data.impact;
  },

  // Topic APIs
  async createTopic(courseId: string, payload: CreateTopicInput): Promise<Topic> {
    const res = await apiClient<ApiResponse<{ topic: Topic }>>(`/courses/${courseId}/topics`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data.topic;
  },

  async updateTopic(id: string, payload: UpdateTopicInput): Promise<Topic> {
    const res = await apiClient<ApiResponse<{ topic: Topic }>>(`/courses/topics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return res.data.topic;
  },

  async toggleTopicStatus(
    id: string,
    isActive: boolean,
    expectedUpdatedAt?: string,
  ): Promise<Topic> {
    const res = await apiClient<ApiResponse<{ topic: Topic }>>(`/courses/topics/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive, expectedUpdatedAt }),
    });
    return res.data.topic;
  },

  async deleteTopic(id: string): Promise<void> {
    await apiClient<ApiResponse<void>>(`/courses/topics/${id}`, {
      method: 'DELETE',
    });
  },

  async reorderTopics(courseId: string, items: ReorderItemInput[]): Promise<void> {
    await apiClient<ApiResponse<void>>(`/courses/${courseId}/topics/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ items }),
    });
  },

  // Subtopic APIs
  async createSubtopic(topicId: string, payload: CreateSubtopicInput): Promise<Subtopic> {
    const res = await apiClient<ApiResponse<{ subtopic: Subtopic }>>(
      `/courses/topics/${topicId}/subtopics`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
    return res.data.subtopic;
  },

  async updateSubtopic(id: string, payload: UpdateSubtopicInput): Promise<Subtopic> {
    const res = await apiClient<ApiResponse<{ subtopic: Subtopic }>>(`/courses/subtopics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return res.data.subtopic;
  },

  async toggleSubtopicStatus(
    id: string,
    isActive: boolean,
    expectedUpdatedAt?: string,
  ): Promise<Subtopic> {
    const res = await apiClient<ApiResponse<{ subtopic: Subtopic }>>(
      `/courses/subtopics/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ isActive, expectedUpdatedAt }),
      },
    );
    return res.data.subtopic;
  },

  async deleteSubtopic(id: string): Promise<void> {
    await apiClient<ApiResponse<void>>(`/courses/subtopics/${id}`, {
      method: 'DELETE',
    });
  },

  async reorderSubtopics(topicId: string, items: ReorderItemInput[]): Promise<void> {
    await apiClient<ApiResponse<void>>(`/courses/topics/${topicId}/subtopics/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ items }),
    });
  },

  // Assignment APIs
  async createAssignment(courseId: string, payload: CreateAssignmentInput): Promise<Assignment> {
    const res = await apiClient<ApiResponse<{ assignment: Assignment }>>(
      `/courses/${courseId}/assignments`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
    return res.data.assignment;
  },

  async updateAssignment(id: string, payload: UpdateAssignmentInput): Promise<Assignment> {
    const res = await apiClient<ApiResponse<{ assignment: Assignment }>>(
      `/courses/assignments/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
    );
    return res.data.assignment;
  },

  async deleteAssignment(id: string): Promise<void> {
    await apiClient<ApiResponse<void>>(`/courses/assignments/${id}`, {
      method: 'DELETE',
    });
  },

  async reorderAssignments(courseId: string, items: ReorderItemInput[]): Promise<void> {
    await apiClient<ApiResponse<void>>(`/courses/${courseId}/assignments/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ items }),
    });
  },
};
