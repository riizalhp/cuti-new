import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@employr/db';
import crypto from 'crypto';
import { getAuthUser } from '@/lib/server-auth';
import { evaluateCareerIntelligence, ROLE_TAXONOMY, RoleTaxonomyItem } from '@/lib/career-intelligence-engine';
import { callAiGateway } from '@/lib/ai-gateway';

async function resolveDynamicRole(
  requestedRoleId: string | undefined,
  targetJobTitle: string | null | undefined,
  userId?: string
): Promise<RoleTaxonomyItem | undefined> {
  const jobTitle = targetJobTitle?.trim() || '';
  const roleQuery = requestedRoleId?.trim() || jobTitle;
  if (!roleQuery || roleQuery.length < 2) return undefined;

  const normQuery = roleQuery.toLowerCase().replace(/[^a-z0-9]/g, '');
  const isStandard = ROLE_TAXONOMY.some((r) => {
    const normTitle = r.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    return r.id === roleQuery || normTitle.includes(normQuery) || normQuery.includes(normTitle);
  });

  if (isStandard) return undefined;

  const cleanTitle = jobTitle || roleQuery.replace(/-/g, ' ');
  const slugId = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // 1. Cek database learned_role_blueprints
  try {
    const existingBlueprint = await (prisma as any).learnedRoleBlueprint.findFirst({
      where: {
        OR: [
          { role_name: { equals: cleanTitle, mode: 'insensitive' } },
          { role_name: { equals: roleQuery, mode: 'insensitive' } },
        ],
      },
    });

    if (existingBlueprint && Array.isArray(existingBlueprint.top_essential_skills) && existingBlueprint.top_essential_skills.length > 0) {
      return {
        id: slugId,
        title: existingBlueprint.role_name,
        category: 'operations',
        categoryLabel: 'Profesi Terapan',
        description: `Analisis kompetensi berbasis data pasar untuk posisi ${existingBlueprint.role_name}.`,
        seniority: 'Entry Level',
        competencies: existingBlueprint.top_essential_skills.map((skill: string, idx: number) => ({
          id: `comp-${slugId}-${idx}`,
          name: skill,
          description: `Penguasaan praktis terhadap ${skill} untuk operasional harian.`,
          aliases: [skill.toLowerCase()],
          keywords: [skill.toLowerCase(), cleanTitle.toLowerCase()],
          requiredScore: 75,
          weight: 1.2,
        })),
        commonTransitions: [],
      };
    }
  } catch (dbErr) {
    console.warn('[Career Intelligence] Gagal cek blueprint DB:', dbErr);
  }

  // 2. Jika belum ada di DB, panggil AI Gateway 1x untuk merumuskan blueprint kompetensi
  try {
    const aiBlueprintPrompt = `Buatlah blueprint taksonomi kompetensi standar untuk profesi pekerjaan: "${cleanTitle}".
Kembalikan 4 kompetensi kunci yang paling sering disyaratkan oleh industri untuk posisi ini dalam format JSON murni:
{
  "title": "${cleanTitle}",
  "categoryLabel": "Bidang Keahlian",
  "description": "Deskripsi singkat tanggung jawab utama posisi ${cleanTitle}.",
  "essentialSkills": ["Nama Skill 1", "Nama Skill 2", "Nama Skill 3", "Nama Skill 4"],
  "competencies": [
    {
      "name": "Nama Kompetensi",
      "description": "Penjelasan pentingnya kompetensi ini",
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "requiredScore": 75,
      "weight": 1.2
    }
  ]
}
Kembalikan HANYA format JSON valid tanpa tanda markdown codeblock.`;

    const aiRes = await callAiGateway({
      feature: 'career_intelligence',
      promptName: 'Dynamic Role Blueprint Synthesis',
      prompt: aiBlueprintPrompt,
      systemPrompt: 'Kamu adalah pakar taksonomi standar kompetensi kerja Indonesia.',
      temperature: 0.2,
      userId,
    });

    if (aiRes?.text) {
      const cleanText = aiRes.text.replace(/^```[a-z]*\n/i, '').replace(/```$/g, '').trim();
      const parsed = JSON.parse(cleanText);
      if (parsed && Array.isArray(parsed.competencies) && parsed.competencies.length > 0) {
        const dynamicRole: RoleTaxonomyItem = {
          id: slugId,
          title: parsed.title || cleanTitle,
          category: 'operations',
          categoryLabel: parsed.categoryLabel || 'Karier Spesialis',
          description: parsed.description || `Analisis kompetensi untuk ${cleanTitle}`,
          seniority: 'Entry Level',
          competencies: parsed.competencies.map((c: any, i: number) => ({
            id: `comp-${slugId}-${i}`,
            name: c.name,
            description: c.description || c.name,
            aliases: [c.name.toLowerCase()],
            keywords: Array.isArray(c.keywords) ? c.keywords : [c.name.toLowerCase()],
            requiredScore: c.requiredScore || 75,
            weight: c.weight || 1.1,
          })),
          commonTransitions: [],
        };

        const essentialSkills =
          Array.isArray(parsed.essentialSkills) && parsed.essentialSkills.length > 0
            ? parsed.essentialSkills
            : dynamicRole.competencies.map((c) => c.name);

        await (prisma as any).learnedRoleBlueprint.upsert({
          where: { role_name: dynamicRole.title },
          create: {
            id: crypto.randomUUID(),
            role_name: dynamicRole.title,
            category: 'dynamic_ai',
            top_essential_skills: essentialSkills,
            top_nicetohave_skills: [],
            entry_count: 1,
            is_promoted: true,
            updated_at: new Date(),
          },
          update: {
            top_essential_skills: essentialSkills,
            updated_at: new Date(),
          },
        }).catch(() => {});

        return dynamicRole;
      }
    }
  } catch (aiErr) {
    console.warn('[Career Intelligence] Gagal sintesis AI role blueprint:', aiErr);
  }

  return undefined;
}

function createFallbackRoleItem(roleQuery: string): RoleTaxonomyItem {
  const cleanTitle = roleQuery.replace(/[-_]/g, ' ').trim();
  const slugId = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'role-custom';
  return {
    id: slugId,
    title: cleanTitle,
    category: 'operations',
    categoryLabel: 'Profesi Terapan',
    description: `Analisis kompetensi berbasis data pasar untuk posisi ${cleanTitle}.`,
    seniority: 'Entry Level',
    competencies: [
      {
        id: `comp-${slugId}-1`,
        name: `Keahlian Utama ${cleanTitle}`,
        description: `Pemahaman dan penerapan tugas operasional pada posisi ${cleanTitle}.`,
        aliases: [cleanTitle.toLowerCase()],
        keywords: [cleanTitle.toLowerCase()],
        requiredScore: 80,
        weight: 1.3,
      },
      {
        id: `comp-${slugId}-2`,
        name: 'Komunikasi & Koordinasi Kerja',
        description: 'Kemampuan berkoordinasi dan komunikasi dalam lingkungan kerja profesional.',
        aliases: ['komunikasi', 'koordinasi', 'kerjasama'],
        keywords: ['komunikasi', 'koordinasi', 'tim', 'laporan'],
        requiredScore: 75,
        weight: 1.0,
      },
      {
        id: `comp-${slugId}-3`,
        name: 'Ketelitian & Manajemen Tugas',
        description: 'Menyelesaikan pekerjaan dengan akurat, rapi, dan tepat waktu.',
        aliases: ['ketelitian', 'disiplin', 'tanggung jawab'],
        keywords: ['teliti', 'deadline', 'disiplin', 'sop'],
        requiredScore: 75,
        weight: 1.0,
      },
    ],
    commonTransitions: [],
  };
}

async function resolveSingleRole(
  roleQuery: string | undefined,
  userId?: string
): Promise<RoleTaxonomyItem> {
  const cleanQuery = roleQuery?.trim() || '';
  if (!cleanQuery) return ROLE_TAXONOMY[0];

  const normQuery = cleanQuery.toLowerCase().replace(/[^a-z0-9]/g, '');

  // 1. Cek di ROLE_TAXONOMY
  const standard = ROLE_TAXONOMY.find((r) => {
    const normTitle = r.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    return r.id === cleanQuery || normTitle.includes(normQuery) || normQuery.includes(normTitle);
  });
  if (standard) return standard;

  // 2. Cek dinamika DB learnedRoleBlueprint atau AI
  const dynamic = await resolveDynamicRole(cleanQuery, cleanQuery, userId);
  if (dynamic) return dynamic;

  // 3. Fallback konstruktif
  return createFallbackRoleItem(cleanQuery);
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    const url = new URL(req.url);
    const requestedRoleId = url.searchParams.get('roleId') || undefined;
    const requestedCvId = url.searchParams.get('cvId') || 'all';

    if (!user) {
      const defaultRole = await resolveSingleRole(requestedRoleId || 'staff-admin', undefined);
      const fallbackAssessment = evaluateCareerIntelligence(
        null,
        [],
        [],
        defaultRole.id,
        defaultRole,
        requestedCvId,
        [defaultRole]
      );
      return NextResponse.json({
        success: true,
        data: fallbackAssessment,
      });
    }

    // Ambil data profil lengkap, CV aktif, dan lamaran dari database
    const [userRecord, cvProjects, applications] = await Promise.all([
      prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          name: true,
          email: true,
          target_job: true,
          education: true,
          major: true,
          last_company: true,
          experience_year: true,
          skills: true,
        },
      }),
      prisma.cv_projects.findMany({
        where: { user_id: user.id, is_active: true },
        orderBy: { updated_at: 'desc' },
      }),
      prisma.applications.findMany({
        where: { user_id: user.id },
        select: {
          id: true,
          position: true,
          company_name: true,
          status: true,
        },
      }),
    ]);

    // Format CV data
    const formattedCvs = cvProjects.map((p) => {
      const parsedData = (typeof p.data === 'object' && p.data !== null ? p.data : {}) as Record<string, any>;
      return {
        id: p.id,
        title: p.title || 'CV Aktif',
        targetPosition: p.target_position || '',
        skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
        experience: Array.isArray(parsedData.experience) ? parsedData.experience : [],
        projects: Array.isArray(parsedData.projects) ? parsedData.projects : [],
        education: Array.isArray(parsedData.education) ? parsedData.education : [],
      };
    });

    // Kumpulkan role-role riil yang benar-benar terkait dengan pengguna
    const userRoleQueries: string[] = [];
    if (requestedRoleId?.trim()) {
      userRoleQueries.push(requestedRoleId.trim());
    }
    if (userRecord?.target_job?.trim()) {
      const tj = userRecord.target_job.trim();
      if (!userRoleQueries.some((q) => q.toLowerCase() === tj.toLowerCase())) {
        userRoleQueries.push(tj);
      }
    }
    formattedCvs.forEach((cv) => {
      const pos = cv.targetPosition?.trim();
      if (pos && !userRoleQueries.some((q) => q.toLowerCase() === pos.toLowerCase())) {
        userRoleQueries.push(pos);
      }
    });
    applications.forEach((app) => {
      const pos = app.position?.trim();
      if (pos && !userRoleQueries.some((q) => q.toLowerCase() === pos.toLowerCase())) {
        userRoleQueries.push(pos);
      }
    });

    // Resolve setiap role menjadi RoleTaxonomyItem
    const userDefinedRoles: RoleTaxonomyItem[] = [];
    for (const q of userRoleQueries) {
      const item = await resolveSingleRole(q, user.id);
      if (item && !userDefinedRoles.some((r) => r.id === item.id)) {
        userDefinedRoles.push(item);
      }
    }

    // Jika user sama sekali belum memiliki target role (0 CV, 0 target profil, 0 lamaran),
    // gunakan 1 acuan default benchmark tanpa mencemari dropdown dengan seluruh catalog
    if (userDefinedRoles.length === 0) {
      userDefinedRoles.push(ROLE_TAXONOMY[0]);
    }

    const activeTargetRole = requestedRoleId
      ? userDefinedRoles.find((r) => r.id === requestedRoleId || r.title.toLowerCase() === requestedRoleId.toLowerCase()) || userDefinedRoles[0]
      : userDefinedRoles[0];

    const assessment = evaluateCareerIntelligence(
      userRecord,
      formattedCvs,
      applications,
      activeTargetRole.id,
      activeTargetRole,
      requestedCvId,
      userDefinedRoles
    );

    return NextResponse.json({
      success: true,
      data: assessment,
    });
  } catch (error: any) {
    console.error('[GET /api/career-intelligence] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat analisis Career Intelligence.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const roleId = body.roleId;
    const cvId = body.cvId || 'all';

    if (!roleId || typeof roleId !== 'string') {
      return NextResponse.json(
        { success: false, message: 'ID role tidak valid.' },
        { status: 400 }
      );
    }

    // Ambil data terbaru pengguna
    const [userRecord, cvProjects, applications] = await Promise.all([
      prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          name: true,
          email: true,
          target_job: true,
          education: true,
          major: true,
          last_company: true,
          experience_year: true,
          skills: true,
        },
      }),
      prisma.cv_projects.findMany({
        where: { user_id: user.id, is_active: true },
        orderBy: { updated_at: 'desc' },
      }),
      prisma.applications.findMany({
        where: { user_id: user.id },
        select: {
          id: true,
          position: true,
          company_name: true,
          status: true,
        },
      }),
    ]);

    const formattedCvs = cvProjects.map((p) => {
      const parsedData = (typeof p.data === 'object' && p.data !== null ? p.data : {}) as Record<string, any>;
      return {
        id: p.id,
        title: p.title || 'CV Aktif',
        targetPosition: p.target_position || '',
        skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
        experience: Array.isArray(parsedData.experience) ? parsedData.experience : [],
        projects: Array.isArray(parsedData.projects) ? parsedData.projects : [],
        education: Array.isArray(parsedData.education) ? parsedData.education : [],
      };
    });

    // Resolve target role baru
    const targetRoleItem = await resolveSingleRole(roleId, user.id);

    // Perbarui target job di profil user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        target_job: targetRoleItem.title,
        updated_at: new Date(),
      },
    });

    // Kumpulkan role-role riil user
    const userRoleQueries: string[] = [targetRoleItem.title];
    formattedCvs.forEach((cv) => {
      const pos = cv.targetPosition?.trim();
      if (pos && !userRoleQueries.some((q) => q.toLowerCase() === pos.toLowerCase())) {
        userRoleQueries.push(pos);
      }
    });
    applications.forEach((app) => {
      const pos = app.position?.trim();
      if (pos && !userRoleQueries.some((q) => q.toLowerCase() === pos.toLowerCase())) {
        userRoleQueries.push(pos);
      }
    });

    const userDefinedRoles: RoleTaxonomyItem[] = [];
    for (const q of userRoleQueries) {
      const item = await resolveSingleRole(q, user.id);
      if (item && !userDefinedRoles.some((r) => r.id === item.id)) {
        userDefinedRoles.push(item);
      }
    }

    const updatedAssessment = evaluateCareerIntelligence(
      userRecord,
      formattedCvs,
      applications,
      targetRoleItem.id,
      targetRoleItem,
      cvId,
      userDefinedRoles
    );

    return NextResponse.json({
      success: true,
      data: updatedAssessment,
    });
  } catch (error: any) {
    console.error('[POST /api/career-intelligence] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui target role analisis.' },
      { status: 500 }
    );
  }
}
