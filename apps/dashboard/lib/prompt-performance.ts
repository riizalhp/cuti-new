import { prisma } from '@employr/db';

interface PromptPerformanceReport {
  promptName: string;
  promptVersion: number;
  totalGenerations: number;
  acceptanceRate: number;
  modificationRate: number;
  rejectionRate: number;
  avgTimeToActionMs: number;
}

/**
 * Menganalisis performa setiap AI prompt berdasarkan feedback user.
 * Menghubungkan ai_prompts.name dengan AI_FEEDBACK events di visitor_activities.
 *
 * Cara kerja:
 * 1. Ambil semua prompt aktif dari ai_prompts
 * 2. Untuk setiap prompt, hitung jumlah AI_FEEDBACK events
 *    yang generation_id-nya match (prefix = prompt name)
 * 3. Hitung acceptance, modification, rejection rate
 */
export async function getPromptPerformance(
  daysBack: number = 30
): Promise<PromptPerformanceReport[]> {
  const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

  const feedbackEvents = await prisma.visitorActivity.findMany({
    where: {
      activity_type: 'AI_FEEDBACK',
      created_at: { gte: since },
    },
    select: { metadata: true },
  });

  const promptStats = new Map<
    string,
    {
      applied: number;
      modified: number;
      rejected: number;
      ignored: number;
      totalTimeMs: number;
      timeCount: number;
    }
  >();

  for (const event of feedbackEvents) {
    const meta = event.metadata as Record<string, any> | null;
    if (!meta) continue;

    const genId = (meta.generation_id as string) || 'unknown';
    const action = meta.action as string;
    const timeMs = meta.time_to_action_ms as number | undefined;

    const promptKey = genId.split('_')[0] || 'unknown';

    if (!promptStats.has(promptKey)) {
      promptStats.set(promptKey, {
        applied: 0,
        modified: 0,
        rejected: 0,
        ignored: 0,
        totalTimeMs: 0,
        timeCount: 0,
      });
    }

    const stats = promptStats.get(promptKey)!;
    if (action === 'applied') stats.applied++;
    else if (action === 'modified') stats.modified++;
    else if (action === 'rejected') stats.rejected++;
    else if (action === 'ignored') stats.ignored++;

    if (timeMs && timeMs > 0) {
      stats.totalTimeMs += timeMs;
      stats.timeCount++;
    }
  }

  const activePrompts = await prisma.ai_prompts.findMany({
    where: { is_active: true },
    select: { name: true, version: true },
  });

  const promptVersionMap = new Map<string, number>();
  for (const p of activePrompts) {
    promptVersionMap.set(p.name, p.version);
  }

  const reports: PromptPerformanceReport[] = [];
  for (const [key, stats] of promptStats) {
    const total = stats.applied + stats.modified + stats.rejected + stats.ignored;
    if (total === 0) continue;

    reports.push({
      promptName: key,
      promptVersion: promptVersionMap.get(key) ?? 0,
      totalGenerations: total,
      acceptanceRate: (stats.applied + stats.modified) / total,
      modificationRate: stats.modified / total,
      rejectionRate: stats.rejected / total,
      avgTimeToActionMs:
        stats.timeCount > 0 ? Math.round(stats.totalTimeMs / stats.timeCount) : 0,
    });
  }

  return reports.sort((a, b) => b.totalGenerations - a.totalGenerations);
}

/**
 * Quick check: apakah ada prompt dengan acceptance rate di bawah threshold?
 * Berguna untuk alerting di admin dashboard.
 */
export async function getLowPerformingPrompts(
  threshold: number = 0.5,
  minSamples: number = 10
): Promise<PromptPerformanceReport[]> {
  const reports = await getPromptPerformance(30);
  return reports.filter(
    (r) => r.totalGenerations >= minSamples && r.acceptanceRate < threshold
  );
}
