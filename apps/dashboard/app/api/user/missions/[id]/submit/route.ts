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

    const misi = await prisma.misi.findUnique({ where: { id } });
    if (!misi) {
      return NextResponse.json(
        { success: false, message: 'Misi tidak ditemukan.' },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const proofLink = typeof body.proofLink === 'string' ? body.proofLink.trim() : '';
    const proofNotes = typeof body.proofNotes === 'string' ? body.proofNotes.trim() : '';
    const screenshotName = typeof body.screenshotName === 'string' ? body.screenshotName.trim() : '';

    const proofData = proofLink || screenshotName || proofNotes || 'Bukti dikirim melalui dashboard Employr';

    const now = new Date();
    const existing = await prisma.misi_submissions.findUnique({
      where: { user_id_misi_id: { user_id: user.id, misi_id: misi.id } },
    });

    if (!existing) {
      await prisma.$transaction([
        prisma.misi_submissions.create({
          data: {
            id: crypto.randomUUID(),
            user_id: user.id,
            misi_id: misi.id,
            proof_data: proofData,
            status: 'REVIEWING',
            payout_amount: misi.reward_amount,
            submitted_at: now,
          },
        }),
        prisma.misi.update({
          where: { id: misi.id },
          data: { current_submissions: { increment: 1 } },
        }),
      ]);
    } else {
      await prisma.misi_submissions.update({
        where: { id: existing.id },
        data: {
          proof_data: proofData,
          status: 'REVIEWING',
          submitted_at: now,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: { status: 'REVIEWING', submittedAt: now.toISOString() },
    });
  } catch (error: any) {
    console.error('[POST /api/user/missions/[id]/submit] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan bukti pengerjaan ke database.' },
      { status: 500 }
    );
  }
}
