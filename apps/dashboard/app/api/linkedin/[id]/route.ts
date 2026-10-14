import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@employr/db';
import { getAuthUser } from '@/lib/server-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { buildLinkedInAuditSlug } from '@/lib/linkedin-slug';

function isValidUUID(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

function isShortHex(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{6,8}$/i.test(str);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || (!isValidUUID(id) && !isShortHex(id))) {
      return NextResponse.json(
        { success: false, message: 'Format ID analisis tidak valid.' },
        { status: 400 }
      );
    }

    let record: any = null;
    if (isValidUUID(id)) {
      record = await (prisma as any).ai_generation_history.findUnique({
        where: { id },
      });
    } else {
      // Lookup by prefix ID
      const results: any[] = await (prisma as any).$queryRaw`
        SELECT * FROM ai_generation_history
        WHERE section_key = 'linkedin_analysis'
          AND id::text LIKE ${id.toLowerCase() + '%'}
        ORDER BY created_at DESC
        LIMIT 1
      `;
      record = results && results.length > 0 ? results[0] : null;
    }

    if (!record || record.section_key !== 'linkedin_analysis') {
      return NextResponse.json(
        { success: false, message: 'Hasil analisis profil LinkedIn tidak ditemukan.' },
        { status: 404 }
      );
    }

    const rawOptions = typeof record.options === 'object' && record.options !== null
      ? record.options
      : {};

    const resolvedRole = record.target_job_title || rawOptions.targetRole || 'Professional';
    const resolvedName = rawOptions.profileUrl || rawOptions.scrapedData?.name || rawOptions.evidenceBank?.fullName || record.input_text || '';
    const { roleSlug, nameSlug, fullSlug, auditPath } = buildLinkedInAuditSlug(
      resolvedRole,
      resolvedName
    );

    const formattedData = {
      id: record.id,
      userId: record.user_id,
      createdAt: record.created_at,
      sectionTitle: record.section_title,
      targetRole: resolvedRole,
      targetIndustry: record.goal || '',
      profileUrl: rawOptions.profileUrl || record.input_text || '',
      overallScore: rawOptions.overallScore || rawOptions.analysisResult?.overallScore || 0,
      analysisResult: rawOptions.analysisResult || null,
      scrapedData: rawOptions.scrapedData || null,
      evidenceBank: rawOptions.evidenceBank || null,
      checklist: rawOptions.checklist || null,
      roleSlug,
      nameSlug,
      slug: rawOptions.slug || fullSlug,
      auditPath: rawOptions.auditPath || auditPath,
    };

    return NextResponse.json({
      success: true,
      data: formattedData,
    });
  } catch (error: any) {
    console.error('[GET /api/linkedin/[id]] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data analisis LinkedIn.', error: error?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || (!isValidUUID(id) && !isShortHex(id))) {
      return NextResponse.json(
        { success: false, message: 'ID tidak valid.' },
        { status: 400 }
      );
    }

    const user = await getAuthUser(req);
    const guestCookie = req.cookies.get('employr_guest_id')?.value;

    let existing: any = null;
    if (isValidUUID(id)) {
      existing = await (prisma as any).ai_generation_history.findUnique({
        where: { id },
        select: { id: true, user_id: true },
      });
    } else {
      const results: any[] = await (prisma as any).$queryRaw`
        SELECT id, user_id FROM ai_generation_history
        WHERE section_key = 'linkedin_analysis'
          AND id::text LIKE ${id.toLowerCase() + '%'}
        ORDER BY created_at DESC
        LIMIT 1
      `;
      existing = results && results.length > 0 ? results[0] : null;
    }

    if (!existing) {
      return NextResponse.json({ success: true, message: 'Data sudah dihapus.' });
    }

    // Hanya pemilik (atau guest pembuat) yang bisa menghapus jika teridentifikasi
    if (user && existing.user_id && existing.user_id !== user.id && user.role !== 'ADMIN') {
      if (!guestCookie || existing.user_id !== guestCookie) {
        return NextResponse.json(
          { success: false, message: 'Anda tidak memiliki akses untuk menghapus data ini.' },
          { status: 403 }
        );
      }
    }

    await (prisma as any).ai_generation_history.delete({
      where: { id: existing.id },
      select: { id: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Analisis LinkedIn berhasil dihapus.',
    });
  } catch (error: any) {
    console.error('[DELETE /api/linkedin/[id]] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus data.', error: error?.message },
      { status: 500 }
    );
  }
}
