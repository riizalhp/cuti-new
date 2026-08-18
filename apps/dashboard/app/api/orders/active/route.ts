import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cuti/db';
import { getAuthUser } from '@/lib/server-auth';

function formatIndonesianDateTime(date: Date): string {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: true, data: null });
    }

    const order = await prisma.orders.findFirst({
      where: {
        user_id: user.id,
        status: {
          in: ['SUBMITTED', 'WAITING_PAYMENT', 'PAID', 'PROCESSING', 'READY'],
        },
      },
      orderBy: { created_at: 'desc' },
    });

    if (!order) {
      return NextResponse.json({ success: true, data: null });
    }

    const packageNameMap: Record<string, string> = {
      BASIC: 'Paket CV Siap Lamar',
      PRO: 'Paket Pro & Expert HR',
      PREMIUM: 'Paket Siap Kerja Expert',
    };

    const isProcessing = order.status === 'PROCESSING';
    const isReady = order.status === 'READY';
    const progress = isReady ? 100 : (isProcessing ? 75 : 40);
    const estimatedTime = isReady ? 'Siap Diunduh' : (isProcessing ? '15-20 Menit Lagi' : '1 Jam');

    const mappedOrder = {
      orderId: order.order_number,
      packageId: order.package.toLowerCase(),
      packageName: packageNameMap[order.package] || 'Paket Pro & Expert HR',
      price: order.total_price,
      paymentMethod: order.payment_method || 'QRIS Instant',
      status: isReady ? 'completed' : (isProcessing ? 'hr_review' : 'submitted'),
      progress,
      createdAt: formatIndonesianDateTime(order.created_at),
      estimatedTime,
      dataOption: 'existing',
      hrName: 'Sarah Melati, S.Psi',
      hrRole: 'Senior Tech Recruiter CUTI',
    };

    return NextResponse.json({ success: true, data: mappedOrder });
  } catch (error: any) {
    console.error('[GET /api/orders/active] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat status order aktif.' },
      { status: 500 }
    );
  }
}
