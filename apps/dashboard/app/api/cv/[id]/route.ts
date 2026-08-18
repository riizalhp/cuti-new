import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cuti/db';
import { getAuthUser } from '@/lib/server-auth';

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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }

    const cv = await prisma.cv_projects.findFirst({
      where: { id, user_id: user.id, is_active: true },
    });

    if (!cv) {
      return NextResponse.json(
        { success: false, message: 'CV tidak ditemukan.' },
        { status: 404 }
      );
    }

    const parsedData = (typeof cv.data === 'object' && cv.data !== null ? cv.data : {}) as Record<string, any>;
    const mapped = {
      ...parsedData,
      id: cv.id,
      title: cv.title || parsedData.title,
      templateId: cv.template_id || parsedData.templateId || 'ats-modern-standard',
      atsScore: parsedData.atsScore ?? 85,
      headline: cv.target_position || parsedData.headline,
      updatedAt: formatIndonesianDate(cv.updated_at),
    };

    return NextResponse.json({ success: true, data: mapped });
  } catch (error: any) {
    console.error('[GET /api/cv/:id] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat memuat CV.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const existing = await prisma.cv_projects.findFirst({
      where: { id, user_id: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'CV tidak ditemukan.' },
        { status: 404 }
      );
    }

    const title = body.title || existing.title;
    const templateId = body.templateId || existing.template_id;
    const targetPosition = body.headline || body.target_position || existing.target_position;

    const fullCvData = {
      ...body,
      id,
      updatedAt: 'Hari ini',
    };

    const updated = await prisma.cv_projects.update({
      where: { id },
      data: {
        title,
        template_id: templateId,
        target_position: targetPosition,
        data: fullCvData,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...fullCvData,
        id: updated.id,
        updatedAt: 'Hari ini',
      },
    });
  } catch (error: any) {
    console.error('[PATCH /api/cv/:id] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui CV di database.' },
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
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }

    const existing = await prisma.cv_projects.findFirst({
      where: { id, user_id: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'CV tidak ditemukan.' },
        { status: 404 }
      );
    }

    await prisma.cv_projects.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'CV berhasil dihapus.' });
  } catch (error: any) {
    console.error('[DELETE /api/cv/:id] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus CV dari database.' },
      { status: 500 }
    );
  }
}
