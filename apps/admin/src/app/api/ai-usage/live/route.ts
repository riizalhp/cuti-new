import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@employr/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 50, 10), 100);
    const filterProvider = searchParams.get("provider");
    const filterFeature = searchParams.get("feature");
    const searchQuery = searchParams.get("q")?.toLowerCase();

    // 1. Time Boundaries
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // 2. Fetch Usage Today for KPI Aggregations
    const todayLogs = await prisma.ai_usage_logs.findMany({
      where: {
        created_at: { gte: todayStart },
      },
      select: {
        user_id: true,
        cost: true,
        tokens_input: true,
        tokens_output: true,
        created_at: true,
      },
    });

    // 3. Month Total Cost Aggregation
    const monthAgg = await prisma.ai_usage_logs.aggregate({
      where: {
        created_at: { gte: monthStart },
      },
      _sum: {
        cost: true,
      },
    });

    let cachedTokens = 0;
    try {
      const cacheAgg = await prisma.ai_semantic_cache.aggregate({
        _sum: { hits: true },
      });
      cachedTokens = (cacheAgg._sum.hits || 0) * 850;
    } catch {}

    let totalCostToday = 0;
    let totalTokensInputToday = 0;
    let totalTokensOutputToday = 0;
    let callsLastHour = 0;
    const userSpendMap: Record<string, { totalCost: number; callsCount: number; tokens: number }> = {};

    todayLogs.forEach((l) => {
      const costNum = Number(l.cost) || 0;
      totalCostToday += costNum;
      totalTokensInputToday += l.tokens_input;
      totalTokensOutputToday += l.tokens_output;

      if (l.created_at >= oneHourAgo) {
        callsLastHour += 1;
      }

      if (l.user_id) {
        if (!userSpendMap[l.user_id]) {
          userSpendMap[l.user_id] = { totalCost: 0, callsCount: 0, tokens: 0 };
        }
        userSpendMap[l.user_id].totalCost += costNum;
        userSpendMap[l.user_id].callsCount += 1;
        userSpendMap[l.user_id].tokens += l.tokens_input + l.tokens_output;
      }
    });

    const totalCallsToday = todayLogs.length;
    const totalTokensToday = totalTokensInputToday + totalTokensOutputToday;
    const avgCostPerRequest = totalCallsToday > 0 ? totalCostToday / totalCallsToday : 0;
    const totalCostThisMonth = Number(monthAgg._sum.cost) || 0;

    // 4. Top Spenders Today
    const sortedUserIds = Object.entries(userSpendMap)
      .sort((a, b) => b[1].totalCost - a[1].totalCost)
      .slice(0, 5)
      .map(([id]) => id);

    let topSpenders: Array<{
      userId: string;
      name: string;
      email: string;
      tier: string;
      callsCount: number;
      totalCost: number;
      totalTokens: number;
    }> = [];

    if (sortedUserIds.length > 0) {
      const spenderUsers = await prisma.user.findMany({
        where: { id: { in: sortedUserIds } },
        select: {
          id: true,
          name: true,
          email: true,
          memberships: {
            select: {
              tier: true,
              package_name: true,
            },
          },
        },
      });

      const userDetailMap = new Map(spenderUsers.map((u) => [u.id, u]));

      topSpenders = sortedUserIds.map((uid) => {
        const u = userDetailMap.get(uid);
        const data = userSpendMap[uid];
        return {
          userId: uid,
          name: u?.name || "Pengguna",
          email: u?.email || "-",
          tier: u?.memberships?.tier || "FREE",
          callsCount: data.callsCount,
          totalCost: data.totalCost,
          totalTokens: data.tokens,
        };
      });
    }

    // 5. Recent Logs (Stream feed)
    const logWhere: any = {};
    if (filterProvider && filterProvider !== "ALL") {
      logWhere.provider = filterProvider;
    }
    if (filterFeature && filterFeature !== "ALL") {
      logWhere.prompt_name = filterFeature;
    }

    const recentRawLogs = await prisma.ai_usage_logs.findMany({
      where: logWhere,
      orderBy: { created_at: "desc" },
      take: limit,
    });

    const recentUserIds = Array.from(new Set(recentRawLogs.map((l) => l.user_id).filter(Boolean)));
    const logUsers = await prisma.user.findMany({
      where: { id: { in: recentUserIds } },
      select: {
        id: true,
        name: true,
        email: true,
        memberships: {
          select: {
            tier: true,
            package_name: true,
          },
        },
      },
    });

    const logUserMap = new Map(logUsers.map((u) => [u.id, u]));

    let recentLogs = recentRawLogs.map((l) => {
      const u = logUserMap.get(l.user_id);
      return {
        id: l.id,
        timestamp: l.created_at.toISOString(),
        userId: l.user_id,
        userName: u?.name || "Pengguna",
        userEmail: u?.email || "-",
        userTier: u?.memberships?.tier || "FREE",
        packageName: u?.memberships?.package_name || null,
        feature: l.prompt_name || "Custom AI Task",
        provider: l.provider || "openai",
        model: l.model || "gpt-4o-mini",
        tokensInput: l.tokens_input,
        tokensOutput: l.tokens_output,
        tokensTotal: l.tokens_input + l.tokens_output,
        cost: Number(l.cost) || 0,
        status: "SUCCESS" as const,
      };
    });

    // Optional query search filter
    if (searchQuery) {
      recentLogs = recentLogs.filter(
        (l) =>
          l.userName.toLowerCase().includes(searchQuery) ||
          l.userEmail.toLowerCase().includes(searchQuery) ||
          l.feature.toLowerCase().includes(searchQuery) ||
          l.model.toLowerCase().includes(searchQuery)
      );
    }

    // 6. Active Providers & Feature Mappings
    const dbProviders = await prisma.ai_providers.findMany({
      orderBy: { priority: "desc" },
      select: {
        id: true,
        name: true,
        label: true,
        model: true,
        priority: true,
        is_active: true,
        cooldown_until: true,
        alias: true,
        base_url: true,
      },
    });

    let featureMappings: Array<{
      feature_key: string;
      feature_name: string;
      provider_id: string | null;
      is_active: boolean;
    }> = [];
    try {
      featureMappings = await prisma.ai_feature_mappings.findMany({
        select: {
          feature_key: true,
          feature_name: true,
          provider_id: true,
          is_active: true,
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalCostToday,
          totalCostThisMonth,
          totalTokensToday,
          totalTokensInputToday,
          totalTokensOutputToday,
          cachedTokens,
          totalCallsToday,
          callsLastHour,
          avgCostPerRequest,
        },
        providers: dbProviders.map((p) => ({
          id: p.id,
          name: p.name,
          label: p.label || p.name,
          model: p.model,
          priority: p.priority,
          isActive: p.is_active,
          cooldownUntil: p.cooldown_until ? p.cooldown_until.toISOString() : null,
          alias: p.alias,
          baseUrl: p.base_url,
        })),
        featureMappings: featureMappings.map((f) => ({
          key: f.feature_key,
          name: f.feature_name,
          providerId: f.provider_id,
          isActive: f.is_active,
        })),
        topSpenders,
        recentLogs,
      },
    });
  } catch (error: any) {
    console.error("[AI Usage Live API] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data live AI usage: " + (error?.message || "Internal error") },
      { status: 500 }
    );
  }
}
