import type { APIRoute } from 'astro';
import { prisma } from '../../lib/prisma';
import { cleanText } from '../../lib/data';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const q = (url.searchParams.get('q') || '').trim();
    const type = (url.searchParams.get('type') || 'all').toLowerCase();

    // Mapping tab type
    const normalizedType =
      type === 'career' || type === 'artikel'
        ? 'artikel'
        : type === 'lowongan' || type === 'jobs' || type === 'loker'
        ? 'lowongan'
        : type === 'event' || type === 'events'
        ? 'event'
        : type === 'sertifikasi' || type === 'certs'
        ? 'sertifikasi'
        : type === 'course' || type === 'courses' || type === 'pelatihan'
        ? 'course'
        : 'all';

    const results: Array<{
      id: string;
      slug: string;
      title: string;
      subtitle: string;
      meta: string;
      url: string;
      category: string;
      categoryLabel: string;
      badgeClass: string;
      iconLetter: string;
    }> = [];

    const queryCondition = q
      ? {
          contains: q,
          mode: 'insensitive' as const,
        }
      : undefined;

    // 1. Lowongan Kerja
    if (normalizedType === 'all' || normalizedType === 'lowongan') {
      const takeCount = normalizedType === 'all' ? (q ? 4 : 2) : 12;
      const jobs = await prisma.jobs.findMany({
        where: {
          is_active: true,
          ...(queryCondition
            ? {
                OR: [
                  { title: queryCondition },
                  { location: queryCondition },
                  { companies: { name: queryCondition } },
                ],
              }
            : {}),
        },
        include: {
          companies: { select: { name: true } },
        },
        orderBy: { created_at: 'desc' },
        take: takeCount,
      });

      for (const j of jobs) {
        const comp = cleanText(j.companies?.name || 'Perusahaan');
        const loc = cleanText(j.location || 'Indonesia').split(',')[0].trim();
        const typeStr = j.work_type === 'REMOTE' ? 'Remote' : 'Full Time';
        results.push({
          id: j.id,
          slug: j.slug,
          title: cleanText(j.title),
          subtitle: comp,
          meta: `${loc} • ${typeStr}`,
          url: `/lowongan/${j.slug}`,
          category: 'lowongan',
          categoryLabel: 'Loker',
          badgeClass: 'bg-blue-50 text-[#1738D1] border-blue-200',
          iconLetter: 'L',
        });
      }
    }

    // 2. Events & Job Fairs
    if (normalizedType === 'all' || normalizedType === 'event') {
      const takeCount = normalizedType === 'all' ? (q ? 3 : 2) : 12;
      const events = await prisma.events.findMany({
        where: {
          is_active: true,
          ...(queryCondition
            ? {
                OR: [
                  { title: queryCondition },
                  { location: queryCondition },
                  { description: queryCondition },
                ],
              }
            : {}),
        },
        orderBy: { event_date: 'asc' },
        take: takeCount,
      });

      for (const e of events) {
        const d = e.event_date;
        const dateStr = d ? `${d.getDate()}/${d.getMonth() + 1}` : 'Mendatang';
        const formatStr = e.type === 'ONLINE' ? 'Online' : 'Offline';
        const rawSource = cleanText(e.source || '').toLowerCase().trim();
        const isInternal = !rawSource || ['manual', 'bulk_import', 'scraper', 'sync', 'admin', 'seed', 'system', 'crawler', 'internal'].includes(rawSource);
        const organizer = isInternal ? 'Penyelenggara Resmi' : (cleanText(e.source || '') || 'Penyelenggara Resmi');

        results.push({
          id: e.id,
          slug: e.slug,
          title: cleanText(e.title),
          subtitle: organizer,
          meta: `${dateStr} • ${formatStr}`,
          url: `/event/${e.slug}`,
          category: 'event',
          categoryLabel: 'Event',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
          iconLetter: 'E',
        });
      }
    }

    // 3. Artikel & Tips Karier
    if (normalizedType === 'all' || normalizedType === 'artikel') {
      const takeCount = normalizedType === 'all' ? (q ? 3 : 2) : 12;
      const articles = await prisma.articles.findMany({
        where: {
          is_published: true,
          ...(queryCondition
            ? {
                OR: [
                  { title: queryCondition },
                  { content: queryCondition },
                ],
              }
            : {}),
        },
        include: {
          article_categories: { select: { name: true } },
        },
        orderBy: { published_at: 'desc' },
        take: takeCount,
      });

      for (const a of articles) {
        results.push({
          id: a.id,
          slug: a.slug,
          title: cleanText(a.title),
          subtitle: cleanText(a.article_categories?.name || 'Karier'),
          meta: cleanText(a.author || 'Tim Employr'),
          url: `/career/${a.slug}`,
          category: 'artikel',
          categoryLabel: 'Artikel',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          iconLetter: 'A',
        });
      }
    }

    // 4. Sertifikasi
    if (normalizedType === 'all' || normalizedType === 'sertifikasi') {
      const takeCount = normalizedType === 'all' ? (q ? 3 : 2) : 12;
      const certs = await prisma.certifications.findMany({
        where: {
          is_active: true,
          ...(queryCondition
            ? {
                OR: [
                  { title: queryCondition },
                  { provider: queryCondition },
                  { description: queryCondition },
                ],
              }
            : {}),
        },
        orderBy: { created_at: 'desc' },
        take: takeCount,
      });

      for (const c of certs) {
        const priceStr = c.price > 0 ? `Rp ${(c.price / 1000).toLocaleString('id-ID')}k` : 'Gratis';
        results.push({
          id: c.id,
          slug: c.slug,
          title: cleanText(c.title),
          subtitle: cleanText(c.provider),
          meta: `${c.duration_hours > 0 ? `${c.duration_hours}j • ` : ''}${priceStr}`,
          url: `/sertifikasi/${c.slug}`,
          category: 'sertifikasi',
          categoryLabel: 'Sertifikasi',
          badgeClass: 'bg-orange-50 text-orange-800 border-orange-200',
          iconLetter: 'S',
        });
      }
    }

    // 5. Pelatihan / Kursus
    if (normalizedType === 'all' || normalizedType === 'course') {
      const takeCount = normalizedType === 'all' ? (q ? 3 : 2) : 12;
      const courses = await prisma.courses.findMany({
        where: {
          is_active: true,
          ...(queryCondition
            ? {
                OR: [
                  { title: queryCondition },
                  { instructor: queryCondition },
                  { description: queryCondition },
                ],
              }
            : {}),
        },
        orderBy: { created_at: 'desc' },
        take: takeCount,
      });

      for (const k of courses) {
        const priceStr = k.price > 0 ? `Rp ${(k.price / 1000).toLocaleString('id-ID')}k` : 'Gratis';
        results.push({
          id: k.id,
          slug: k.slug,
          title: cleanText(k.title),
          subtitle: cleanText(k.instructor || 'Instruktur'),
          meta: `${k.level || 'Semua level'} • ${priceStr}`,
          url: `/course/${k.slug}`,
          category: 'course',
          categoryLabel: 'Pelatihan',
          badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          iconLetter: 'P',
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        query: q,
        type: normalizedType,
        count: results.length,
        results,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=15, stale-while-revalidate=60',
        },
      }
    );
  } catch (err: any) {
    console.error('[API /api/search] Error:', err);
    return new Response(
      JSON.stringify({
        success: false,
        results: [],
        message: 'Gagal mengambil hasil pencarian.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
