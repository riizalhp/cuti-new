import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AiCvScreenerView } from '@/components/AiCvScreenerView';
import { deslugify, parseCvScreenerSlug } from '@/lib/cv-screener-slug';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ role: string; name: string }>;
}): Promise<Metadata> {
  const { role, name } = await params;
  const readableRole = role ? deslugify(role) : 'Professional';
  const { cleanName } = parseCvScreenerSlug(name || '');
  const readableName = cleanName ? deslugify(cleanName) : 'Kandidat';

  return {
    title: `Laporan Evaluasi CV ATS ${readableRole} • ${readableName} | Employr`,
    description: `Hasil analisis kesesuaian format ATS, kata kunci industri, dan peluang panggilan interview untuk posisi ${readableRole} di Employr.`,
  };
}

export default async function CvScreenerSemanticReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ role: string; name: string }>;
  searchParams?: Promise<{ session?: string }>;
}) {
  const { role, name } = await params;
  const sp = searchParams ? await searchParams : undefined;
  const { cleanName, shortId } = parseCvScreenerSlug(name || '');

  // Jika URL masih membawa hash/token acak lama (seperti dimas-arya-wijaya-25is),
  // alihkan secara otomatis ke format URL bersih yang seragam (dimas-arya-wijaya)
  // dan teruskan query session
  if (shortId && cleanName && cleanName !== name) {
    const sessionQuery = sp?.session || (shortId ? `scr-${shortId}` : undefined);
    redirect(`/cv-screener/report/${role}/${cleanName}${sessionQuery ? `?session=${sessionQuery}` : ''}`);
  }

  return (
    <AiCvScreenerView
      mode="report"
      roleSlug={role}
      nameSlug={cleanName || name}
      initialSessionId={sp?.session}
    />
  );
}
