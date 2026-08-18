import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cuti/db';
import { getAuthUser } from '@/lib/server-auth';
import crypto from 'crypto';

const CHECKIN_AMOUNT = 1000;
const CHECKIN_DESCRIPTION = 'Bonus Check-in Harian';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const existing = await prisma.transactions.findFirst({
      where: {
        user_id: user.id,
        type: 'TOPUP',
        description: CHECKIN_DESCRIPTION,
        created_at: { gte: startOfToday },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Kamu sudah melakukan check-in hari ini.' },
        { status: 409 }
      );
    }

    await prisma.transactions.create({
      data: {
        id: crypto.randomUUID(),
        user_id: user.id,
        type: 'TOPUP',
        amount: CHECKIN_AMOUNT,
        status: 'SUCCESS',
        description: CHECKIN_DESCRIPTION,
        created_at: now,
      },
    });

    return NextResponse.json({
      success: true,
      data: { coinsAdded: CHECKIN_AMOUNT, checkedInToday: true },
    });
  } catch (error: any) {
    console.error('[POST /api/user/checkin] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan check-in ke database.' },
      { status: 500 }
    );
  }
}
