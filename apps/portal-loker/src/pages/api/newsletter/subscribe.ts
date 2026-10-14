import type { APIRoute } from 'astro';
import { prisma } from '../../../lib/prisma';
import crypto from 'node:crypto';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const email = body?.email && typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const name = body?.name && typeof body.name === 'string' ? body.name.trim() : null;
    const source = body?.source && typeof body.source === 'string' ? body.source.trim() : 'PORTAL_LOKER';

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, message: 'Alamat email wajib diisi.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, message: 'Format alamat email tidak valid.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      if (!existing.is_active) {
        await prisma.newsletterSubscriber.update({
          where: { id: existing.id },
          data: {
            is_active: true,
            unsubscribed_at: null,
            source,
            updated_at: new Date(),
          },
        });
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Langganan buletin karier kamu telah diaktifkan kembali!',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          alreadySubscribed: true,
          message: 'Email kamu sudah terdaftar di buletin karier Employr.',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = crypto.randomUUID();
    await prisma.newsletterSubscriber.create({
      data: {
        id: crypto.randomUUID(),
        email,
        name,
        source,
        is_active: true,
        token,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Berhasil mendaftar buletin! Paket template dan panduan karier siap dikirim.',
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[Portal Loker Newsletter Subscribe Error]:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Terjadi kendala saat memproses pendaftaran.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
