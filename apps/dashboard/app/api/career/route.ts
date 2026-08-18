import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cuti/db';

function estimateReadTime(content: string | null): string {
  const wordCount = (content || '').trim() ? content!.split(/\s+/).length : 0;
  return `${Math.max(1, Math.round(wordCount / 200))} min baca`;
}

function truncate(text: string | null, max = 130): string {
  const clean = (text || '').trim();
  if (!clean) return '';
  return clean.length > max ? `${clean.slice(0, max).trim()}…` : clean;
}

function formatCurrency(price: number): string {
  return price === 0 ? 'Gratis' : `Rp ${price.toLocaleString('id-ID')}`;
}

function formatEventDate(date: Date): string {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function workTypeBadge(type: string): string {
  switch (type) {
    case 'ONSITE':
      return 'Job Fair';
    case 'ONLINE':
      return 'Webinar';
    case 'REMOTE':
      return 'Online';
    case 'HYBRID':
      return 'Hybrid';
    default:
      return 'Event';
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '9', 10) || 9, 20);

    const [articles, courses, certifications, events] = await Promise.all([
      prisma.articles.findMany({
        where: { is_published: true },
        include: { article_categories: true },
        orderBy: { published_at: 'desc' },
        take: limit,
      }),
      prisma.courses.findMany({
        where: { is_active: true },
        orderBy: { created_at: 'desc' },
        take: limit,
      }),
      prisma.certifications.findMany({
        where: { is_active: true },
        orderBy: { created_at: 'desc' },
        take: limit,
      }),
      prisma.events.findMany({
        where: { is_active: true },
        orderBy: { event_date: 'desc' },
        take: limit,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        articles: articles.map((a) => ({
          id: a.id,
          title: a.title,
          category: a.article_categories?.name || 'Karier',
          readTime: estimateReadTime(a.content),
          desc: truncate(a.content),
          content: a.content || '',
          author: a.author || 'Tim Employr',
          slug: a.slug,
          publishedAt: a.published_at?.toISOString() || null,
        })),
        courses: courses.map((c) => ({
          id: c.id,
          title: c.title,
          provider: c.instructor,
          level: c.level,
          price: formatCurrency(c.price),
          rating: c.duration_hours ? `${c.duration_hours} Jam` : 'Online',
          desc: c.description,
          url: c.external_url,
        })),
        certifications: certifications.map((c) => ({
          id: c.id,
          title: c.title,
          issuer: c.provider,
          validity: c.duration_hours ? `${c.duration_hours} Jam Pelajaran` : 'Selamanya',
          badge: c.price === 0 ? 'Gratis' : 'Bersertifikat',
          desc: c.description,
          url: c.external_url,
        })),
        events: events.map((e) => ({
          id: e.id,
          title: e.title,
          organizer: 'Employr',
          date: formatEventDate(e.event_date),
          location: e.location,
          badge: workTypeBadge(e.type),
          desc: e.description,
          url: e.external_url,
        })),
      },
    });
  } catch (error: any) {
    console.error('[GET /api/career] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat konten pengembangan karier dari database.' },
      { status: 500 }
    );
  }
}
