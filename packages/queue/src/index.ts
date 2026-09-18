import PgBoss from 'pg-boss';
import { registerScrapeJobs } from './jobs/scrape-jobs.ts';
import { registerContentSync } from './jobs/content-sync.ts';
import { registerCvUnlock } from './jobs/cv-unlock.ts';
import { registerNotificationSend } from './jobs/notification-send.ts';
import { registerAnalyticsAggregate } from './jobs/analytics-aggregate.ts';
import { registerBuildUserProfiles } from './jobs/build-user-profiles.ts';
import { registerOutcomeCorrelation } from './jobs/outcome-correlation.ts';
import { registerChurnDetection } from './jobs/churn-detection.ts';

export * from './types.ts';

let boss: PgBoss | null = null;

export async function initQueue(): Promise<PgBoss> {
  if (boss) {
    return boss;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required to initialize pg-boss');
  }

  boss = new PgBoss({
    connectionString: databaseUrl,
    schema: 'pgboss', // use a dedicated schema to avoid cluttering public
  });

  boss.on('error', (error) => {
    console.error('pg-boss error:', error);
  });

  await boss.start();
  console.log('pg-boss started successfully');

  return boss;
}

export function getQueue(): PgBoss {
  if (!boss) {
    throw new Error('Queue is not initialized. Call initQueue() first.');
  }
  return boss;
}

export async function startWorkers(): Promise<void> {
  const queue = getQueue();
  
  await Promise.all([
    registerScrapeJobs(queue),
    registerContentSync(queue),
    registerCvUnlock(queue),
    registerNotificationSend(queue),
    registerAnalyticsAggregate(queue),
    registerBuildUserProfiles(queue),
    registerOutcomeCorrelation(queue),
    registerChurnDetection(queue),
  ]);
  
  console.log('All pg-boss workers registered');
}

export async function stopQueue(): Promise<void> {
  if (boss) {
    await boss.stop();
    boss = null;
    console.log('pg-boss stopped successfully');
  }
}
