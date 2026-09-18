import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@employr/db';
import { getAuthUser } from '@/lib/server-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isValidUUID(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || !isValidUUID(id)) {
      return NextResponse.json(
        { success: false, message: 'Format ID analisis tidak valid.' },
        { status: 400 }
      );
    }

    const record = await (prisma as any).ai_generation_history.findUnique({
      where: { id },
    });

    if (!record || record.section_key !== 'linkedin_analysis') {
      return NextResponse.json(
        { success: false, message: 'Hasil analisis profil LinkedIn tidak ditemukan.' },
        { status: 404 }
      );
    }

    const rawOptions = typeof record.options === 'object' && record.options !== null
      ? record.options
      : {};

    const formattedData = {
      id: record.id,
      userId: record.user_id,
      createdAt: record.created_at,
      sectionTitle: record.section_title,
      targetRole: record.target_job_title || 'Professional',
      targetIndustry: record.goal || '',
      profileUrl: rawOptions.profileUrl || record.input_text || '',
      overallScore: rawOptions.overallScore || rawOptions.analysisResult?.overallScore || 0,
      analysisResult: rawOptions.analysisResult || null,
      scrapedData: rawOptions.scrapedData || null,
      evidenceBank: rawOptions.evidenceBank || null,
      checklist: rawOptions.checklist || null,
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

    if (!id || !isValidUUID(id)) {
      return NextResponse.json(
        { success: false, message: 'ID tidak valid.' },
        { status: 400 }
      );
    }

    const user = await getAuthUser(req);
    const guestCookie = req.cookies.get('employr_guest_id')?.value;

    const existing = await (prisma as any).ai_generation_history.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ success: true, message: 'Data sudah dihapus.' });
    }

    // Hanya pemilik (atau guest pembuat) yang bisa menghapus jika teridentifikasi
    if (user && existing.user_id !== user.id && user.role !== 'ADMIN') {
      if (!guestCookie || existing.user_id !== guestCookie) {
        return NextResponse.json(
          { success: false, message: 'Anda tidak memiliki akses untuk menghapus data ini.' },
          { status: 403 }
        );
      }
    }

    await (prisma as any).ai_generation_history.delete({
      where: { id },
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
