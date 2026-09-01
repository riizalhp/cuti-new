import { NextRequest, NextResponse } from 'next/server';
import { prisma, ApplicationStatus } from '@cuti/db';
import { getAuthUser } from '@/lib/server-auth';
import crypto from 'crypto';

function isValidUUID(str: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

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

export function mapDbToUiStatus(status: ApplicationStatus, displayStatus?: string): 'Terkirim' | 'Screening' | 'Interview' | 'Offering' | 'Ditolak' {
  if (displayStatus && ['Terkirim', 'Screening', 'Interview', 'Offering', 'Ditolak'].includes(displayStatus)) {
    return displayStatus as any;
  }
  switch (status) {
    case ApplicationStatus.APPLIED:
      return 'Terkirim';
    case ApplicationStatus.INTERVIEW:
      return 'Interview';
    case ApplicationStatus.OFFERING:
      return 'Offering';
    case ApplicationStatus.REJECTED:
      return 'Ditolak';
    case ApplicationStatus.ACCEPTED:
      return 'Offering';
    default:
      return 'Terkirim';
  }
}

export function mapUiToDbStatus(uiStatus: string): ApplicationStatus {
  switch (uiStatus) {
    case 'Screening':
    case 'Terkirim':
      return ApplicationStatus.APPLIED;
    case 'Interview':
      return ApplicationStatus.INTERVIEW;
    case 'Offering':
      return ApplicationStatus.OFFERING;
    case 'Ditolak':
      return ApplicationStatus.REJECTED;
    case 'Diterima':
      return ApplicationStatus.ACCEPTED;
    default:
      return ApplicationStatus.APPLIED;
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }

    let apps = await prisma.applications.findMany({
      where: { user_id: user.id },
      include: {
        application_notes: {
          orderBy: { created_at: 'desc' },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const mapped = apps.map((app) => {
      const insight = (typeof app.ai_insight === 'object' && app.ai_insight !== null ? app.ai_insight : {}) as Record<string, any>;
      const firstNote = app.application_notes?.[0]?.content || insight.notes || '';
      return {
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
        matchScore: app.match_score ?? 0,
        atsScore: app.ats_score ?? 0,
        interviewChance: app.interview_chance || 'MEDIUM',
      };
    });

    return NextResponse.json({ success: true, data: mapped });
  } catch (error: any) {
    console.error('[GET /api/applications] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat data lamaran dari database.' },
      { status: 500 }
    );
  }
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
    const company = body.company || body.company_name;
    const position = body.position;

    if (!company || !position) {
      return NextResponse.json(
        { success: false, message: 'Nama perusahaan dan posisi pekerjaan wajib diisi.' },
        { status: 400 }
      );
    }

    const newId = isValidUUID(body.id) ? body.id : crypto.randomUUID();
    const uiStatus = body.status || 'Terkirim';
    const dbStatus = mapUiToDbStatus(uiStatus);

    const insightPayload = {
      location: body.location || 'Jakarta',
      salary: body.salary || '-',
      portal: body.portal || 'Direct',
      portalUrl: body.portalUrl || body.job_url || '',
      displayStatus: uiStatus,
      notes: body.notes || '',
    };

    const newApplication = await prisma.applications.create({
      data: {
        id: newId,
        user_id: user.id,
        company_name: company,
        position: position,
        job_url: body.portalUrl || body.job_url || null,
        status: dbStatus,
        source: 'MANUAL',
        applied_at: new Date(),
        match_score: typeof body.matchScore === 'number' ? body.matchScore : null,
        ats_score: typeof body.atsScore === 'number' ? body.atsScore : null,
        ai_insight: insightPayload,
        updated_at: new Date(),
      },
    });

    if (body.notes && typeof body.notes === 'string' && body.notes.trim()) {
      await prisma.application_notes.create({
        data: {
          id: crypto.randomUUID(),
          application_id: newApplication.id,
          user_id: user.id,
          content: body.notes.trim(),
        },
      });
    }

    const result = {
      id: newApplication.id,
      company: newApplication.company_name,
      position: newApplication.position,
      location: insightPayload.location,
      appliedDate: 'Hari ini',
      status: uiStatus,
      salary: insightPayload.salary,
      notes: body.notes || '',
      portal: insightPayload.portal,
      portalUrl: insightPayload.portalUrl,
      matchScore: newApplication.match_score ?? 0,
      atsScore: newApplication.ats_score ?? 0,
    };

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[POST /api/applications] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Lamaran belum tersimpan. Periksa koneksi internet Anda.' },
      { status: 500 }
    );
  }
}
