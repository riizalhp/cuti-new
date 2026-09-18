// ============================================================================
// Cron Scheduler — Auto-scraping lowongan setiap jam 1 malam
// ----------------------------------------------------------------------------
// Menjalankan bot scraper otomatis untuk 5 kata kunci umum setiap hari
// jam 01:00 WIB, lalu simpan hasil ke database via syncJobsToDb.
// ============================================================================

// @ts-ignore
import cron from 'node-cron';
import { runScrape } from './job-scraper';
import { syncJobsToDb } from './job-sync';

const ENABLE_CRON = process.env.ENABLE_CRON === 'true';
const CRON_TIMEZONE = process.env.CRON_TIMEZONE || 'Asia/Jakarta';

// Kata kunci default untuk scraping otomatis:
// Diawali mode explore (keyword '') untuk meraup semua feed terbaru lintas bidang,
// lalu diikuti klaster profesi entry-level populer.
const DEFAULT_KEYWORDS = [
  '', // Mode Explore: semua lowongan terbaru publik
  'Barista',
  'Kasir',
  'Pramuniaga',
  'Admin',
  'Customer Service',
  'Operator Produksi',
  'Gudang',
  'Social Media',
  'Teknisi',
];

// Portal default untuk scraping otomatis (exclude browser-based portals yang butuh login)
const DEFAULT_PORTALS = [
  'Jobstreet',
  'Glints',
  'Dealls',
  'Talent',
  'Kalibrr',
  'Jobindo',
  'Jora',
  'Jobinaja',
  'Lokernas',
  'OfficialKarir',
  'LogKerja',
  'LokerHeadOffice',
  'SejakKemarin',
  'LamarLangsung',
  'InfoLokerKerja',
  'SolusiKerja',
  'BursaKerjaDepnaker',
  'LokerAnakMedan',
  'InfoLokerJabar',
  'InfoLokerBanten',
  'InfoLokerKarawang',
  'LokerMuslim',
  'LowkerJogja',
  'Disnakerja',
] as const;

/**
 * Flag untuk prevent cron overlap (simple in-memory lock)
 */
let isScrapingRunning = false;

/**
 * Main scraping task yang dipanggil oleh cron
 */
async function runDailyScraping() {
  if (isScrapingRunning) {
    console.log('[cron-scheduler] ⏭️  Skipping — scraping already running');
    return;
  }

  isScrapingRunning = true;
  const startTime = Date.now();
  const timestamp = new Date().toLocaleString('id-ID', {
    timeZone: CRON_TIMEZONE,
    dateStyle: 'short',
    timeStyle: 'short',
  });

  console.log(`\n${'='.repeat(80)}`);
  console.log(`[cron-scheduler] 🌙 AUTO-SCRAPING DIMULAI — ${timestamp}`);
  console.log(`${'='.repeat(80)}\n`);

  let totalJobs = 0;
  let totalCreated = 0;
  let totalUpdated = 0;
  let totalDeactivated = 0;

  try {
    for (const keyword of DEFAULT_KEYWORDS) {
      console.log(`\n[cron-scheduler] 🔍 Scraping keyword: "${keyword}"...`);

      try {
        // 1. Run scraping untuk keyword ini
        const scrapeResult = await runScrape({
          keyword,
          portals: DEFAULT_PORTALS as any,
        });

        console.log(`[cron-scheduler] ⚡ Scraped ${scrapeResult.jobs.length} jobs for "${keyword}"`);

        // 2. Sync hasil ke database
        const syncResult = await syncJobsToDb(scrapeResult.jobs);

        totalJobs += scrapeResult.jobs.length;
        totalCreated += syncResult.created;
        totalUpdated += syncResult.updated;
        totalDeactivated += syncResult.deactivated;

        console.log(
          `[cron-scheduler] ✅ Synced: ${syncResult.created} created, ${syncResult.updated} updated, ${syncResult.deactivated} deactivated`
        );

        // Small delay antar keyword untuk avoid overload
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error: any) {
        console.error(`[cron-scheduler] 🚨 Error scraping "${keyword}":`, error.message);
        // Continue dengan keyword berikutnya
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n${'='.repeat(80)}`);
    console.log(`[cron-scheduler] 🎉 AUTO-SCRAPING SELESAI — Duration: ${duration}s`);
    console.log(`[cron-scheduler] 📊 Summary:`);
    console.log(`  - Total scraped: ${totalJobs} jobs`);
    console.log(`  - Created: ${totalCreated}`);
    console.log(`  - Updated: ${totalUpdated}`);
    console.log(`  - Deactivated: ${totalDeactivated}`);
    console.log(`${'='.repeat(80)}\n`);
  } catch (error: any) {
    console.error('[cron-scheduler] 💥 Fatal error in daily scraping:', error);
  } finally {
    isScrapingRunning = false;
  }
}

/**
 * Initialize cron scheduler
 * Dipanggil saat aplikasi startup (dari next.config.ts atau main.ts)
 */
export function initializeCronScheduler() {
  if (!ENABLE_CRON) {
    console.log('[cron-scheduler] ⏸️  Cron scheduler disabled (ENABLE_CRON=false)');
    return null;
  }

  // Cron expression: "0 1 * * *" = Every day at 01:00 (1 AM)
  // Format: minute hour day month weekday
  const cronExpression = '0 1 * * *';

  console.log(`[cron-scheduler] 🕐 Initializing cron scheduler...`);
  console.log(`[cron-scheduler] ⏰ Schedule: Daily at 01:00 ${CRON_TIMEZONE}`);
  console.log(`[cron-scheduler] 🔑 Keywords: ${DEFAULT_KEYWORDS.join(', ')}`);

  const task = cron.schedule(
    cronExpression,
    () => {
      runDailyScraping().catch((err) => {
        console.error('[cron-scheduler] Unhandled error in cron task:', err);
      });
    },
    {
      scheduled: true,
      timezone: CRON_TIMEZONE,
    }
  );

  console.log('[cron-scheduler] ✅ Cron scheduler initialized successfully\n');

  // Untuk testing: Uncomment baris di bawah untuk trigger manual
  // setTimeout(() => {
  //   console.log('[cron-scheduler] 🧪 TEST RUN — Manual trigger for testing...');
  //   runDailyScraping();
  // }, 5000);

  return task;
}

/**
 * Trigger manual scraping (untuk testing atau admin manual trigger)
 */
export async function triggerManualScraping(keywords?: string[]) {
  const keywordsToUse = keywords || DEFAULT_KEYWORDS;
  console.log(`[cron-scheduler] 🔄 Manual scraping triggered for: ${keywordsToUse.join(', ')}`);

  for (const keyword of keywordsToUse) {
    try {
      const scrapeResult = await runScrape({
        keyword,
        portals: DEFAULT_PORTALS as any,
      });

      const syncResult = await syncJobsToDb(scrapeResult.jobs);

      console.log(
        `[cron-scheduler] ✅ Manual sync completed for "${keyword}": ` +
          `${syncResult.created} created, ${syncResult.updated} updated`
      );
    } catch (error: any) {
      console.error(`[cron-scheduler] Error in manual scraping for "${keyword}":`, error.message);
    }
  }
}

/**
 * Stop cron scheduler (untuk graceful shutdown)
 */
export function stopCronScheduler(task: cron.ScheduledTask | null) {
  if (task) {
    task.stop();
    console.log('[cron-scheduler] ⏹️  Cron scheduler stopped');
  }
}
