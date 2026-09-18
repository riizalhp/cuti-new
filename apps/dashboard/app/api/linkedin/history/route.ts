import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@employr/db';
import { getAuthUser } from '@/lib/server-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isValidUUID(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    const guestCookie = req.cookies.get('employr_guest_id')?.value;

    const userIds: string[] = [];
    if (user && isValidUUID(user.id)) {
      userIds.push(user.id);
    }
    if (guestCookie && isValidUUID(guestCookie) && !userIds.includes(guestCookie)) {
      userIds.push(guestCookie);
    }

    if (userIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    const records = await (prisma as any).ai_generation_history.findMany({
      where: {
        section_key: 'linkedin_analysis',
        user_id: userIds.length === 1 ? userIds[0] : { in: userIds },
      },
      orderBy: { created_at: 'desc' },
      take: 30,
    });

    const mapped = records.map((r: any) => {
      const opts = typeof r.options === 'object' && r.options !== null ? r.options : {};
      return {
        id: r.id,
        createdAt: r.created_at,
        title: r.section_title || `Optimasi ${r.target_job_title || 'LinkedIn'}`,
        targetRole: r.target_job_title || opts.targetRole || opts.evidenceBank?.targetRole || 'Professional',
        targetIndustry: r.goal || opts.evidenceBank?.targetIndustry || '',
        profileUrl: opts.profileUrl || r.input_text || '',
        overallScore: opts.overallScore || opts.analysisResult?.overallScore || 0,
        profileStatus: opts.analysisResult?.profileStatus || 'Audit Selesai',
        candidateName: opts.scrapedData?.name || '',
      };
    });

    return NextResponse.json({
      success: true,
      data: mapped,
    });
  } catch (error: any) {
    console.error('[GET /api/linkedin/history] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat riwayat analisis LinkedIn.', error: error?.message },
      { status: 500 }
    );
  }
}
