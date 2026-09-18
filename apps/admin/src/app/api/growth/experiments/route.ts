import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@employr/db';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await prisma.growth_experiments.findMany({
      orderBy: { created_at: 'desc' },
      take: 100,
    });
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error('[GET /api/growth/experiments] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat eksperimen.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Auto-generate kode berurutan bila tidak dikirim
    let code = typeof body.code === 'string' && body.code.trim() ? body.code.trim() : '';
    if (!code) {
      const last = await prisma.growth_experiments.findFirst({
        orderBy: { created_at: 'desc' },
        select: { code: true },
      });
      const lastNum = last?.code ? parseInt(last.code.replace(/\D/g, ''), 10) || 0 : 0;
      code = `EXP-${String(lastNum + 1).padStart(3, '0')}`;
    }

    const created = await prisma.growth_experiments.create({
      data: {
        id: crypto.randomUUID(),
        code,
        hypothesis: body.hypothesis || '',
        variable_tested: body.variableTested || '',
        platform: body.platform || 'THREADS',
        kpi: body.kpi || 'CTR',
        status: 'RUNNING',
      },
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    console.error('[POST /api/growth/experiments] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat eksperimen.' },
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
    if (typeof body.status === 'string') {
      data.status = body.status;
      if (body.status === 'DONE' || body.status === 'KILLED') data.ended_at = new Date();
    }
    if (typeof body.decision === 'string') data.decision = body.decision;
    if (typeof body.result === 'string') data.result = body.result;
    if (typeof body.learning === 'string') data.learning = body.learning;
    if (typeof body.kpi === 'string') data.kpi = body.kpi;

    await prisma.growth_experiments.update({ where: { id: body.id }, data });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[PATCH /api/growth/experiments] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui eksperimen.' },
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
    await prisma.growth_experiments.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[DELETE /api/growth/experiments] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus eksperimen.' },
      { status: 500 }
    );
  }
}
