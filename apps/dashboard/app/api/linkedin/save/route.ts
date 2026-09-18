import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@employr/db';
import { getAuthUser } from '@/lib/server-auth';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isValidUUID(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    let guestCookie = req.cookies.get('employr_guest_id')?.value;
    let isNewGuestCookie = false;

    let userId: string;
    if (user && isValidUUID(user.id)) {
      userId = user.id;
    } else if (guestCookie && isValidUUID(guestCookie)) {
      userId = guestCookie;
    } else {
      userId = crypto.randomUUID();
      guestCookie = userId;
      isNewGuestCookie = true;
    }

    const body = await req.json();
    const {
      id,
      profileUrl,
      targetRole,
      overallScore,
      analysisResult,
      scrapedData,
      evidenceBank,
      checklist,
    } = body;

    if (!analysisResult) {
      return NextResponse.json(
        { success: false, message: 'Data hasil analisis tidak ditemukan.' },
        { status: 400 }
      );
    }

    const recordId = id && isValidUUID(id) ? id : crypto.randomUUID();
    const resolvedRole = targetRole || evidenceBank?.targetRole || scrapedData?.headline || 'Professional';
    const resolvedIndustry = evidenceBank?.targetIndustry || scrapedData?.location || 'Indonesia';
    const finalScore = overallScore || analysisResult.overallScore || 0;

    const payloadOptions = {
      overallScore: finalScore,
      analysisResult,
      scrapedData: scrapedData || null,
      evidenceBank: evidenceBank || null,
      checklist: checklist || null,
      profileUrl: profileUrl || '',
    };

    const savedRecord = await (prisma as any).ai_generation_history.upsert({
      where: { id: recordId },
      create: {
        id: recordId,
        user_id: userId,
        section_key: 'linkedin_analysis',
        section_title: `Optimasi LinkedIn - ${resolvedRole}`,
        target_job_title: resolvedRole,
        goal: resolvedIndustry,
        formula: 'asean_ahead',
        input_text: profileUrl || resolvedRole,
        options: payloadOptions,
        created_at: new Date(),
      },
      update: {
        section_title: `Optimasi LinkedIn - ${resolvedRole}`,
        target_job_title: resolvedRole,
        goal: resolvedIndustry,
        input_text: profileUrl || resolvedRole,
        options: payloadOptions,
      },
    });

    const response = NextResponse.json({
      success: true,
      id: savedRecord.id,
      message: 'Hasil analisis profil LinkedIn berhasil disimpan.',
      data: {
        id: savedRecord.id,
        createdAt: savedRecord.created_at,
      },
    });

    if (isNewGuestCookie && guestCookie) {
      response.cookies.set('employr_guest_id', guestCookie, {
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }

    return response;
  } catch (error: any) {
    console.error('[POST /api/linkedin/save] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal menyimpan hasil analisis LinkedIn.',
        error: error?.message,
      },
      { status: 500 }
    );
  }
}
