import type { Metadata } from 'next';
import { CareerReadinessView } from '@/components/CareerReadinessView';

export const metadata: Metadata = {
  title: 'Career Readiness Index',
  description:
    'Ukur kesiapan karier dan dapatkan panduan langkah konkret untuk meraih pekerjaan impian kamu di Employr.',
};

export default function ReadinessPage() {
  return <CareerReadinessView />;
}
