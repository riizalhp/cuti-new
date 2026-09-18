import type PgBoss from 'pg-boss';
import { JOB_NAMES, ContentSyncPayload } from '../types.ts';

// Schedule for 02:00 WIB (19:00 UTC)
export const CONTENT_SYNC_CRON = '0 19 * * *';

export async function registerContentSync(boss: PgBoss) {
  // Register the recurring schedule
  await boss.schedule(JOB_NAMES.CONTENT_SYNC, CONTENT_SYNC_CRON, null, {
    tz: 'UTC'
  });

  // Register the job handler
  await boss.work<ContentSyncPayload>(JOB_NAMES.CONTENT_SYNC, async (job) => {
    console.log(`[${JOB_NAMES.CONTENT_SYNC}] Starting job ${job.id}`);
    try {
      // TODO: Implement content sync logic here
      console.log(`[${JOB_NAMES.CONTENT_SYNC}] Content sync executed successfully.`);
    } catch (error) {
      console.error(`[${JOB_NAMES.CONTENT_SYNC}] Failed:`, error);
      throw error;
    }
  });
}
