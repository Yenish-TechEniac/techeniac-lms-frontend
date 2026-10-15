import { courseService } from '@/services/course.service';

export function useCourses(): string[] {
  return courseService.getCourses();
}

