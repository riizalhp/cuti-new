import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cuti/db';
import { getAuthUser } from '@/lib/server-auth';

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

function mapJob(job: any, companyName: string) {
  const requirements = Array.isArray(job.requirements) ? job.requirements : [];
  return {
    id: job.id,
    title: job.title,
    position: job.title,
    company: companyName,
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
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10', 10) || 10, 50);

    const jobs = await prisma.jobs.findMany({
      where: { is_active: true },
      include: { companies: true },
      orderBy: { created_at: 'desc' },
      take: limit,
    });

    if (jobs.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Try to rank by the user's skills when a session is available
    let ranked = jobs.map((job) => mapJob(job, job.companies?.name || 'Perusahaan'));

    const user = await getAuthUser(req);
    if (user) {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { skills: true, target_job: true },
      });
      const userSkills = (dbUser?.skills || []).map((s: string) => s.toLowerCase());
      const targetJob = (dbUser?.target_job || '').toLowerCase();

      if (userSkills.length > 0 || targetJob) {
        ranked = ranked
          .map((job: any) => {
            let matchScore = 50;
            const haystack = `${job.title} ${job.company} ${job.description} ${job.requirements.join(' ')}`.toLowerCase();
            if (targetJob && haystack.includes(targetJob)) matchScore += 10;
            for (const skill of userSkills) {
              if (haystack.includes(skill)) matchScore += 8;
            }
            return { ...job, matchScore: Math.min(98, matchScore) };
          })
          .sort((a: any, b: any) => b.matchScore - a.matchScore);
      }
    }

    return NextResponse.json({ success: true, data: ranked });
  } catch (error: any) {
    console.error('[GET /api/jobs/recommended] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat rekomendasi lowongan dari database.' },
      { status: 500 }
    );
  }
}
