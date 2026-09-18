import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@employr/db';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await prisma.growth_journal.findMany({
      orderBy: { created_at: 'desc' },
      take: 60,
    });
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error('[GET /api/growth/journal] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat growth journal.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const created = await prisma.growth_journal.create({
      data: {
        id: crypto.randomUUID(),
        week_label: body.weekLabel || `Minggu ${Math.ceil(new Date().getDate() / 7)} - ${new Date().toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}`,
        wins: body.wins || null,
        failures: body.failures || null,
        learnings: body.learnings || null,
        next_tests: body.nextTests || null,
      },
    });
    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    console.error('[POST /api/growth/journal] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan journal.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, message: 'id wajib diisi.' }, { status: 400 });
    }
    const data: Record<string, any> = {};
    if (typeof body.wins === 'string') data.wins = body.wins;
    if (typeof body.failures === 'string') data.failures = body.failures;
    if (typeof body.learnings === 'string') data.learnings = body.learnings;
    if (typeof body.nextTests === 'string') data.next_tests = body.nextTests;

    await prisma.growth_journal.update({ where: { id: body.id }, data });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[PATCH /api/growth/journal] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui journal.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'id wajib diisi.' }, { status: 400 });
    }
    await prisma.growth_journal.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[DELETE /api/growth/journal] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus journal.' },
      { status: 500 }
    );
  }
}
