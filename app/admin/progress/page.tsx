import type { Metadata } from 'next';

import { ProgressTrackerView } from '@/components/app/progress/ProgressTrackerView';

export const metadata: Metadata = {
  title: 'Progress Tracker | Admin Portal',
  description: 'System-wide learner progress matrix, milestone clearance, and cadence telemetry.',
};

export default function AdminProgressPage() {
  return <ProgressTrackerView portalType="admin" />;
}
