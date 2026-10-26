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

export function splitDurationMinutes(minutes?: number | null): { hours: string; minutes: string } {
  if (!minutes || minutes <= 0) {
    return { hours: '', minutes: '' };
  }
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return {
    hours: hours > 0 || remaining > 0 ? String(hours) : '',
    minutes: hours > 0 || remaining > 0 ? String(remaining) : '',
  };
}

export function sanitizeDurationHours(raw: string): string {
  if (raw === '') return '';
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed < 0) return '';
  return Math.max(0, parsed).toString();
}

export function sanitizeDurationMinutes(raw: string): string {
  if (raw === '') return '';
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed < 0) return '';
  return Math.min(59, Math.max(0, parsed)).toString();
}

export function computeTotalMinutes(hoursStr: string, minutesStr: string): number {
  const h = hoursStr !== '' ? Number.parseInt(hoursStr, 10) || 0 : 0;
  const m = minutesStr !== '' ? Number.parseInt(minutesStr, 10) || 0 : 0;
  return h * 60 + m;
}

export function computeEstimatedMinutes(hoursStr: string, minutesStr: string): number | null {
  if (hoursStr === '' && minutesStr === '') return null;
  return computeTotalMinutes(hoursStr, minutesStr);
}

export function parseDurationToMinutes(val: string): number | null {
  const trimmed = val.trim().toLowerCase();
  if (!trimmed) return null;

  const hoursMatch = trimmed.match(/(\d+)\s*h/);
  const minutesMatch = trimmed.match(/(\d+)\s*m/);

  if (hoursMatch || minutesMatch) {
    const hours = hoursMatch && hoursMatch[1] ? Number.parseInt(hoursMatch[1], 10) : 0;
    const mins = minutesMatch && minutesMatch[1] ? Number.parseInt(minutesMatch[1], 10) : 0;
    return hours * 60 + mins;
  }

  const rawNum = Number.parseInt(trimmed, 10);
  return Number.isNaN(rawNum) ? null : rawNum;
}
