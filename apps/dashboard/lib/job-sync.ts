// ============================================================================
// Job Sync — simpan hasil scraping ke DB (audit di /scrape-jobs)
// ----------------------------------------------------------------------------
// Aturan (sesuai permintaan user):
//   - Dedupe by `external_url` (portal + URL unik per lowongan).
//   - Hanya lowongan yang masih buka yang di-scrape & disimpan.
//   - Lowongan disimpan sampai tutup; kalau sudah tidak ada di hasil scrape
//     terbaru (sudah tutup/dihapus di sumber), auto nonaktif.
//   - Lowongan manual/admin (source='manual') tidak pernah disentuh sync.
// ============================================================================

import { prisma } from '@employr/db';
import type { ExtractedJob } from './job-scraper';

export interface SyncResult {
  totalScraped: number;
  created: number;
  updated: number;
  deactivated: number;
  purged: number;
  failed: number;
  logs: string[];
}

/** Map jobType hasil scrape → enum WorkType DB */
function mapWorkType(jobType: ExtractedJob['jobType']): string {
  switch (jobType) {
    case 'Remote':
      return 'REMOTE';
    case 'Internship':
      return 'ONSITE'; // enum DB hanya ONSITE/REMOTE/HYBRID/ONLINE
    case 'Contract':
      return 'ONSITE';
    default:
      return 'ONSITE';
  }
}

/** Slug unik untuk jobs.slug (unique constraint) */
function buildSlug(job: ExtractedJob): string {
  const base = [job.portal, job.title, job.company].join('-').toLowerCase();
  const slug = base
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
  return `${slug}-${hashUrl(job.portalUrl)}`;
}

/** Hash pendek stabil dari URL (dedupe key tambahan di slug) */
function hashUrl(url: string): string {
  let h = 5381;
  for (let i = 0; i < url.length; i++) {
    h = ((h << 5) + h + url.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36).slice(0, 8);
}

/**
 * Simpan hasil scraping ke DB.
 * - Upsert by `source` (portal) + `external_url`.
 * - Lowongan yang tidak muncul lagi di hasil scrape terbaru dinonaktifkan
 *   (auto-hapus dari tampilan, tanpa delete hard agar data lamaran tetap utuh).
 */
export async function syncJobsToDb(jobs: ExtractedJob[]): Promise<SyncResult> {
  const logs: string[] = [];
  const ts = () => new Date().toLocaleTimeString('id-ID', { hour12: false });
  const now = new Date();

  // Dedupe input by external_url (satu URL bisa muncul di beberapa portal/keyword)
  const byUrl = new Map<string, ExtractedJob>();
  for (const j of jobs) {
    const key = `${j.portal}|${j.portalUrl}`.toLowerCase();
    if (!byUrl.has(key)) byUrl.set(key, j);
  }
  const unique = [...byUrl.values()];
  logs.push(`[${ts()}] 📦 ${unique.length} lowongan unik akan disinkronkan ke DB.`);

  let created = 0;
  let updated = 0;
  let failed = 0;

  for (const job of unique) {
    const source = job.portal;
    const externalUrl = job.portalUrl;

    try {
      // Cari atau buat company stub (lowongan scrape tidak punya company_id)
      const companyName = job.company || 'Perusahaan Eksternal';
      const companySlug = `${source}-${companyName}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 80);
      const company = await prisma.companies.upsert({
        where: { slug: companySlug },
        update: {
          ...(job.companyLogo ? { logo_url: job.companyLogo } : {}),
          ...(job.companyWebsite ? { website: job.companyWebsite } : {}),
        },
        create: {
          name: companyName,
          slug: companySlug,
          logo_url: job.companyLogo || null,
          website: job.companyWebsite || null,
        },
      });

      const existing = await prisma.jobs.findFirst({
        where: { source, external_url: externalUrl },
        select: { id: true, is_active: true },
      });

      if (existing) {
        await prisma.jobs.update({
          where: { id: existing.id },
          data: {
            title: job.title,
            company_id: company.id,
            description: job.description || 'Lowongan aktif dari sumber eksternal.',
            location: job.location || 'Indonesia',
            work_type: mapWorkType(job.jobType) as any,
            is_active: true, // masih terdeteksi buka di sumber
            last_synced_at: now,
          },
        });
        updated++;
      } else {
        await prisma.jobs.create({
          data: {
            id: crypto.randomUUID(),
            company_id: company.id,
            title: job.title,
            slug: buildSlug(job),
            description: job.description || 'Lowongan aktif dari sumber eksternal.',
            location: job.location || 'Indonesia',
            work_type: mapWorkType(job.jobType) as any,
            requirements: job.requirements.length ? job.requirements : undefined,
            external_url: externalUrl,
            source,
            last_synced_at: now,
          },
        });
        created++;
      }
    } catch (e: any) {
      failed++;
      logs.push(`[${ts()}] 🚨 Gagal sync "${job.title}": ${e?.message || 'unknown error'}`);
    }
  }

  // Auto-deactivate: lowongan scraping tidak terdeteksi lagi di hasil scrape.
  // Grace period 3 hari (GRACE_MS) supaya lowongan yang masih buka tapi kelewat
  // dari hasil scrape (kata kunci berbeda, dsb.) tidak langsung dinonaktifkan.
  // Lowongan lewat deadline langsung dinonaktifkan tanpa grace period.
  const activeUrls = new Set(unique.map((j) => `${j.portal}|${j.portalUrl}`.toLowerCase()));
  let deactivated = 0;

  const GRACE_MS = Number(process.env.JOB_SYNC_GRACE_DAYS || 3) * 24 * 60 * 60 * 1000;
  const staleBefore = new Date(now.getTime() - GRACE_MS);

  const staleJobs = await prisma.jobs.findMany({
    where: {
      source: { not: 'manual' },
      is_active: true,
      OR: [
        { last_synced_at: { lt: staleBefore } },
        { last_synced_at: null, created_at: { lt: staleBefore } },
        { deadline: { lt: now } },
      ],
    },
    select: { id: true, source: true, external_url: true },
    take: 500,
  });

  for (const dbJob of staleJobs) {
    const key = `${dbJob.source}|${dbJob.external_url}`.toLowerCase();
    // Belum lewat deadline tapi masih terdeteksi aktif di scrape terakhir → biarkan
    if (activeUrls.has(key)) continue;
    try {
      await prisma.jobs.update({
        where: { id: dbJob.id },
        data: { is_active: false, last_synced_at: now },
      });
      deactivated++;
    } catch {
      // skip
    }
  }

  // Auto-purge: lowongan yang sudah tutup (is_active: false) lebih dari 1 minggu (7 hari)
  // dihapus permanen dari database agar database tetap bersih dan optimal.
  const purged = await purgeClosedJobsOlderThan(7);
  if (purged > 0) {
    logs.push(`[${ts()}] 🗑️  ${purged} lowongan tutup > 1 minggu telah dihapus permanen dari database.`);
  }

  logs.push(
    `[${ts()}] ✅ Sinkronisasi selesai: ${created} baru, ${updated} diperbarui, ${deactivated} dinonaktifkan${purged ? `, ${purged} dihapus permanen` : ''}${failed ? `, ${failed} gagal` : ''}.`
  );

  return { totalScraped: unique.length, created, updated, deactivated, purged, failed, logs };
}

/**
 * Hapus permanen lowongan yang sudah tutup/nonaktif lebih dari 1 minggu (7 hari).
 * - Hanya berlaku untuk lowongan scraping (source != 'manual').
 * - Melepaskan relasi applications.job_id = null agar riwayat lamaran user tetap aman.
 */
export async function purgeClosedJobsOlderThan(days = 7): Promise<number> {
  const purgeBefore = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  try {
    const expiredJobs = await prisma.jobs.findMany({
      where: {
        source: { not: 'manual' },
        is_active: false,
        OR: [
          { last_synced_at: { lt: purgeBefore } },
          { last_synced_at: null, created_at: { lt: purgeBefore } },
        ],
      },
      select: { id: true },
      take: 1000,
    });

    if (!expiredJobs.length) return 0;

    const jobIds = expiredJobs.map((j) => j.id);

    // 1. Unlink applications agar tidak melanggar foreign key constraint
    await prisma.applications.updateMany({
      where: { job_id: { in: jobIds } },
      data: { job_id: null },
    });

    // 2. Hapus permanen lowongan yang sudah tutup > 1 minggu
    const deleted = await prisma.jobs.deleteMany({
      where: { id: { in: jobIds } },
    });

    return deleted.count;
  } catch (error: any) {
    console.error('[job-sync] Error purging expired closed jobs:', error.message);
    return 0;
  }
}

/** Statistik DB untuk halaman audit /scrape-jobs */
export async function getSyncStats() {
  const [totalActive, totalInactive, scrapedActive, lastSync] = await Promise.all([
    prisma.jobs.count({ where: { is_active: true } }),
    prisma.jobs.count({ where: { is_active: false } }),
    prisma.jobs.count({ where: { is_active: true, source: { not: 'manual' } } }),
    prisma.jobs.findFirst({
      where: { last_synced_at: { not: null } },
      orderBy: { last_synced_at: 'desc' },
      select: { last_synced_at: true },
    }),
  ]);

  const bySource = await prisma.jobs.groupBy({
    by: ['source'],
    where: { is_active: true },
    _count: { _all: true },
  });

  return {
    totalActive,
    totalInactive,
    scrapedActive,
    manualActive: totalActive - scrapedActive,
    lastSyncedAt: lastSync?.last_synced_at?.toISOString() || null,
    bySource: bySource
      .map((s) => ({ source: s.source, count: s._count._all }))
      .sort((a, b) => b.count - a.count),
  };
}
