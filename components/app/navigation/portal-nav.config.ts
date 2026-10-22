import type { HeaderNavItem, HeaderProps } from '@/components/layout/Header';

export interface PortalNavConfig extends HeaderProps {
  readonly subtitle: string;
  readonly homeUrl: string;
  readonly badgeColor: string;
  readonly nav: readonly HeaderNavItem[];
}

export const ADMIN_PORTAL_NAV: PortalNavConfig = {
  subtitle: 'Admin Console',
  homeUrl: '/admin',
  badgeColor: 'bg-purple-100 text-purple-800',
  nav: [
    { label: 'Overview', href: '/admin', active: true },
    { label: 'Users', href: '#', active: false },
    { label: 'Batches', href: '#', active: false },
    { label: 'Curriculum', href: '#', active: false },
  ],
};

export const MENTOR_PORTAL_NAV: PortalNavConfig = {
  subtitle: 'Mentor Portal',
  homeUrl: '/mentor',
  badgeColor: 'bg-emerald-100 text-emerald-800',
  nav: [
    { label: 'Dashboard', href: '/mentor', active: true },
    { label: 'My Mentees', href: '#', active: false },
    { label: 'Reviews', href: '#', active: false },
    { label: 'Courses', href: '#', active: false },
  ],
};

export const MENTEE_PORTAL_NAV: PortalNavConfig = {
  subtitle: 'Learning Portal',
  homeUrl: '/mentee',
  badgeColor: 'bg-blue-100 text-blue-800',
  nav: [
    { label: 'My Learning', href: '/mentee', active: true },
    { label: 'Courses', href: '#', active: false },
    { label: 'Assignments', href: '#', active: false },
    { label: 'Progress', href: '#', active: false },
  ],
};

export function getPortalNavConfig(role?: string): PortalNavConfig {
  switch (role) {
    case 'SUPER_ADMIN':
      return ADMIN_PORTAL_NAV;
    case 'MENTOR':
      return MENTOR_PORTAL_NAV;
    case 'MENTEE':
    default:
      return MENTEE_PORTAL_NAV;
  }
}
