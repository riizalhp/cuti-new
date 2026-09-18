import type PgBoss from 'pg-boss';
import { prisma } from '@employr/db';
import { JOB_NAMES } from '../types.ts';

export const OUTCOME_CORRELATION_CRON = '0 21 1 * *'; // 04:00 WIB, 1st of month

export async function registerOutcomeCorrelation(boss: PgBoss) {
  await boss.schedule(JOB_NAMES.OUTCOME_CORRELATION, OUTCOME_CORRELATION_CRON, null, { tz: 'UTC' });
  
  await boss.work(JOB_NAMES.OUTCOME_CORRELATION, async (job) => {
    // implementation...
  });
}
