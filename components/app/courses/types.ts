import type { Course } from '@/types/courses';

export type ActiveNodeType = 'COURSE' | 'TOPIC' | 'SUBTOPIC' | 'ASSIGNMENT';

export interface ActiveNodeSelection {
  type: ActiveNodeType;
  id: string;
  parentTopicId?: string | undefined;
}

export interface CourseBuilderContextState {
  course: Course;
  selectedNode: ActiveNodeSelection;
  isDirty: boolean;
}

export function formatDurationMinutes(minutes?: number | null): string {
  if (!minutes || minutes <= 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours > 0 && remainingMinutes > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${remainingMinutes}m`;
}

export function parseDurationToMinutes(val: string): number | null {
  const trimmed = val.trim().toLowerCase();
  if (!trimmed) return null;

  const hoursMatch = trimmed.match(/(\d+)\s*h/);
  const minutesMatch = trimmed.match(/(\d+)\s*m/);

  if (hoursMatch || minutesMatch) {
    const hours = hoursMatch && hoursMatch[1] ? parseInt(hoursMatch[1], 10) : 0;
    const mins = minutesMatch && minutesMatch[1] ? parseInt(minutesMatch[1], 10) : 0;
    return hours * 60 + mins;
  }

  const rawNum = parseInt(trimmed, 10);
  return Number.isNaN(rawNum) ? null : rawNum;
}
