import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@employr/db';
import { getAuthUser } from '@/lib/server-auth';

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

    const existing = await prisma.cover_letters.findFirst({
      where: { id, user_id: user.id },
    });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Surat lamaran tidak ditemukan.' },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => null);
    const data: Record<string, any> = {};
    if (typeof body?.company === 'string' && body.company.trim()) data.company = body.company.trim();
    if (typeof body?.position === 'string' && body.position.trim()) data.position = body.position.trim();
    if (typeof body?.recruiter === 'string') data.recruiter = body.recruiter.trim() || null;
    if (typeof body?.content === 'string' && body.content.trim()) data.content = body.content.trim();

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, message: 'Tidak ada perubahan yang dikirim.' },
        { status: 400 }
      );
    }

    const updated = await prisma.cover_letters.update({ where: { id }, data });

    return NextResponse.json({
      success: true,
      data: { id: updated.id, company: updated.company, position: updated.position },
    });
  } catch (error: any) {
    console.error('[PATCH /api/cover-letters/[id]] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui surat lamaran.' },
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

    // Guard: hanya milik user sendiri
    const existing = await prisma.cover_letters.findFirst({
      where: { id, user_id: user.id },
    });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Surat lamaran tidak ditemukan.' },
        { status: 404 }
      );
    }

    await prisma.cover_letters.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[DELETE /api/cover-letters/[id]] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus surat lamaran.' },
      { status: 500 }
    );
  }
}
