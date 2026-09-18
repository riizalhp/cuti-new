import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@employr/db';
import { getAuthUser } from '@/lib/server-auth';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: true, data: [] });
    }

    const rows = await prisma.cover_letters.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' },
      take: 100,
    });

    const data = rows.map((r) => ({
      id: r.id,
      company: r.company,
      position: r.position,
      recruiter: r.recruiter || '',
      tone: r.tone || '',
      content: r.content,
      date: new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      createdAt: r.created_at,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[GET /api/cover-letters] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat surat lamaran tersimpan.' },
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

    const body = await req.json().catch(() => null);
    if (!body || typeof body.content !== 'string' || !body.content.trim()) {
      return NextResponse.json(
        { success: false, message: 'Isi surat lamaran wajib diisi.' },
        { status: 400 }
      );
    }

    const created = await prisma.cover_letters.create({
      data: {
        id: crypto.randomUUID(),
        user_id: user.id,
        company: typeof body.company === 'string' && body.company.trim() ? body.company.trim() : 'Perusahaan Target',
        position: typeof body.position === 'string' && body.position.trim() ? body.position.trim() : 'Posisi Pekerjaan',
        recruiter: typeof body.recruiter === 'string' && body.recruiter.trim() ? body.recruiter.trim() : null,
        tone: typeof body.tone === 'string' && body.tone.trim() ? body.tone.trim() : null,
        content: body.content.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: created.id,
        company: created.company,
        position: created.position,
        content: created.content,
        date: new Date(created.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      },
    });
  } catch (error: any) {
    console.error('[POST /api/cover-letters] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan surat lamaran.' },
      { status: 500 }
    );
  }
}
