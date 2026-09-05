import { NextRequest, NextResponse } from 'next/server';
import { prisma, logSecurityEvent, logApp, extractRequestContext } from '@cuti/db';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const ctx = extractRequestContext(req);

  try {
    const body = await req.json();
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
    } = body;

    if (!order_id || !status_code || !gross_amount || !signature_key) {
      return NextResponse.json(
        { success: false, message: 'Data webhook tidak lengkap.' },
        { status: 400 }
      );
    }

    // 1. Verify Midtrans Signature Key
    // Formula: SHA512(order_id + status_code + gross_amount + ServerKey)
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    if (!serverKey) {
      console.warn('[Midtrans Webhook] MIDTRANS_SERVER_KEY is not configured in environment.');
    }

    const payloadToHash = `${order_id}${status_code}${gross_amount}${serverKey}`;
    const expectedSignature = crypto
      .createHash('sha512')
      .update(payloadToHash)
      .digest('hex');

    // If serverKey is configured, enforce strict signature verification
    if (serverKey && signature_key !== expectedSignature) {
      logSecurityEvent({
        eventType: 'UNAUTHORIZED_ACCESS',
        ip: ctx.ip,
        userAgent: ctx.userAgent,
        severity: 'CRITICAL',
        details: {
          reason: 'invalid_midtrans_signature',
          order_id,
          received_signature: signature_key,
        },
      });

      return NextResponse.json(
        { success: false, message: 'Invalid Midtrans signature key.' },
        { status: 401 }
      );
    }

    // 2. Lookup Order in PostgreSQL
    const order = await prisma.orders.findFirst({
      where: { order_number: order_id },
      include: { users: true },
    });

    if (!order) {
      logApp({
        source: 'PAYMENT',
        level: 'WARNING',
        message: `Midtrans webhook order not found: ${order_id}`,
        ip: ctx.ip,
      });

      return NextResponse.json(
        { success: false, message: 'Order tidak ditemukan.' },
        { status: 404 }
      );
    }

    // 3. Idempotency Check: Don't process already finalized orders
    if (order.status === 'PAID' || order.status === 'COMPLETED' || (order.status === 'PROCESSING' && order.paid_at)) {
      return NextResponse.json({
        success: true,
        message: 'Order sudah diproses sebelumnya (idempotent).',
      });
    }

    // 4. Evaluate Payment Status
    const isPaid =
      (transaction_status === 'capture' && fraud_status === 'accept') ||
      transaction_status === 'settlement';

    const isFailed =
      transaction_status === 'cancel' ||
      transaction_status === 'deny' ||
      transaction_status === 'expire';

    const now = new Date();

    if (isPaid) {
      // Map package to membership tier: BASIC, PRO, PREMIUM
      let tier: 'BASIC' | 'PRO' | 'PREMIUM' = 'PRO';
      if (order.package === 'BASIC') tier = 'BASIC';
      if (order.package === 'PREMIUM') tier = 'PREMIUM';

      await prisma.$transaction([
        prisma.orders.update({
          where: { id: order.id },
          data: {
            status: 'PROCESSING',
            paid_at: now,
            processing_started_at: now,
            payment_method: payment_type || order.payment_method || 'Midtrans',
          },
        }),
        prisma.membership.upsert({
          where: { user_id: order.user_id },
          update: {
            tier,
            package_name: `Paket ${order.package}`,
            is_lifetime: true,
            is_active: true,
            order_id: order.id,
            activated_at: now,
          },
          create: {
            id: crypto.randomUUID(),
            user_id: order.user_id,
            tier,
            package_name: `Paket ${order.package}`,
            is_lifetime: true,
            is_active: true,
            order_id: order.id,
            activated_at: now,
          },
        }),
        prisma.transactions.create({
          data: {
            id: crypto.randomUUID(),
            user_id: order.user_id,
            amount: order.total_price,
            type: 'MEMBERSHIP',
            status: 'SUCCESS',
            description: `Aktivasi Membership Lifetime ${order.package} via Midtrans`,
            payment_order_id: order.id,
            created_at: now,
          },
        }),
      ]);

      logApp({
        source: 'PAYMENT',
        level: 'INFO',
        message: `Payment successful for order ${order_id} (User: ${order.user_id}, Tier: ${tier})`,
        ip: ctx.ip,
        userId: order.user_id,
      });

      return NextResponse.json({
        success: true,
        message: 'Pembayaran berhasil diverifikasi dan keanggotaan aktif.',
      });
    }

    if (isFailed) {
      await prisma.orders.update({
        where: { id: order.id },
        data: {
          status: 'CANCELLED',
        },
      });

      logApp({
        source: 'PAYMENT',
        level: 'INFO',
        message: `Payment failed/expired for order ${order_id}`,
        ip: ctx.ip,
        userId: order.user_id,
      });

      return NextResponse.json({
        success: true,
        message: 'Status pembayaran diperbarui menjadi gagal/kadaluarsa.',
      });
    }

    return NextResponse.json({
      success: true,
      message: `Status transaksi dicatat: ${transaction_status}`,
    });
  } catch (error: any) {
    console.error('[Midtrans Webhook Error]:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem memproses webhook.' },
      { status: 500 }
    );
  }
}
