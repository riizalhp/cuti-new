import { NextRequest, NextResponse } from 'next/server';
import { prisma, encryptSecret, decryptSecret } from '@employr/db';

export const dynamic = 'force-dynamic';

// GET /api/scraper-providers — Ambil semua provider scraper urut berdasarkan priority
export async function GET() {
  try {
    const providers = await prisma.scraper_providers.findMany({
      orderBy: [{ priority: 'asc' }, { created_at: 'asc' }],
    });

    const sanitized = providers.map((p) => {
      const plainKey = p.api_key ? decryptSecret(p.api_key) : "";
      return {
        ...p,
        api_key: plainKey ? `${plainKey.slice(0, 3)}••••••••${plainKey.slice(-4)}` : "••••••••",
      };
    });

    return NextResponse.json({
      success: true,
      data: sanitized,
    });
  } catch (error: any) {
    console.error('[GET /api/scraper-providers] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memuat provider scraper.' },
      { status: 500 }
    );
  }
}

// POST /api/scraper-providers — Tambah provider scraper baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, label, api_key, priority, is_active, extra_config } = body;

    if (!provider || !label || !api_key) {
      return NextResponse.json(
        { success: false, error: 'Provider, label, dan API key wajib diisi.' },
        { status: 400 }
      );
    }

    // Default priority ke urutan terakhir jika tidak ditentukan
    let assignedPriority = typeof priority === 'number' ? priority : 1;
    if (typeof priority !== 'number') {
      const maxPriority = await prisma.scraper_providers.aggregate({
        _max: { priority: true },
      });
      assignedPriority = (maxPriority._max.priority || 0) + 1;
    }

    const created = await prisma.scraper_providers.create({
      data: {
        provider: String(provider).toLowerCase().trim(),
        label: String(label).trim(),
        api_key: encryptSecret(String(api_key).trim()),
        priority: assignedPriority,
        is_active: typeof is_active === 'boolean' ? is_active : true,
        extra_config: extra_config || {},
        status: 'active',
      },
    });

    return NextResponse.json({
      success: true,
      data: created,
    });
  } catch (error: any) {
    console.error('[POST /api/scraper-providers] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal menambahkan provider scraper.' },
      { status: 500 }
    );
  }
}
