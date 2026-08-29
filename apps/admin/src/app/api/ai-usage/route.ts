import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@cuti/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "monthly";

    // Calculate date filter
    const now = new Date();
    let startDate = new Date();
    if (period === "daily") {
      startDate.setDate(now.getDate() - 1);
    } else if (period === "weekly") {
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate.setMonth(now.getMonth() - 1);
    }

    // Get usage logs within range
    const logs = await prisma.ai_usage_logs.findMany({
      where: {
        created_at: { gte: startDate },
      },
      orderBy: { created_at: "desc" },
    });

    // Also get active providers for reference
    const providers = await prisma.ai_providers.findMany({
      where: { is_active: true },
    });

    // Aggregate metrics
    let totalTokensInput = 0;
    let totalTokensOutput = 0;
    let totalCost = 0;
    let totalRequests = logs.length;

    // Breakdown by feature / prompt_name
    const featureMap: Record<string, { requests: number; inputTokens: number; outputTokens: number; cost: number }> = {};

    // Breakdown by provider/key
    const providerMap: Record<string, { requests: number; tokens: number; cost: number; model: string }> = {};

    logs.forEach((log) => {
      totalTokensInput += log.tokens_input;
      totalTokensOutput += log.tokens_output;
      const numCost = Number(log.cost) || 0;
      totalCost += numCost;

      // Group by prompt_name (fitur)
      const prompt = log.prompt_name || "Lainnya";
      if (!featureMap[prompt]) {
        featureMap[prompt] = { requests: 0, inputTokens: 0, outputTokens: 0, cost: 0 };
      }
      featureMap[prompt].requests += 1;
      featureMap[prompt].inputTokens += log.tokens_input;
      featureMap[prompt].outputTokens += log.tokens_output;
      featureMap[prompt].cost += numCost;

      // Group by provider
      const provKey = `${log.provider} (${log.model})`;
      if (!providerMap[provKey]) {
        providerMap[provKey] = { requests: 0, tokens: 0, cost: 0, model: log.model };
      }
      providerMap[provKey].requests += 1;
      providerMap[provKey].tokens += log.tokens_input + log.tokens_output;
      providerMap[provKey].cost += numCost;
    });

    // Format feature breakdown
    const totalTokensAll = totalTokensInput + totalTokensOutput;
    const featureBreakdown = Object.entries(featureMap).map(([name, data]) => {
      const featureTotalTokens = data.inputTokens + data.outputTokens;
      return {
        name,
        requests: data.requests,
        totalTokens: featureTotalTokens,
        avgTokenPerReq: data.requests > 0 ? Math.round(featureTotalTokens / data.requests) : 0,
        cost: data.cost,
        percentage: totalCost > 0 ? ((data.cost / totalCost) * 100).toFixed(1) + "%" : "0%",
      };
    }).sort((a, b) => b.cost - a.cost);

    // Format provider breakdown
    const providerBreakdown = Object.entries(providerMap).map(([name, data]) => ({
      name,
      model: data.model,
      requests: data.requests,
      tokens: data.tokens,
      cost: data.cost,
    }));

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalRequests,
          totalTokensInput,
          totalTokensOutput,
          totalTokens: totalTokensAll,
          totalCost,
          avgCostPerReq: totalRequests > 0 ? totalCost / totalRequests : 0,
          activeProvidersCount: providers.length,
        },
        featureBreakdown,
        providerBreakdown,
        providersList: providers.map((p) => ({
          name: p.name,
          alias: p.alias || "openai",
          model: p.model,
          endpointUrl: p.base_url,
          priority: p.priority,
        })),
      },
    });
  } catch (error: any) {
    console.error("[AI Usage API] GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data AI usage." },
      { status: 500 }
    );
  }
}
