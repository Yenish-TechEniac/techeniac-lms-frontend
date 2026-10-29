import type { UserRole } from '@/lib/validation';

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  MENTOR: 'Mentor',
  MENTEE: 'Mentee',
};

export function formatRoleLabel(role?: string): string {
  if (!role) return 'Member';
  return (ROLE_LABELS as Record<string, string>)[role] ?? role;
}
