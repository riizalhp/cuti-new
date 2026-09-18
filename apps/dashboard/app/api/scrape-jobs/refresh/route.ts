import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@employr/db';
import { downloadAndProcessLogo } from '@/lib/image-processor';
import { purgeClosedJobsOlderThan } from '@/lib/job-sync';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Helper: Check if job URL is still active
 */
async function checkJobStillActive(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; EmployrBot/1.0)',
      },
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    // 200/301/302 → still active
    // 404/410/500+ → not active
    return response.ok || response.status === 301 || response.status === 302;
  } catch (error: any) {
    // Timeout atau network error → assume still active (benefit of doubt)
    if (error.name === 'AbortError') {
      console.warn(`[refresh] Timeout checking ${url} — assuming still active`);
    }
    return true;
  }
}

/**
 * POST /api/scrape-jobs/refresh
 *
 * Re-check status lowongan yang sudah tersimpan di database tanpa scrape ulang
 * semua portal eksternal. Digunakan oleh tombol "Refresh Database" di UI.
 *
 * Body (optional):
 * - jobIds?: string[] — filter by specific job IDs
 * - companyIds?: string[] — filter by specific company IDs
 * - limit?: number — max jobs to check (default 100)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const jobIds = Array.isArray(body?.jobIds) ? body.jobIds : undefined;
    const companyIds = Array.isArray(body?.companyIds) ? body.companyIds : undefined;
    const limit = typeof body?.limit === 'number' ? Math.min(body.limit, 500) : 100;

    const logs: string[] = [];
    const ts = () => new Date().toLocaleTimeString('id-ID', { hour12: false });
    const now = new Date();

    logs.push(`[${ts()}] 🔄 Refresh database dimulai — cek status lowongan tersimpan...`);

    // Ambil lowongan yang perlu di-refresh (non-manual, active jobs)
    const jobs = await prisma.jobs.findMany({
      where: {
        source: { not: 'manual' },
        is_active: true,
        ...(jobIds ? { id: { in: jobIds } } : {}),
        ...(companyIds ? { company_id: { in: companyIds } } : {}),
      },
      include: { companies: true },
      take: limit,
      orderBy: { last_synced_at: 'asc' }, // Prioritize oldest first
    });

    if (jobs.length === 0) {
      logs.push(`[${ts()}] ℹ️  Tidak ada lowongan yang perlu di-refresh.`);
      return NextResponse.json({
        success: true,
        checked: 0,
        deactivated: 0,
        logosProcessed: 0,
        logs,
      });
    }

    logs.push(`[${ts()}] 📋 Ditemukan ${jobs.length} lowongan untuk dicek...`);

    let deactivated = 0;
    let logosProcessed = 0;

    // Process each job
    for (const job of jobs) {
      try {
        // 1. Check if job URL still active
        const isActive = await checkJobStillActive(job.external_url);

        if (!isActive) {
          await prisma.jobs.update({
            where: { id: job.id },
            data: { is_active: false, last_synced_at: now },
          });
          deactivated++;
          logs.push(`[${ts()}] ❌ Dinonaktifkan: ${job.title} (${job.source})`);
        } else {
          // Still active — update last_synced_at
          await prisma.jobs.update({
            where: { id: job.id },
            data: { last_synced_at: now },
          });
        }

        // 2. Process company logo if not yet processed (still external URL)
        if (
          job.companies.logo_url &&
          job.companies.logo_url.startsWith('http') &&
          !job.companies.logo_url.includes('/uploads/logos/')
        ) {
          const processedUrl = await downloadAndProcessLogo(
            job.companies.logo_url,
            job.companies.slug
          );

          if (processedUrl) {
            await prisma.companies.update({
              where: { id: job.companies.id },
              data: { logo_url: processedUrl },
            });
            logosProcessed++;
            logs.push(`[${ts()}] 🖼️  Logo diproses: ${job.companies.name}`);
          }
        }

        // Small delay to avoid overwhelming external servers
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error: any) {
        console.error(`[refresh] Error processing job ${job.id}:`, error.message);
        logs.push(`[${ts()}] ⚠️  Error: ${job.title} — ${error.message}`);
      }
    }

    // Auto-purge: hapus permanen lowongan yang sudah tutup > 1 minggu (7 hari)
    const purged = await purgeClosedJobsOlderThan(7);
    if (purged > 0) {
      logs.push(`[${ts()}] 🗑️  ${purged} lowongan tutup > 1 minggu telah dihapus permanen dari database.`);
    }

    logs.push(
      `[${ts()}] ✅ Refresh selesai: ${jobs.length} dicek, ${deactivated} dinonaktifkan, ${logosProcessed} logo diproses${purged ? `, ${purged} dihapus permanen` : ''}.`
    );

    return NextResponse.json({
      success: true,
      checked: jobs.length,
      deactivated,
      purged,
      logosProcessed,
      logs,
    });
  } catch (error: any) {
    console.error('[POST /api/scrape-jobs/refresh] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Refresh database gagal dijalankan.',
      },
      { status: 500 }
    );
  }
}
