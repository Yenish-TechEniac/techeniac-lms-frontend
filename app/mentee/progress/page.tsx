import type { Metadata } from 'next';

import { MenteeProgressView } from '@/components/app/progress/MenteeProgressView';

export const metadata: Metadata = {
  title: 'Learning Progress | Student Portal',
  description: 'Track ongoing course completion pace, milestone deadlines, and syllabus progress.',
};

export default function MenteeProgressPage() {
  return <MenteeProgressView />;
}
