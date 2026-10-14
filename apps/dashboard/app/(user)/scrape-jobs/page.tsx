import type { Metadata } from 'next';
import { JobScraperView } from '@/components/JobScraperView';

export const metadata: Metadata = {
  title: 'Job Scraper & Sinkronisasi Loker | Employr',
  description:
    'Tarik dan sinkronkan lowongan kerja resmi dari berbagai portal publik langsung ke database Employr.',
};

export default function ScrapeJobsPage() {
  return <JobScraperView />;
}
