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

    // Deterministic Server-Side Pricing (Business Rules & PRD)
    // Never trust client-submitted prices or arbitrary discounts
    const OFFICIAL_PRICES: Record<string, number> = {
      BASIC: 19000,
      PRO: 59000,
      PREMIUM: 99000,
    };

    let basePrice = OFFICIAL_PRICES[packageEnum] || 59000;

    // Check dynamic system settings override if exists
    try {
      const settingKey = `price_${packageEnum.toLowerCase()}`;
      const setting = await prisma.system_settings.findFirst({
        where: { key: settingKey },
      });
      if (setting && setting.value) {
        const parsed = parseInt(String(setting.value), 10);
        if (!isNaN(parsed) && parsed > 0) basePrice = parsed;
      }
    } catch {
      // Fallback to official price
    }

    const discount = 0; // Discount calculation must only come from server-verified vouchers
    const totalPrice = basePrice - discount;

    const orderNumber = `ORD-AICV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = await prisma.orders.create({
      data: {
        id: crypto.randomUUID(),
        user_id: user.id,
        order_number: orderNumber,
        package: packageEnum,
        base_price: basePrice,
        discount,
        total_price: totalPrice,
        status: 'WAITING_PAYMENT',
        payment_method: typeof body.paymentMethod === 'string' ? body.paymentMethod : 'QRIS Instant',
        has_express: Boolean(body.hasExpress),
        paid_at: null,
        processing_started_at: null,
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
