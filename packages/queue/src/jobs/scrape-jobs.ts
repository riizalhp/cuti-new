import type PgBoss from 'pg-boss';
import { JOB_NAMES, ScrapeJobsPayload } from '../types.ts';

// Schedule for 01:00 WIB (18:00 UTC)
export const SCRAPE_JOBS_CRON = '0 18 * * *';

export async function registerScrapeJobs(boss: PgBoss) {
  // Register the recurring schedule
  await boss.schedule(JOB_NAMES.SCRAPE_JOBS, SCRAPE_JOBS_CRON, null, {
    tz: 'UTC'
  });

  // Register the job handler
  await boss.work<ScrapeJobsPayload>(JOB_NAMES.SCRAPE_JOBS, async (job) => {
    console.log(`[${JOB_NAMES.SCRAPE_JOBS}] Starting job ${job.id}`);
    try {
      // TODO: Implement actual scrape logic here.
      // E.g., import { scrapeJobs } from 'apps/dashboard/src/job-scraper' (or similar)
      console.log(`[${JOB_NAMES.SCRAPE_JOBS}] Job scraper executed successfully.`);
    } catch (error) {
      console.error(`[${JOB_NAMES.SCRAPE_JOBS}] Failed:`, error);
      throw error;
    }
  });
}
