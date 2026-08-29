import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cuti/db';
import { getAuthUser } from '@/lib/server-auth';
import crypto from 'crypto';

function isValidUUID(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cvId, templateId = 'ats-modern', format = 'pdf', title = 'CV' } = body;

    const authUser = await getAuthUser(req);
    let resolvedUserId: string | null = null;

    if (authUser?.id && isValidUUID(authUser.id)) {
      resolvedUserId = authUser.id;
    } else {
      // Fallback to finding a valid user record from DB
      const dbUser = await prisma.user.findFirst({
        select: { id: true },
        orderBy: { created_at: 'asc' },
      });
      if (dbUser) {
        resolvedUserId = dbUser.id;
      }
    }

    if (!resolvedUserId) {
      return NextResponse.json(
        { success: false, message: 'Tidak dapat menemukan ID pengguna valid untuk audit log.' },
        { status: 400 }
      );
    }

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Browser';

    // 1. Record download event in audit_logs
    await prisma.audit_logs.create({
      data: {
        id: crypto.randomUUID(),
        user_id: resolvedUserId,
        action: 'CV_DOWNLOAD',
        entity: 'cv_template',
        entity_id: templateId,
        new_value: {
          template_id: templateId,
          format,
          cv_id: cvId || null,
          title,
          downloaded_at: new Date().toISOString(),
        },
        ip_address: ipAddress.substring(0, 45),
        user_agent: userAgent.substring(0, 512),
        severity: 'INFO',
        created_at: new Date(),
      },
    });

    // 2. If cvId is provided and is a valid UUID, update cv_projects metadata
    if (cvId && isValidUUID(cvId)) {
      try {
        const existingCv = await prisma.cv_projects.findUnique({
          where: { id: cvId },
          select: { data: true },
        });

        if (existingCv) {
          const currentData = (typeof existingCv.data === 'object' && existingCv.data !== null ? existingCv.data : {}) as Record<string, any>;
          const currentDownloads = typeof currentData.download_count === 'number' ? currentData.download_count : 0;
          await prisma.cv_projects.update({
            where: { id: cvId },
            data: {
              data: {
                ...currentData,
                download_count: currentDownloads + 1,
                last_downloaded_at: new Date().toISOString(),
              },
            },
          });
        }
      } catch (cvUpdateErr) {
        console.warn('[track-download] Warning updating cv_projects download count:', cvUpdateErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Download template CV berhasil dicatat.',
    });
  } catch (error: any) {
    console.error('[POST /api/cv/track-download] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mencatat unduhan template.' },
      { status: 500 }
    );
  }
}
