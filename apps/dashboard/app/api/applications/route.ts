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

    // Inisialisasi data starter ke database jika akun pengguna baru belum memiliki lamaran
    if (apps.length === 0) {
      const initialSeedData = [
        {
          id: crypto.randomUUID(),
          company_name: 'PT Tokopedia',
          position: 'Senior Frontend Engineer',
          location: 'Jakarta (Hybrid)',
          applied_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          status: ApplicationStatus.INTERVIEW,
          salary: 'Rp 18.000.000 - Rp 25.000.000',
          portal: 'LinkedIn',
          job_url: 'https://linkedin.com/jobs',
          displayStatus: 'Interview',
          notes: 'Interview User dijadwalkan tanggal 25 Juli 2026 jam 10:00 WIB',
          match_score: 92,
          ats_score: 95,
        },
        {
          id: crypto.randomUUID(),
          company_name: 'Gojek (GoTo Group)',
          position: 'React Native Developer',
          location: 'Jakarta (Onsite)',
          applied_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          status: ApplicationStatus.OFFERING,
          salary: 'Rp 22.000.000',
          portal: 'Glints',
          job_url: 'https://glints.com/id',
          displayStatus: 'Offering',
          notes: 'Offering letter sudah diterima, batas konfirmasi hingga 28 Juli 2026',
          match_score: 88,
          ats_score: 90,
        },
        {
          id: crypto.randomUUID(),
          company_name: 'PT Astra International',
          position: 'Full Stack Web Developer',
          location: 'Jakarta Selatan',
          applied_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          status: ApplicationStatus.APPLIED,
          salary: 'Rp 15.000.000 - Rp 20.000.000',
          portal: 'JobStreet',
          job_url: 'https://jobstreet.co.id',
          displayStatus: 'Screening',
          notes: 'Menunggu hasil kuis koding online ATS',
          match_score: 85,
          ats_score: 87,
        },
        {
          id: crypto.randomUUID(),
          company_name: 'Bank Central Asia (BCA)',
          position: 'IT Specialist Developer',
          location: 'Tangerang',
          applied_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
          status: ApplicationStatus.APPLIED,
          salary: 'Rp 14.000.000',
          portal: 'Website Perusahaan',
          job_url: 'https://karir.bca.co.id',
          displayStatus: 'Terkirim',
          notes: 'Lamaran via portal resmi BCA Careers',
          match_score: 80,
          ats_score: 84,
        },
        {
          id: crypto.randomUUID(),
          company_name: 'Shopee Indonesia',
          position: 'UI/UX Specialist',
          location: 'Jakarta',
          applied_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          status: ApplicationStatus.REJECTED,
          salary: 'Rp 16.000.000',
          portal: 'KitaLulus',
          job_url: 'https://kitalulus.com',
          displayStatus: 'Ditolak',
          notes: 'Posisi telah terisi oleh kandidat internal',
          match_score: 76,
          ats_score: 80,
        },
      ];

      for (const item of initialSeedData) {
        const created = await prisma.applications.create({
          data: {
            id: item.id,
            user_id: user.id,
            company_name: item.company_name,
            position: item.position,
            job_url: item.job_url,
            status: item.status,
            source: 'MANUAL',
            applied_at: item.applied_at,
            match_score: item.match_score,
            ats_score: item.ats_score,
            ai_insight: {
              location: item.location,
              salary: item.salary,
              portal: item.portal,
              portalUrl: item.job_url,
              displayStatus: item.displayStatus,
              notes: item.notes,
            },
            updated_at: new Date(),
          },
        });

        if (item.notes) {
          await prisma.application_notes.create({
            data: {
              id: crypto.randomUUID(),
              application_id: created.id,
              user_id: user.id,
              content: item.notes,
            },
          });
        }
      }

      apps = await prisma.applications.findMany({
        where: { user_id: user.id },
        include: {
          application_notes: {
            orderBy: { created_at: 'desc' },
          },
        },
        orderBy: { created_at: 'desc' },
      });
    }

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
        matchScore: app.match_score ?? 85,
        atsScore: app.ats_score ?? 88,
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
        match_score: 85,
        ats_score: 88,
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
      matchScore: 85,
      atsScore: 88,
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
