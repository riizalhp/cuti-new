import { NextResponse } from 'next/server';
import { prisma } from '@employr/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [
      blueprintStats,
      entryStats,
      dictStats,
      cacheStats,
      usageStats,
      profileCount,
      tuningSuggestions,
    ] = await Promise.all([
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*)::bigint as count FROM learned_role_blueprints
      `.catch(() => [{ count: 0n }]),
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*)::bigint as count FROM learned_role_entries
      `.catch(() => [{ count: 0n }]),
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*)::bigint as count FROM cv_learning_dictionary
      `.catch(() => [{ count: 0n }]),
      prisma.$queryRaw<[{ total: bigint; total_hits: bigint }]>`
        SELECT COUNT(*)::bigint as total, COALESCE(SUM(hits), 0)::bigint as total_hits
        FROM ai_semantic_cache
      `.catch(() => [{ total: 0n, total_hits: 0n }]),
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*)::bigint as count FROM ai_usage_logs
      `.catch(() => [{ count: 0n }]),
      prisma.$queryRaw<[{ total: bigint }]>`
        SELECT COUNT(*)::bigint as total FROM user_behavior_profiles
      `.catch(() => [{ total: 0n }]),
      prisma.system_settings
        .findMany({ where: { group: 'tuning_suggestions' } })
        .then((rows) =>
          rows.reduce(
            (acc, r) => {
              try {
                const d = JSON.parse(r.value);
                if (d.status === 'PENDING') acc.pending++;
                if (d.status === 'APPROVED') acc.approved++;
              } catch {}
              return acc;
            },
            { pending: 0, approved: 0 }
          )
        )
        .catch(() => ({ pending: 0, approved: 0 })),
    ]);

    const blueprintCount = Number(blueprintStats[0]?.count ?? 0n);
    const entryCount = Number(entryStats[0]?.count ?? 0n);
    const dictCount = Number(dictStats[0]?.count ?? 0n);
    const usageCount = Number(usageStats[0]?.count ?? 0n);

    const cache = cacheStats[0] || { total: 0n, total_hits: 0n };
    const cacheHits = Number(cache.total_hits);
    const savingsPercent =
      usageCount > 0 ? Math.round((cacheHits / (cacheHits + usageCount)) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        activeFeatures: 15,
        totalFeatures: 19,
        blueprints: blueprintCount,
        blueprintEntries: entryCount,
        dictionaryTokens: dictCount,
        cacheEntries: Number(cache.total),
        cacheHits,
        cacheSavingsPercent: savingsPercent,
        aiRequests: usageCount,
        behaviorProfiles: Number(profileCount[0]?.total ?? 0n),
        tuning: tuningSuggestions,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat mengambil data system intelligence.' },
      { status: 500 }
    );
  }
}
