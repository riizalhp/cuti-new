import type PgBoss from 'pg-boss';
import { prisma } from '@employr/db';
import { JOB_NAMES } from '../types.ts';

export const CHURN_DETECTION_CRON = '30 21 * * *'; // 04:30 WIB daily

export async function registerChurnDetection(boss: PgBoss) {
  await boss.schedule(JOB_NAMES.CHURN_DETECTION, CHURN_DETECTION_CRON, null, { tz: 'UTC' });
  
  await boss.work(JOB_NAMES.CHURN_DETECTION, async (job) => {
    // implementation...
  });
}
