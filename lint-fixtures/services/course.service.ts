import { env } from '@/lib/config';

export const courseService = {
  baseUrl: env.NEXT_PUBLIC_API_BASE_URL,
  getCourses: (): string[] => ['Course 1', 'Course 2'],
};

