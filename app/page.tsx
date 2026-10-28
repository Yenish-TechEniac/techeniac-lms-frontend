import type { Metadata } from 'next';
import React from 'react';

import { LandingView } from '@/components/app/landing/LandingView';

export const metadata: Metadata = {
  title: 'Techeniac LMS | Enterprise Learning Management System',
  description:
    'Modern, role-governed learning management system for orchestrating enterprise cohorts, mentorship, and courses.',
};

export default function RootPage() {
  return <LandingView />;
}
