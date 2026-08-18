import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cuti/db';

function formatSalary(salaryMin: number | null, salaryMax: number | null, period: string): string {
  const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;
  if (salaryMin && salaryMax) {
    return `${fmt(salaryMin)} - ${fmt(salaryMax)}${period === 'YEAR' ? '/tahun' : ''}`;
  }
  if (salaryMin) return `${fmt(salaryMin)}${period === 'YEAR' ? '/tahun' : ''}`;
  return '-';
}

function formatPostedTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return 'Baru saja';
  if (diffHours < 24) return `${diffHours} jam lalu`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Kemarin';
  if (diffDays < 7) return `${diffDays} hari lalu`;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function workTypeLabel(workType: string): string {
  switch (workType) {
    case 'ONSITE':
      return 'On-Site';
    case 'REMOTE':
      return 'Remote';
    case 'HYBRID':
      return 'Hybrid';
    case 'ONLINE':
      return 'Online';
    default:
      return 'Full-time';
  }
}

function mapJob(job: any) {
  const requirements = Array.isArray(job.requirements) ? job.requirements : [];
  const company = job.companies?.name || 'Perusahaan';
  return {
    id: job.id,
    title: job.title,
    position: job.title,
    company,
    location: job.location || 'Indonesia',
    salary: formatSalary(job.salary_min, job.salary_max, job.salary_period),
    type: workTypeLabel(job.work_type),
    postedDate: formatPostedTime(job.created_at),
    description: job.description || '',
    requirements,
    skills: requirements.length > 0 ? requirements.slice(0, 6) : [],
    externalUrl: job.external_url || '',
    deadline: job.deadline?.toISOString() || null,
    createdAt: job.created_at.toISOString(),
  };
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10) || 50, 100);

    const jobs = await prisma.jobs.findMany({
      where: { is_active: true },
      include: { companies: true },
      orderBy: { created_at: 'desc' },
      take: limit,
    });

    return NextResponse.json({ success: true, data: jobs.map(mapJob) });
  } catch (error: any) {
    console.error('[GET /api/jobs] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat lowongan dari database.' },
      { status: 500 }
    );
  }
}
