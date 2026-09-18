import type { Metadata } from 'next';
import { TrackerView } from '@/components/TrackerView';

export const metadata: Metadata = {
  title: 'Tracker Lamaran Kerja',
  description:
    'Kelola dan pantau seluruh status lamaran kerja dalam kanban board terpadu dan real-time di Employr.',
};

export default function TrackerPage() {
  return <TrackerView />;
}
