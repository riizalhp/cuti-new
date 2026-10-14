import { NextRequest, NextResponse } from 'next/server';
import { prisma, encryptSecret, decryptSecret } from '@employr/db';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/scraper-providers/[id] — Update data provider
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { label, api_key, priority, is_active, status, extra_config } = body;

    const existing = await prisma.scraper_providers.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Provider tidak ditemukan.' },
        { status: 404 }
      );
    }

    const dataToUpdate: any = {};
    if (label !== undefined) dataToUpdate.label = String(label).trim();
    if (api_key !== undefined) dataToUpdate.api_key = encryptSecret(String(api_key).trim());
    if (typeof priority === 'number') dataToUpdate.priority = priority;
    if (typeof is_active === 'boolean') dataToUpdate.is_active = is_active;
    if (status !== undefined) dataToUpdate.status = String(status);
    if (extra_config !== undefined) dataToUpdate.extra_config = extra_config;

    const updated = await prisma.scraper_providers.update({
      where: { id },
      data: dataToUpdate,
    });

    const plainKey = updated.api_key ? decryptSecret(updated.api_key) : "";
    const sanitized = {
      ...updated,
      api_key: plainKey ? `${plainKey.slice(0, 3)}••••••••${plainKey.slice(-4)}` : "••••••••",
    };

    return NextResponse.json({
      success: true,
      data: sanitized,
    });
  } catch (error: any) {
    console.error('[PUT /api/scraper-providers/[id]] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memperbarui provider scraper.' },
      { status: 500 }
    );
  }
}

// DELETE /api/scraper-providers/[id] — Hapus provider
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    await prisma.scraper_providers.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Provider scraper berhasil dihapus.',
    });
  } catch (error: any) {
    console.error('[DELETE /api/scraper-providers/[id]] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal menghapus provider scraper.' },
      { status: 500 }
    );
  }
}
