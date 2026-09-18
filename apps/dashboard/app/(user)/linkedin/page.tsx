import type { Metadata } from 'next';
import { LinkedInAnalysisView } from '@/components/LinkedInAnalysisView';

export const metadata: Metadata = {
  title: 'Optimasi Profil LinkedIn',
  description:
    'Optimalkan profil LinkedIn kamu agar menarik perhatian recruiter dan meningkatkan impresi pencarian kerja di Employr.',
};

export default function LinkedInPage() {
  return <LinkedInAnalysisView />;
}
