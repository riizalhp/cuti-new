import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { prisma } from '@employr/db';
import { CVView } from '@/components/CVView';
import { deslugify, isUUID, slugify, formatIndonesianDate } from '@/lib/slug';
import { getServerAuthUser } from '@/lib/server-auth';
import { calculateAtsScore } from '@/lib/ats-score';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const label = isUUID(id) ? 'Editor CV ATS' : deslugify(id);
  return {
    title: `${label} - Editor CV ATS`,
    description: 'Edit dan sesuaikan data profil serta format CV ATS kamu di Employr.',
  };
}

export default async function CVDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (id === 'create') {
    redirect('/cv/create');
  }
  const user = await getServerAuthUser();

  let initialCV: any = null;

  if (user) {
    try {
      let cv = isUUID(id)
        ? await prisma.cv_projects.findFirst({
            where: { id, user_id: user.id, is_active: true },
          })
        : null;

      if (!cv && !isUUID(id)) {
        const titlePattern = id.replace(/-/g, ' ').trim();
        cv = await prisma.cv_projects.findFirst({
          where: {
            user_id: user.id,
            is_active: true,
            title: { equals: titlePattern, mode: 'insensitive' },
          },
          orderBy: { updated_at: 'desc' },
        });
      }

      if (!cv) {
        const userProjects = await prisma.cv_projects.findMany({
          where: { user_id: user.id, is_active: true },
          orderBy: { updated_at: 'desc' },
        });
        cv = userProjects.find((p) => {
          const pData = (typeof p.data === 'object' && p.data !== null ? p.data : {}) as Record<string, any>;
          const cvSlug = pData.slug || slugify(p.title || 'cv-ats');
          return cvSlug === id || p.title.toLowerCase() === id.replace(/-/g, ' ').toLowerCase();
        }) || null;
      }

      if (cv) {
        const parsedData = (typeof cv.data === 'object' && cv.data !== null ? cv.data : {}) as Record<string, any>;
        const resolvedFullName = parsedData.fullName || user.name || 'User';
        const fullData = {
          ...parsedData,
          id: cv.id,
          fullName: resolvedFullName,
          headline: cv.target_position || parsedData.headline || 'Professional',
        };
        const computedScore = calculateAtsScore(fullData).totalScore;
        const finalAtsScore = (parsedData.atsScore && parsedData.atsScore > 0)
          ? parsedData.atsScore
          : (computedScore > 0 ? computedScore : 0);

        const title = cv.title || parsedData.title || 'CV ATS';
        const slug = parsedData.slug || slugify(title);

        initialCV = {
          ...fullData,
          title,
          slug,
          templateId: cv.template_id || parsedData.templateId || 'ats-modern-standard',
          atsScore: finalAtsScore,
          updatedAt: formatIndonesianDate(cv.updated_at),
        };
      }
    } catch (err) {
      console.error('[CVDetailPage] Error fetching initial CV:', err);
    }
  }

  // Jika URL menggunakan UUID acak (seperti /cv/035c0eca-...),
  // alihkan secara otomatis ke format slug judul yang rapi (misal /cv/cv-dokter-umum)
  let targetSlug: string | null = null;
  if (isUUID(id)) {
    if (initialCV?.slug) {
      targetSlug = initialCV.slug;
    } else {
      try {
        const cv = await prisma.cv_projects.findFirst({
          where: { id, is_active: true },
          select: { title: true, data: true },
        });
        if (cv) {
          const pData = (typeof cv.data === 'object' && cv.data !== null ? cv.data : {}) as Record<string, any>;
          targetSlug = pData.slug || slugify(cv.title || 'cv-ats');
        }
      } catch (err) {
        console.error('[CVDetailPage] Error querying slug for redirect:', err);
      }
    }
  }

  // Lakukan redirect di luar try-catch agar tidak tertelan oleh mekanisme penanganan error
  if (targetSlug) {
    redirect(`/cv/${targetSlug}`);
  }

  return <CVView cvId={id} initialCV={initialCV} />;
}
