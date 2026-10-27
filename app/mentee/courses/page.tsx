import type { Metadata } from 'next';

import { MenteeCoursesView } from '@/components/app/courses/MenteeCoursesView';

export const metadata: Metadata = {
  title: 'My Courses | Learning Workspace',
  description: 'Track ongoing curriculum modules, progress, and assignments.',
};

export default function MenteeCoursesPage() {
  return <MenteeCoursesView />;
}
