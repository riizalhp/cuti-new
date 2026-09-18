import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@employr/db';
import { getAuthUser } from '@/lib/server-auth';
import { calculateJobMatch } from '@/lib/job-matcher';

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
    location: job.location === '[object Object]' ? 'Indonesia' : (job.location || 'Indonesia'),
    salary: formatSalary(job.salary_min, job.salary_max, job.salary_period),
    type: workTypeLabel(job.work_type),
    workType: job.work_type,
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

    const user = await getAuthUser(req);
    let targetJob = '';
    let userSkills: string[] = [];
    let userLocation = '';
    let cvExperience: any[] = [];
    let cvSalary = '';

    if (user) {
      const [dbUser, cvProjects] = await Promise.all([
        prisma.user.findUnique({
          where: { id: user.id },
          select: { skills: true, target_job: true },
        }),
        prisma.cv_projects.findMany({
          where: { user_id: user.id, is_active: true },
          orderBy: { updated_at: 'desc' },
        }),
      ]);

      // Pick the most complete CV or the primary one
      const activeCv =
        cvProjects.find((c: any) => {
          const d = (c.data || {}) as any;
          return (
            (Array.isArray(d.skills) && d.skills.length > 0) ||
            (Array.isArray(d.skillsList) && d.skillsList.length > 0) ||
            (Array.isArray(d.experience) && d.experience.length > 0)
          );
        }) || cvProjects[0];

      const cvData = ((activeCv?.data || {}) as Record<string, any>);
      targetJob = (activeCv?.target_position || cvData.targetRole || cvData.headline || dbUser?.target_job || '').trim();
      userSkills = [
        ...(Array.isArray(cvData.skills) ? cvData.skills.map((s: any) => (typeof s === 'string' ? s : s?.name || '')) : []),
        ...(Array.isArray(cvData.skillsList) ? cvData.skillsList : []),
        ...(dbUser?.skills || []),
      ].filter(Boolean);
      userLocation = (cvData.location || '').trim();
      cvExperience = cvData.experience || [];
      cvSalary = cvData.expectedSalary || '';
    }

    // Extract search keywords from target position and location
    const searchConditions: any[] = [];

    if (targetJob) {
      const roleTokens = targetJob
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((t) => t.length > 2 && !['and', 'atau', 'dan', 'staff', 'junior', 'senior', 'intern', 'magang', 'fresh', 'graduate'].includes(t));

      for (const token of roleTokens) {
        searchConditions.push({ title: { contains: token, mode: 'insensitive' } });
      }

      // Add common domain synonyms for roles
      const lowerRole = targetJob.toLowerCase();
      if (lowerRole.includes('project') || lowerRole.includes('manager')) {
        searchConditions.push({ title: { contains: 'project', mode: 'insensitive' } });
        searchConditions.push({ title: { contains: 'pmo', mode: 'insensitive' } });
        searchConditions.push({ title: { contains: 'scrum', mode: 'insensitive' } });
        searchConditions.push({ title: { contains: 'product', mode: 'insensitive' } });
      }
      if (lowerRole.includes('developer') || lowerRole.includes('web') || lowerRole.includes('engineer')) {
        searchConditions.push({ title: { contains: 'developer', mode: 'insensitive' } });
        searchConditions.push({ title: { contains: 'programmer', mode: 'insensitive' } });
        searchConditions.push({ title: { contains: 'software', mode: 'insensitive' } });
      }
    }

    if (userLocation) {
      const locTokens = userLocation
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((t) => t.length > 2 && !['indonesia', 'kota', 'kabupaten', 'provinsi', 'daerah'].includes(t));

      for (const token of locTokens) {
        searchConditions.push({ location: { contains: token, mode: 'insensitive' } });
      }
    }

    // Always include remote/hybrid opportunities as strong potential matches
    searchConditions.push({ work_type: 'REMOTE' });
    searchConditions.push({ work_type: 'HYBRID' });

    // 1. Fetch targeted candidate pool from database
    let candidates = await prisma.jobs.findMany({
      where: {
        is_active: true,
        OR: searchConditions.length > 0 ? searchConditions : undefined,
      },
      include: { companies: true },
      orderBy: { created_at: 'desc' },
      take: 60,
    });

    // 2. If candidate pool is too small, supplement with recent active jobs
    if (candidates.length < 20) {
      const existingIds = new Set(candidates.map((c) => c.id));
      const recent = await prisma.jobs.findMany({
        where: {
          is_active: true,
          id: { notIn: Array.from(existingIds) },
        },
        include: { companies: true },
        orderBy: { created_at: 'desc' },
        take: 30,
      });
      candidates = [...candidates, ...recent];
    }

    if (candidates.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // 3. Score every candidate using the realistic matching algorithm
    const cvForMatch = {
      targetRole: targetJob,
      skills: userSkills,
      location: userLocation,
      experience: cvExperience,
      expectedSalary: cvSalary,
    };

    const scoredJobs = candidates.map((job) => {
      const mapped = mapJob(job, job.companies?.name || 'Perusahaan');
      const match = calculateJobMatch(cvForMatch, {
        id: job.id,
        title: job.title,
        company: job.companies?.name || 'Perusahaan',
        location: mapped.location,
        workType: job.work_type,
        salary: mapped.salary,
        description: job.description || '',
        requirements: mapped.requirements,
      });

      return {
        ...mapped,
        matchScore: match.matchScore,
        breakdown: match.breakdown,
      };
    });

    // 4. Sort by matchScore descending
    const sorted = scoredJobs.sort((a, b) => b.matchScore - a.matchScore);

    // 5. If user has targetRole or location, only return jobs that have meaningful relevance (>= 25%)
    // rather than serving irrelevant jobs from completely wrong professions or distant regions.
    const filtered = (targetJob || userLocation)
      ? sorted.filter((j) => j.matchScore >= 25)
      : sorted;

    const result = (filtered.length > 0 ? filtered : sorted).slice(0, limit);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[GET /api/jobs/recommended] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat rekomendasi lowongan dari database.' },
      { status: 500 }
    );
  }
}
