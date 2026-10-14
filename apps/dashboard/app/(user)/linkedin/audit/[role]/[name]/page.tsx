import type { Metadata } from 'next';
import { LinkedInAnalysisView } from '@/components/LinkedInAnalysisView';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ role: string; name: string }>;
}): Promise<Metadata> {
  const { role, name } = await params;
  const readableRole = (role || 'Professional')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const cleanNameOnly = (name || 'Kandidat').split('-')[0];
  const readableName = cleanNameOnly.replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title: `Audit LinkedIn ${readableRole} • ${readableName} | Employr`,
    description: `Hasil analisis profil LinkedIn dan rekomendasi formula ASEAN Ahead untuk posisi ${readableRole} di Employr.`,
  };
}

export default async function LinkedInSemanticDetailPage({
  params,
}: {
  params: Promise<{ role: string; name: string }>;
}) {
  const { role, name } = await params;
  return <LinkedInAnalysisView roleSlug={role} nameSlug={name} />;
}
