import { NextRequest, NextResponse } from 'next/server';
import { prisma, learnedRoleService } from '@employr/db';
import { getAuthUser } from '@/lib/server-auth';
import { calculateAtsScore } from '@/lib/ats-score';
import crypto from 'crypto';

function isValidUUID(str: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

function formatIndonesianDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24 && now.getDate() === date.getDate()) {
    return 'Hari ini';
  } else if (diffHours < 48 && now.getDate() - date.getDate() === 1) {
    return 'Kemarin';
  }

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Catatan: tidak ada auto-seed CV contoh. Pengguna membuat CV sendiri lewat
    // wizard "Buat CV" sehingga skor ATS di dashboard mencerminkan data asli.
    const projects = await prisma.cv_projects.findMany({
      where: { user_id: user.id, is_active: true },
      orderBy: { updated_at: 'desc' },
    });

    const mappedCvs = projects.map((p) => {
      const parsedData = (typeof p.data === 'object' && p.data !== null ? p.data : {}) as Record<string, any>;
      const resolvedFullName = parsedData.fullName || user.name || '';
      const resolvedSkills = Array.isArray(parsedData.skills)
        ? parsedData.skills
        : [];

      const fullData = {
        ...parsedData,
        id: p.id,
        fullName: resolvedFullName,
        headline: p.target_position || parsedData.headline || '',
        skills: resolvedSkills,
      };

      const computedScore = calculateAtsScore(fullData).totalScore;
      const finalAtsScore = (parsedData.atsScore && parsedData.atsScore > 0)
        ? parsedData.atsScore
        : (computedScore > 0 ? computedScore : 0);

      return {
        ...fullData,
        title: p.title || parsedData.title || 'CV ATS',
        templateId: p.template_id || parsedData.templateId || 'ats-modern-standard',
        atsScore: finalAtsScore,
        updatedAt: formatIndonesianDate(p.updated_at),
      };
    });

    return NextResponse.json({ success: true, data: mappedCvs });
  } catch (error: any) {
    console.error('[GET /api/cv] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat data CV dari database.' },
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
    const newId = isValidUUID(body.id) ? body.id : crypto.randomUUID();
    const title = body.title || 'CV ATS Baru';
    const templateId = body.templateId || 'ats-modern-standard';
    const targetPosition = body.headline || body.target_position || 'Professional';

    const fullCvData = {
      ...body,
      id: newId,
      updatedAt: 'Hari ini',
    };

    const newCv = await prisma.cv_projects.create({
      data: {
        id: newId,
        user_id: user.id,
        title,
        template_id: templateId,
        target_position: targetPosition,
        data: fullCvData,
        status: 'DRAFT',
        is_active: true,
        updated_at: new Date(),
      },
    });

    // ── Self-Learning Engine: Rekam target peran dan keahlian dari CV secara non-blocking ──
    try {
      const candidateSkills = Array.isArray(body.skills) ? body.skills : [];
      const primaryTarget = (body.headline || targetPosition || '').trim();
      if (primaryTarget && candidateSkills.length > 0) {
        learnedRoleService.recordEntry({
          role_name: primaryTarget,
          skills: candidateSkills,
          education_level: body.educations?.[0]?.degree || body.educationLevel || null,
          major: body.educations?.[0]?.major || body.major || null,
          user_id: user.id,
        }).catch(() => {});
      }

      // Rekam juga posisi pengalaman kerja nyata jika ada
      if (Array.isArray(body.experiences)) {
        for (const exp of body.experiences) {
          const expRole = (exp.role || exp.position || '').trim();
          if (expRole && candidateSkills.length > 0) {
            learnedRoleService.recordEntry({
              role_name: expRole,
              skills: candidateSkills,
              user_id: user.id,
            }).catch(() => {});
          }
        }
      }
    } catch (learnErr) {
      // Non-blocking, continue CV flow
    }

    return NextResponse.json({
      success: true,
      data: {
        ...fullCvData,
        id: newCv.id,
        updatedAt: 'Hari ini',
      },
    });
  } catch (error: any) {
    console.error('[POST /api/cv] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat CV di database.' },
      { status: 500 }
    );
  }
}
