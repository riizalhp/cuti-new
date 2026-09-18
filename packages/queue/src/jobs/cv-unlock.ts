import type PgBoss from 'pg-boss';
import { JOB_NAMES, CvUnlockPayload } from '../types.ts';

// Schedule for every minute
export const CV_UNLOCK_CRON = '* * * * *';

export async function registerCvUnlock(boss: PgBoss) {
  // Register the recurring schedule
  await boss.schedule(JOB_NAMES.CV_UNLOCK, CV_UNLOCK_CRON, null, {
    tz: 'UTC'
  });

  // Register the job handler
  await boss.work<CvUnlockPayload>(JOB_NAMES.CV_UNLOCK, async (job) => {
    // console.log(`[${JOB_NAMES.CV_UNLOCK}] Starting job ${job.id}`); // might be noisy every minute
    try {
      // TODO: Query DB for CVs where ready_at <= now() and unlocked = false
      // Then process/unlock them
    } catch (error) {
      console.error(`[${JOB_NAMES.CV_UNLOCK}] Failed:`, error);
      throw error;
    }
  });
}
