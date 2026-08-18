import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cuti/db';
import { getAuthUser } from '@/lib/server-auth';
import crypto from 'crypto';

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

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const packageTypeStr = (body.packageId || 'pro').toUpperCase();
    const packageEnum = packageTypeStr === 'STARTER' || packageTypeStr === 'BASIC'
      ? 'BASIC'
      : (packageTypeStr === 'EXPERT' || packageTypeStr === 'PREMIUM' ? 'PREMIUM' : 'PRO');

    const orderNumber = `ORD-AICV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const basePrice = body.price || (packageEnum === 'BASIC' ? 19000 : (packageEnum === 'PREMIUM' ? 99000 : 59000));
    const discount = body.discount || 0;
    const totalPrice = Math.max(0, basePrice - discount);

    const newOrder = await prisma.orders.create({
      data: {
        id: crypto.randomUUID(),
        user_id: user.id,
        order_number: orderNumber,
        package: packageEnum,
        base_price: basePrice,
        discount,
        total_price: totalPrice,
        status: 'PROCESSING',
        payment_method: body.paymentMethod || 'QRIS Instant',
        has_express: body.hasExpress || false,
        paid_at: new Date(),
        processing_started_at: new Date(),
      },
    });

    const packageNameMap: Record<string, string> = {
      BASIC: 'Paket CV Siap Lamar',
      PRO: 'Paket Pro & Expert HR',
      PREMIUM: 'Paket Siap Kerja Expert',
    };

    const mappedOrder = {
      orderId: newOrder.order_number,
      packageId: newOrder.package.toLowerCase(),
      packageName: packageNameMap[newOrder.package] || 'Paket Pro & Expert HR',
      price: newOrder.total_price,
      paymentMethod: newOrder.payment_method || 'QRIS Instant',
      status: 'hr_review',
      progress: 75,
      createdAt: formatIndonesianDateTime(newOrder.created_at),
      estimatedTime: '15-20 Menit Lagi',
      dataOption: body.dataOption || 'existing',
      hrName: 'Sarah Melati, S.Psi',
      hrRole: 'Senior Tech Recruiter CUTI',
    };

    return NextResponse.json({ success: true, data: mappedOrder });
  } catch (error: any) {
    console.error('[POST /api/orders] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat pesanan layanan CV.' },
      { status: 500 }
    );
  }
}
