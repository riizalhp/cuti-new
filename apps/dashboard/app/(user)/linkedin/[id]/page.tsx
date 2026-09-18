import type { Metadata } from 'next';
import { LinkedInAnalysisView } from '@/components/LinkedInAnalysisView';

export const metadata: Metadata = {
  title: 'Hasil Optimasi Profil LinkedIn | Employr',
  description:
    'Lihat hasil analisis profil LinkedIn terverifikasi dan rekomendasi formula ASEAN Ahead di Employr.',
};

export default async function LinkedInDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LinkedInAnalysisView analysisId={id} />;
}
