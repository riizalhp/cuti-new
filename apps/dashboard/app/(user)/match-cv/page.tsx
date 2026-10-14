import type { Metadata } from 'next';
import { CvMatchAnalysisView } from '@/components/CvMatchAnalysisView';

export const metadata: Metadata = {
  title: 'Komparasi Lowongan Kerja | Employr',
  description:
    'Bandingkan kecocokan CV kamu dengan beberapa lowongan kerja sekaligus untuk melihat persentase match, kelebihan, kekurangan, dan irisan kata kunci.',
};

export default function MatchCvPage() {
  return <CvMatchAnalysisView />;
}
