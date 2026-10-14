import { NextRequest, NextResponse } from 'next/server';
import { prisma, Prisma } from '@employr/db';
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

function cleanJobTitleAndCompany(rawTitle: string, rawCompany: string): { title: string; company: string } {
  let title = (rawTitle || '').trim();
  let company = (rawCompany || '').trim();

  const lkPosisiMatch = title.match(/^Lowongan\s+Kerja\s+(.+?)\s+Posisi\s+(.+)$/i);
  if (lkPosisiMatch) {
    if (!company || company.toLowerCase() === 'perusahaan') {
      const extractedComp = lkPosisiMatch[1].trim();
      company = extractedComp.toUpperCase() === 'BRI' ? 'Bank BRI' : extractedComp;
    }
    title = lkPosisiMatch[2].trim();
  } else {
    const lkDashMatch = title.match(/^Lowongan\s+Kerja\s+(.+?)\s*[-–:]\s*(.+)$/i);
    if (lkDashMatch) {
      if (!company || company.toLowerCase() === 'perusahaan') {
        const extractedComp = lkDashMatch[1].trim();
        company = extractedComp.toUpperCase() === 'BRI' ? 'Bank BRI' : extractedComp;
      }
      title = lkDashMatch[2].trim();
    }
  }

  title = title.replace(/^Lowongan\s+Kerja\s+/i, '');

  if (!company || company.toLowerCase() === 'perusahaan') {
    company = 'Perusahaan Mitra';
  }

  return { title, company };
}

function mapJob(job: any, companyName: string, matchScore?: number) {
  const requirements = Array.isArray(job.requirements) ? job.requirements : [];
  const cleaned = cleanJobTitleAndCompany(job.title, companyName);
  const deadlineDate = job.deadline ? (job.deadline instanceof Date ? job.deadline : new Date(job.deadline)) : null;
  const createdAtDate = job.created_at ? (job.created_at instanceof Date ? job.created_at : new Date(job.created_at)) : new Date();

  return {
    id: job.id,
    title: cleaned.title,
    position: cleaned.title,
    company: cleaned.company,
    location: job.location === '[object Object]' ? 'Indonesia' : (job.location || 'Indonesia'),
    salary: formatSalary(job.salary_min, job.salary_max, job.salary_period),
    type: workTypeLabel(job.work_type),
    workType: job.work_type,
    postedDate: formatPostedTime(createdAtDate),
    description: job.description || '',
    requirements,
    skills: requirements.length > 0 ? requirements.slice(0, 6) : [],
    externalUrl: job.external_url || '',
    deadline: deadlineDate ? deadlineDate.toISOString() : null,
    createdAt: createdAtDate.toISOString(),
    matchScore: matchScore !== undefined ? matchScore : 85,
  };
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '24', 10) || 24, 100);
    const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10) || 0, 0);
    const workType = (url.searchParams.get('workType') || url.searchParams.get('type') || '').toUpperCase();

    const workTypeFilter: any = {};
    if (workType && workType !== 'ALL') {
      if (workType === 'REMOTE') {
        workTypeFilter.work_type = { in: ['REMOTE', 'ONLINE'] };
      } else if (workType === 'HYBRID') {
        workTypeFilter.work_type = 'HYBRID';
      } else if (workType === 'ONSITE') {
        workTypeFilter.work_type = 'ONSITE';
      }
    }

    const user = await getAuthUser(req);
    let targetJob = '';
    let userSkills: string[] = [];
    let userLocation = '';
    let cvExperience: any[] = [];
    let cvSalary = '';

    let semanticMappedResults: any[] = [];
    if (offset === 0 && user?.id) {
      try {
        const userVector = await (prisma as any).$queryRaw`
          SELECT id FROM user_career_embeddings WHERE user_id = ${user.id}::uuid LIMIT 1;
        `;

        const workTypeCondition = workType === 'REMOTE'
          ? Prisma.sql`AND j.work_type IN ('REMOTE', 'ONLINE')`
          : workType === 'HYBRID'
          ? Prisma.sql`AND j.work_type = 'HYBRID'`
          : workType === 'ONSITE'
          ? Prisma.sql`AND j.work_type = 'ONSITE'`
          : Prisma.empty;

        if (Array.isArray(userVector) && userVector.length > 0) {
          const semanticJobs = await (prisma as any).$queryRaw`
            SELECT 
              j.id, j.title, j.location, j.work_type, j.salary_min, j.salary_max, j.salary_period,
              j.slug, j.requirements, j.description, j.external_url, j.deadline, j.created_at,
              c.name as company_name,
              ROUND(((1 - (je.embedding <=> ue.embedding)) * 100)::numeric, 0) AS match_score
            FROM jobs j
            JOIN job_embeddings je ON j.id = je.job_id
            LEFT JOIN companies c ON j.company_id = c.id
            CROSS JOIN user_career_embeddings ue
            WHERE ue.user_id = ${user.id}::uuid 
              AND j.is_active = true
              ${workTypeCondition}
            ORDER BY je.embedding <=> ue.embedding ASC
            LIMIT ${limit};
          `;

          if (Array.isArray(semanticJobs) && semanticJobs.length > 0) {
            const mappedResults = semanticJobs.map((j: any) =>
              mapJob(j, j.company_name || 'Perusahaan', Number(j.match_score) || 85)
            );
            if (mappedResults.length >= limit) {
              return NextResponse.json({ success: true, isSemantic: true, data: mappedResults });
            }
            semanticMappedResults = mappedResults;
          }
        }
      } catch (vectorErr) {
        console.warn('[Semantic Recommendations Warning] Falling back to rule-based:', vectorErr);
      }
    }

    const allCvsForMatch: any[] = [];
    const allTargetRoles = new Set<string>();
    const allLocations = new Set<string>();

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

      if (dbUser?.target_job) {
        allTargetRoles.add(dbUser.target_job.trim());
      }

      for (const cp of cvProjects) {
        const d = (cp.data || {}) as Record<string, any>;
        const role = (cp.target_position || d.targetRole || d.headline || '').trim();
        if (role) allTargetRoles.add(role);

        if (d.location) allLocations.add(d.location.trim());

        const skills = [
          ...(Array.isArray(d.skills) ? d.skills.map((s: any) => (typeof s === 'string' ? s : s?.name || '')) : []),
          ...(Array.isArray(d.skillsList) ? d.skillsList : []),
          ...(dbUser?.skills || []),
        ].filter(Boolean);

        allCvsForMatch.push({
          targetRole: role,
          skills,
          location: (d.location || '').trim(),
          experience: d.experience || [],
          expectedSalary: d.expectedSalary || '',
        });
      }

      // If user has no active CVs but has profile target_job or skills
      if (allCvsForMatch.length === 0 && (dbUser?.target_job || (dbUser?.skills && dbUser.skills.length > 0))) {
        allCvsForMatch.push({
          targetRole: dbUser.target_job || '',
          skills: dbUser.skills || [],
          location: '',
          experience: [],
          expectedSalary: '',
        });
      }
    }

    // Extract search keywords from all target positions and locations
    const searchConditions: any[] = [];

    for (const role of Array.from(allTargetRoles)) {
      const roleTokens = role
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((t) => t.length > 2 && !['and', 'atau', 'dan', 'staff', 'junior', 'senior', 'intern', 'magang', 'fresh', 'graduate'].includes(t));

      for (const token of roleTokens) {
        searchConditions.push({ title: { contains: token, mode: 'insensitive' } });
      }

      // Add common domain synonyms for roles
      const lowerRole = role.toLowerCase();
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
      if (lowerRole.includes('customer') || lowerRole.includes('service') || lowerRole.includes('cs')) {
        searchConditions.push({ title: { contains: 'customer', mode: 'insensitive' } });
        searchConditions.push({ title: { contains: 'service', mode: 'insensitive' } });
      }
    }

    for (const loc of Array.from(allLocations)) {
      const locTokens = loc
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((t) => t.length > 2 && !['indonesia', 'kota', 'kabupaten', 'provinsi', 'daerah'].includes(t));

      for (const token of locTokens) {
        searchConditions.push({ location: { contains: token, mode: 'insensitive' } });
      }
    }

    // Only include remote/hybrid opportunities as potential matches if user hasn't explicitly filtered by work type
    if (!workType || workType === 'ALL') {
      searchConditions.push({ work_type: 'REMOTE' });
      searchConditions.push({ work_type: 'HYBRID' });
    }

    const semanticIds = new Set(semanticMappedResults.map((s) => s.id));

    // 1. Fetch targeted candidate pool from database (excluding already mapped semantic jobs)
    let candidates = await prisma.jobs.findMany({
      where: {
        is_active: true,
        id: { notIn: Array.from(semanticIds) },
        ...workTypeFilter,
        ...(searchConditions.length > 0 ? { OR: searchConditions } : {}),
      },
      include: {
        companies: {
          select: {
            id: true,
            name: true,
            slug: true,
            website: true,
            location: true,
            industry: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      skip: offset,
      take: Math.max(limit * 2, 48),
    });

    // 2. If candidate pool is too small to reach limit, supplement with recent active jobs
    if (candidates.length < limit) {
      const existingIds = new Set([...candidates.map((c) => c.id), ...semanticIds]);
      const recent = await prisma.jobs.findMany({
        where: {
          is_active: true,
          id: { notIn: Array.from(existingIds) },
          ...workTypeFilter,
        },
        include: {
          companies: {
            select: {
              id: true,
              name: true,
              slug: true,
              website: true,
              location: true,
              industry: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: Math.max(limit * 2 - candidates.length, limit),
      });
      candidates = [...candidates, ...recent];
    }

    if (candidates.length === 0 && semanticMappedResults.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // 3. Score every candidate using realistic matching against all active CVs
    const scoredJobs = candidates.map((job) => {
      const mapped = mapJob(job, job.companies?.name || 'Perusahaan');
      
      let bestMatch = { matchScore: 0, breakdown: null as any };
      if (allCvsForMatch.length > 0) {
        for (const cv of allCvsForMatch) {
          const match = calculateJobMatch(cv, {
            id: job.id,
            title: job.title,
            company: job.companies?.name || 'Perusahaan',
            location: mapped.location,
            workType: job.work_type,
            salary: mapped.salary,
            description: job.description || '',
            requirements: mapped.requirements,
          });
          if (match.matchScore > bestMatch.matchScore) {
            bestMatch = match;
          }
        }
      } else {
        bestMatch = { matchScore: 85, breakdown: null };
      }

      return {
        ...mapped,
        matchScore: bestMatch.matchScore > 0 ? bestMatch.matchScore : 78,
        breakdown: bestMatch.breakdown,
      };
    });

    // 4. Sort by matchScore descending
    const sorted = scoredJobs.sort((a, b) => b.matchScore - a.matchScore);

    // 5. Prioritize higher relevance matches, but ALWAYS backfill from sorted candidates
    // so the requested `limit` count is always returned to the user without dropping jobs.
    const highMatch = allTargetRoles.size > 0
      ? sorted.filter((j) => j.matchScore >= 25)
      : sorted;

    const highMatchIds = new Set(highMatch.map((j) => j.id));
    const pool = [...highMatch, ...sorted.filter((j) => !highMatchIds.has(j.id))];

    const finalResult = offset === 0
      ? [
          ...semanticMappedResults,
          ...pool.filter((j) => !semanticIds.has(j.id)),
        ].slice(0, limit)
      : pool.filter((j) => !semanticIds.has(j.id)).slice(0, limit);

    return NextResponse.json({
      success: true,
      data: finalResult,
      isSemantic: semanticMappedResults.length > 0,
    });
  } catch (error: any) {
    console.error('[GET /api/jobs/recommended] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat rekomendasi lowongan dari database.' },
      { status: 500 }
    );
  }
}
