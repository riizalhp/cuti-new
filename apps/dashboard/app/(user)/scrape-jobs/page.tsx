import type { Metadata } from 'next';
import { JobScraperView } from '@/components/JobScraperView';

export const metadata: Metadata = {
  title: 'Pencarian & Simpan Loker',
  description:
    'Temukan dan simpan lowongan kerja terbaru dari berbagai portal rekrutmen terkemuka di Employr.',
};

export default function ScrapeJobsPage() {
  return <JobScraperView />;
}
