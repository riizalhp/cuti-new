// ============================================================================
// Next.js Instrumentation (Node.js runtime only)
// ----------------------------------------------------------------------------
// Dijalankan sekali saat server Next.js start di nodejs runtime.
// Menjadwalkan scrape portal publik + sync ke DB tiap hari jam 01.00 WIB (17:00 UTC).
// ============================================================================

import type { ExtractedJob } from './lib/job-scraper';

export function registerNodeInstrumentation() {
  const g = globalThis as any;
  if (g.__scrapeCronRegistered) return;
  g.__scrapeCronRegistered = true;

  const CRON_HOUR_UTC = 17; // 01:00 WIB = 17:00 UTC (UTC+7)
  const CHECK_INTERVAL_MS = 5 * 60 * 1000; // cek tiap 5 menit

  const runJob = async () => {
    try {
      const { runScrape } = await import('./lib/job-scraper');
      const { syncJobsToDb } = await import('./lib/job-sync');

      // Diawali mode explore (keyword '') untuk meraup semua feed terbaru publik,
      // lalu diikuti klaster profesi entry-level populer.
      const keywords = [
        '', // Explore mode: semua lowongan publik terbaru
        'barista',
        'kasir',
        'pramuniaga',
        'admin',
        'customer service',
        'operator produksi',
        'gudang',
        'social media',
        'teknisi',
      ];
      const allJobs: ExtractedJob[] = [];

      for (const kw of keywords) {
        const result = await runScrape({
          keyword: kw,
          portals: [
            'Jobstreet', 'Glints', 'Dealls', 'Talent', 'Kalibrr', 'Jobindo', 'Jora',
            'Jobinaja', 'Lokernas', 'OfficialKarir', 'LogKerja',
            'LokerHeadOffice', 'SejakKemarin', 'LamarLangsung', 'InfoLokerKerja', 'SolusiKerja',
            'BursaKerjaDepnaker', 'LokerAnakMedan', 'InfoLokerJabar', 'InfoLokerBanten',
            'InfoLokerKarawang', 'LokerMuslim', 'LowkerJogja', 'Disnakerja',
          ],
        });
        allJobs.push(...result.jobs);
      }
      const sync = await syncJobsToDb(allJobs);
      console.log(
        `[scrape-cron] OK — ${allJobs.length} hasil mentah, ${sync.created} baru, ${sync.updated} update, ${sync.deactivated} dinonaktifkan`
      );
    } catch (e: any) {
      console.error('[scrape-cron] Gagal:', e?.message || e);
    }

    // Konten: artikel + sertifikasi (dedupe by source + external_url)
    try {
      const { runContentSync } = await import('./lib/content-scraper');
      const content = await runContentSync();
      console.log(
        `[scrape-cron] Konten OK — artikel ${content.articles.created} baru/${content.articles.updated} update, sertifikasi ${content.certifications.created} baru/${content.certifications.updated} update`
      );
    } catch (e: any) {
      console.error('[scrape-cron] Konten gagal:', e?.message || e);
    }
  };

  const tick = () => {
    const now = new Date();
    const last = g.__scrapeCronLastRun as Date | undefined;

    // Jalankan jika jam UTC 17 (01:00 WIB) dan belum jalan hari UTC ini
    if (now.getUTCHours() === CRON_HOUR_UTC && (!last || now.getUTCDate() !== last.getUTCDate())) {
      g.__scrapeCronLastRun = now;
      console.log(`[scrape-cron] Mulai scrape harian (01:00 WIB)...`);
      runJob();
    }
  };

  setTimeout(tick, CHECK_INTERVAL_MS);
  setInterval(tick, CHECK_INTERVAL_MS);
  console.log('[scrape-cron] Cron scrape harian 01:00 WIB terjadwal (cek tiap 5 menit).');
}
