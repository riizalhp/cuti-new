import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@employr/db';
import { sendArticleNewsletterBlast } from '@/lib/newsletter-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status'); // 'active', 'inactive', or all

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status === 'active') {
      where.is_active = true;
    } else if (status === 'inactive') {
      where.is_active = false;
    }

    const [subscribers, total, activeCount, inactiveCount, campaigns] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: 100,
      }),
      prisma.newsletterSubscriber.count(),
      prisma.newsletterSubscriber.count({ where: { is_active: true } }),
      prisma.newsletterSubscriber.count({ where: { is_active: false } }),
      prisma.newsletterCampaign.findMany({
        orderBy: { created_at: 'desc' },
        take: 10,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        subscribers,
        stats: {
          total,
          active: activeCount,
          inactive: inactiveCount,
          totalCampaigns: campaigns.length,
        },
        recentCampaigns: campaigns,
      },
    });
  } catch (error: any) {
    console.error('[Admin Subscribers GET Error]:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat data subscriber.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, is_active } = body;

    if (!id || typeof is_active !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'ID dan status is_active wajib disertakan.' },
        { status: 400 }
      );
    }

    const updated = await prisma.newsletterSubscriber.update({
      where: { id },
      data: {
        is_active,
        unsubscribed_at: is_active ? null : new Date(),
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Status subscriber ${updated.email} berhasil diperbarui.`,
      data: updated,
    });
  } catch (error: any) {
    console.error('[Admin Subscribers PATCH Error]:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui subscriber.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID subscriber wajib diisi.' },
        { status: 400 }
      );
    }

    await prisma.newsletterSubscriber.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Subscriber berhasil dihapus.',
    });
  } catch (error: any) {
    console.error('[Admin Subscribers DELETE Error]:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus subscriber.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { article_id } = body;

    if (!article_id) {
      return NextResponse.json(
        { success: false, message: 'article_id wajib disertakan untuk manual blast.' },
        { status: 400 }
      );
    }

    const result = await sendArticleNewsletterBlast(article_id);

    return NextResponse.json({
      success: true,
      message: 'Pengiriman blast buletin selesai diproses.',
      result,
    });
  } catch (error: any) {
    console.error('[Admin Manual Blast Error]:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menjalankan blast buletin.' },
      { status: 500 }
    );
  }
}
