import type { Metadata } from 'next';
import { FeatureRequestView } from '@/components/FeatureRequestView';

export const metadata: Metadata = {
  title: 'Saran & Request Fitur',
  description:
    'Sampaikan ide dan saran fitur baru untuk platform Employr. Berikan dukungan pada wishlist komunitas untuk memprioritaskan fitur yang kamu butuhkan.',
};

export default function SaranFiturPage() {
  return <FeatureRequestView />;
}
