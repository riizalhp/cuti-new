import { prisma } from "@employr/db";
import crypto from "crypto";
import { generateExactCacheKey, FIXED_MINI_SYSTEM_PROMPT } from "@/lib/nlp-pruner";
import { semanticCache } from "@/lib/semantic-cache";

const MODEL_COST_PER_1K: Record<string, number> = {
  "gpt-4o-mini": 12,
  "gpt-4.1-mini": 12,
  "gpt-4.1-nano": 6,
  "gpt-4o": 120,
  "gpt-4.1": 60,
  "o4-mini": 30,
};

export interface CallAiGatewayOptions {
  prompt: string;
  feature?: string;
  promptName?: string;
  systemPrompt?: string;
  temperature?: number;
  role?: string;
  goal?: string;
  userId?: string;
  bypassCache?: boolean;
}

export interface CallAiGatewayResult {
  text: string;
  cached: boolean;
  model?: string;
  provider?: string;
}

/**
 * Executes a resilient AI call with multi-provider failover, semantic caching, and usage tracking.
 */
export async function callAiGateway(options: CallAiGatewayOptions): Promise<CallAiGatewayResult | null> {
  const {
    prompt,
    feature,
    promptName = "Custom AI Task",
    systemPrompt,
    temperature,
    role = "Professional",
    goal = "auto",
    userId,
    bypassCache = false,
  } = options;

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return null;
  }

  const resolvedFeatureKey = feature || null;
  let resolvedTemperature = typeof temperature === "number" ? Math.min(Math.max(temperature, 0), 1) : 0.3;
  let resolvedSystemPrompt =
    typeof systemPrompt === "string" && systemPrompt.trim().length > 0
      ? systemPrompt.trim()
      : FIXED_MINI_SYSTEM_PROMPT;

  // 1. Resolve System Prompt from DB if available
  try {
    if (resolvedFeatureKey && (prisma as any).ai_prompts) {
      const dbPrompt = await (prisma as any).ai_prompts.findFirst({
        where: { name: resolvedFeatureKey, is_active: true },
        orderBy: { version: "desc" },
      });
      if (dbPrompt?.prompt) {
        resolvedSystemPrompt = dbPrompt.prompt;
      }
    }
  } catch (promptErr) {
    console.warn("[AI Gateway] Gagal baca ai_prompts:", promptErr);
  }

  // 2. Cache Lookup
  const cacheKey = generateExactCacheKey({
    task: promptName,
    bullet: prompt,
    role,
    mode: goal,
    language: "id",
    feature: resolvedFeatureKey || undefined,
    systemPrompt: resolvedSystemPrompt,
  });

  if (!bypassCache) {
    const cachedResponse = await semanticCache.get(cacheKey);
    if (cachedResponse) {
      return {
        text: cachedResponse,
        cached: true,
        model: "semantic-cache",
        provider: "cache",
      };
    }
  }

  // 3. Resolve active providers & custom chains
  const now = new Date();
  let activeProviders: any[] = [];
  try {
    activeProviders = await prisma.ai_providers.findMany({
      where: {
        is_active: true,
        OR: [{ cooldown_until: null }, { cooldown_until: { lte: now } }],
      },
      orderBy: { priority: "desc" },
    });
  } catch (dbErr) {
    console.warn("[AI Gateway] Gagal baca database ai_providers:", dbErr);
  }

  const providerMap = new Map(activeProviders.map((p) => [p.id, p]));
  const candidateChain: any[] = [];

  try {
    if (resolvedFeatureKey) {
      const [assignRecord, chainsRecord] = await Promise.all([
        prisma.system_settings.findUnique({ where: { key: "ai_feature_chain_assignments" } }),
        prisma.system_settings.findUnique({ where: { key: "ai_custom_chains" } }),
      ]);

      if (assignRecord?.value && chainsRecord?.value) {
        const assignments = JSON.parse(assignRecord.value);
        const chainId = assignments[resolvedFeatureKey];
        if (chainId) {
          const chains = JSON.parse(chainsRecord.value) as any[];
          const matchedChain = chains.find((c) => c.id === chainId);
          if (matchedChain && Array.isArray(matchedChain.provider_ids)) {
            if (typeof matchedChain.temperature === "number") {
              resolvedTemperature = matchedChain.temperature;
            }
            for (const pid of matchedChain.provider_ids) {
              const found = providerMap.get(pid);
              if (found) candidateChain.push(found);
            }
          }
        }
      }
    }
  } catch (chainErr) {
    console.warn("[AI Gateway] Gagal resolve custom chain:", chainErr);
  }

  // Fallback to ai_feature_mappings
  if (candidateChain.length === 0) {
    let assignedProvider: any = null;
    try {
      if (resolvedFeatureKey && (prisma as any).ai_feature_mappings) {
        const mapping = await (prisma as any).ai_feature_mappings.findUnique({
          where: { feature_key: resolvedFeatureKey },
          include: { provider: true },
        });

        if (mapping?.provider && mapping.provider.is_active) {
          assignedProvider = mapping.provider;
          if (typeof mapping.temperature === "number") {
            resolvedTemperature = mapping.temperature;
          }
        }
      }
    } catch (mapErr) {
      console.warn("[AI Gateway] Gagal baca ai_feature_mappings:", mapErr);
    }

    if (assignedProvider) {
      candidateChain.push(assignedProvider);
      for (const p of activeProviders) {
        if (p.id !== assignedProvider.id) candidateChain.push(p);
      }
    } else {
      candidateChain.push(...activeProviders);
    }
  }

  // Fallback to process.env
  if (candidateChain.length === 0 && process.env.AI_API_KEY) {
    candidateChain.push({
      id: "env-fallback",
      name: "Env Fallback",
      alias: "openai_env",
      base_url: (process.env.AI_ENDPOINT || "https://api.openai.com/v1").replace(/\/+$/, ""),
      api_key: process.env.AI_API_KEY,
      model: process.env.AI_MODEL || "gpt-4o-mini",
      priority: 0,
    });
  }

  if (candidateChain.length === 0) {
    console.error("[AI Gateway] Tidak ada provider AI yang tersedia atau terkonfigurasi.");
    return null;
  }

  // 4. Iterate failover chain
  let successResult: {
    text: string;
    usage: any;
    providerName: string;
    modelName: string;
    costPer1k: number;
  } | null = null;
  let lastErrorMsg = "";

  for (const currentProvider of candidateChain) {
    const apiKey = currentProvider.api_key;
    if (!apiKey) continue;

    const endpoint = (currentProvider.base_url || "https://api.openai.com/v1").replace(/\/+$/, "");
    const model = currentProvider.model || "gpt-4o-mini";
    const url = `${endpoint}/chat/completions`;
    const providerLabel = currentProvider.alias || currentProvider.name || "custom_proxy";

    const payload = {
      model,
      temperature: resolvedTemperature,
      messages: [
        { role: "system", content: resolvedSystemPrompt },
        { role: "user", content: prompt },
      ],
      stream: false,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "api-key": apiKey,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const rawText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        data = { rawText };
      }

      if (!res.ok) {
        lastErrorMsg = `[${providerLabel}] HTTP ${res.status}: ${data?.error?.message || res.statusText}`;
        if (res.status === 429 && currentProvider.id && !currentProvider.id.startsWith("env-")) {
          prisma.ai_providers.update({
            where: { id: currentProvider.id },
            data: { cooldown_until: new Date(Date.now() + 2 * 60 * 1000) },
          }).catch(() => {});
        }
        continue;
      }

      const text =
        data.choices?.[0]?.message?.content ||
        data.choices?.[0]?.text ||
        data.text ||
        "";

      if (!text || text.trim().length === 0) {
        lastErrorMsg = `[${providerLabel}] Mengembalikan respons kosong.`;
        continue;
      }

      const modelRate =
        MODEL_COST_PER_1K[model.toLowerCase()] ??
        (/mini|nano|flash|haiku/.test(model.toLowerCase()) ? 15 : 100);
      const costPer1kTokens =
        typeof currentProvider.cost_per_1k_tokens === "number"
          ? currentProvider.cost_per_1k_tokens
          : modelRate;

      successResult = {
        text,
        usage: data.usage || null,
        providerName: providerLabel,
        modelName: model,
        costPer1k: costPer1kTokens,
      };
      break;
    } catch (nodeErr: any) {
      lastErrorMsg = `[${providerLabel}] ${nodeErr.name === "AbortError" ? "Timeout 25s" : nodeErr.message}`;
      continue;
    }
  }

  if (!successResult) {
    console.error("[AI Gateway Failover Exhausted]:", lastErrorMsg);
    return null;
  }

  // Cache response
  semanticCache.set(cacheKey, prompt, successResult.text).catch(() => {});

  // Log usage
  if (userId && !userId.startsWith("dev-") && !userId.startsWith("client-")) {
    try {
      const usage = successResult.usage || {};
      const promptTokens = usage.prompt_tokens || Math.ceil(prompt.length / 4);
      const completionTokens = usage.completion_tokens || Math.ceil(successResult.text.length / 4);
      const estCost = ((promptTokens + completionTokens) / 1000) * successResult.costPer1k;

      await prisma.ai_usage_logs.create({
        data: {
          id: crypto.randomUUID(),
          user_id: userId,
          provider: successResult.providerName,
          model: successResult.modelName,
          prompt_name: promptName,
          tokens_input: promptTokens,
          tokens_output: completionTokens,
          cost: estCost,
          created_at: new Date(),
        },
      });
    } catch (logErr) {
      console.warn("[AI Gateway] Gagal mencatat usage log:", logErr);
    }
  }

  return {
    text: successResult.text,
    cached: false,
    model: successResult.modelName,
    provider: successResult.providerName,
  };
}
