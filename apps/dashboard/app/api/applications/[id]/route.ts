import { NextRequest, NextResponse } from 'next/server';
import { prisma, ApplicationStatus } from '@cuti/db';
import { getAuthUser } from '@/lib/server-auth';
import { mapDbToUiStatus, mapUiToDbStatus } from '../route';
import crypto from 'crypto';

function formatIndonesianDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24 && now.getDate() === date.getDate()) {
    return 'Hari ini';
  } else if (diffHours < 48 && now.getDate() - date.getDate() === 1) {
    return 'Kemarin';
  }

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }

    const app = await prisma.applications.findFirst({
      where: { id, user_id: user.id },
      include: {
        application_notes: {
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!app) {
      return NextResponse.json(
        { success: false, message: 'Lamaran tidak ditemukan.' },
        { status: 404 }
      );
    }

    const insight = (typeof app.ai_insight === 'object' && app.ai_insight !== null ? app.ai_insight : {}) as Record<string, any>;
    const firstNote = app.application_notes?.[0]?.content || insight.notes || '';

    const mapped = {
      id: app.id,
      company: app.company_name,
      position: app.position,
      location: insight.location || 'Jakarta',
      appliedDate: formatIndonesianDate(app.applied_at),
      status: mapDbToUiStatus(app.status, insight.displayStatus),
      salary: insight.salary || '-',
      notes: firstNote,
      portal: insight.portal || 'Direct',
      portalUrl: app.job_url || insight.portalUrl || '',
      matchScore: app.match_score ?? 85,
      atsScore: app.ats_score ?? 88,
      interviewChance: app.interview_chance || 'MEDIUM',
    };

    return NextResponse.json({ success: true, data: mapped });
  } catch (error: any) {
    console.error('[GET /api/applications/[id]] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat detail lamaran.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }

    const existing = await prisma.applications.findFirst({
      where: { id, user_id: user.id },
      include: {
        application_notes: {
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Lamaran tidak ditemukan.' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const currentInsight = (typeof existing.ai_insight === 'object' && existing.ai_insight !== null
      ? existing.ai_insight
      : {}) as Record<string, any>;

    const updatedInsight = {
      ...currentInsight,
      ...(body.location !== undefined ? { location: body.location } : {}),
      ...(body.salary !== undefined ? { salary: body.salary } : {}),
      ...(body.portal !== undefined ? { portal: body.portal } : {}),
      ...(body.portalUrl !== undefined ? { portalUrl: body.portalUrl } : {}),
      ...(body.status !== undefined ? { displayStatus: body.status } : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
    };

    const newDbStatus = body.status ? mapUiToDbStatus(body.status) : existing.status;
    const newCompany = body.company || body.company_name || existing.company_name;
    const newPosition = body.position || existing.position;
    const newJobUrl = body.portalUrl !== undefined ? body.portalUrl : (body.job_url !== undefined ? body.job_url : existing.job_url);

    const updated = await prisma.applications.update({
      where: { id },
      data: {
        company_name: newCompany,
        position: newPosition,
        job_url: newJobUrl,
        status: newDbStatus,
        ai_insight: updatedInsight,
        updated_at: new Date(),
      },
    });

    if (body.notes !== undefined && typeof body.notes === 'string') {
      const existingNote = existing.application_notes?.[0];
      if (existingNote) {
        await prisma.application_notes.update({
          where: { id: existingNote.id },
          data: { content: body.notes },
        });
      } else if (body.notes.trim()) {
        await prisma.application_notes.create({
          data: {
            id: crypto.randomUUID(),
            application_id: id,
            user_id: user.id,
            content: body.notes.trim(),
          },
        });
      }
    }

    const mapped = {
      id: updated.id,
      company: updated.company_name,
      position: updated.position,
      location: updatedInsight.location || 'Jakarta',
      appliedDate: formatIndonesianDate(updated.applied_at),
      status: mapDbToUiStatus(updated.status, updatedInsight.displayStatus),
      salary: updatedInsight.salary || '-',
      notes: body.notes !== undefined ? body.notes : (existing.application_notes?.[0]?.content || updatedInsight.notes || ''),
      portal: updatedInsight.portal || 'Direct',
      portalUrl: updated.job_url || updatedInsight.portalUrl || '',
      matchScore: updated.match_score ?? 85,
      atsScore: updated.ats_score ?? 88,
    };

    return NextResponse.json({ success: true, data: mapped });
  } catch (error: any) {
    console.error('[PATCH /api/applications/[id]] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Lamaran belum tersimpan. Periksa koneksi internet Anda.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PATCH(req, context);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }

    const existing = await prisma.applications.findFirst({
      where: { id, user_id: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Lamaran tidak ditemukan.' },
        { status: 404 }
      );
    }

    await prisma.applications.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Lamaran berhasil dihapus dari database.',
    });
  } catch (error: any) {
    console.error('[DELETE /api/applications/[id]] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus lamaran dari database.' },
      { status: 500 }
    );
  }
}
