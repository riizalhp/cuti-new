import type PgBoss from 'pg-boss';
import { JOB_NAMES, NotificationSendPayload } from '../types.ts';

export async function registerNotificationSend(boss: PgBoss) {
  // Register the job handler (no schedule, triggered on-demand)
  await boss.work<NotificationSendPayload>(JOB_NAMES.NOTIFICATION_SEND, async (job) => {
    console.log(`[${JOB_NAMES.NOTIFICATION_SEND}] Starting job ${job.id} for user ${job.data.userId}`);
    try {
      // TODO: Implement notification sending logic (e.g., using Resend for emails)
      console.log(`[${JOB_NAMES.NOTIFICATION_SEND}] Notification sent successfully.`);
    } catch (error) {
      console.error(`[${JOB_NAMES.NOTIFICATION_SEND}] Failed:`, error);
      throw error;
    }
  });
}
