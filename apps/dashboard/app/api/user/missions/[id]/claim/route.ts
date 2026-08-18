import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cuti/db';
import { getAuthUser } from '@/lib/server-auth';
import crypto from 'crypto';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }

    const submission = await prisma.misi_submissions.findUnique({
      where: { user_id_misi_id: { user_id: user.id, misi_id: id } },
    });

    if (!submission) {
      return NextResponse.json(
        { success: false, message: 'Belum ada bukti pengerjaan untuk misi ini.' },
        { status: 404 }
      );
    }

    if (submission.status === 'PAID') {
      return NextResponse.json(
        { success: false, message: 'Reward misi ini sudah diklaim.' },
        { status: 409 }
      );
    }

    if (submission.status === 'REJECTED') {
      return NextResponse.json(
        { success: false, message: 'Pengajuan bukti ditolak oleh tim reviewer.' },
        { status: 409 }
      );
    }

    await prisma.$transaction([
      prisma.transactions.create({
        data: {
          id: crypto.randomUUID(),
          user_id: user.id,
          type: 'MISI_REWARD',
          amount: submission.payout_amount,
          status: 'SUCCESS',
          description: 'Reward Misi: klaim berhasil',
          created_at: new Date(),
        },
      }),
      prisma.misi_submissions.update({
        where: { id: submission.id },
        data: { status: 'PAID', paid_at: new Date() },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: { coinsAdded: submission.payout_amount, status: 'PAID' },
    });
  } catch (error: any) {
    console.error('[POST /api/user/missions/[id]/claim] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengklaim reward ke database.' },
      { status: 500 }
    );
  }
}
