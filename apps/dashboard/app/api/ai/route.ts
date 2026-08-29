import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@cuti/db";
import { generateExactCacheKey, FIXED_MINI_SYSTEM_PROMPT } from "@/lib/nlp-pruner";
import { semanticCache } from "@/lib/semantic-cache";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, systemInstruction, model, promptName = "Custom AI Prompt", contextKey = "general", goal = "auto", role = "Professional", feature, task, temperature } = body;
    const resolvedFeatureKey = feature || task || (promptName.includes("Bullet") ? "bullet_optimizer" : contextKey === "copilot" ? "copilot" : contextKey === "ats_audit" ? "ats_audit" : contextKey === "cv_screener" ? "cv_screener" : null);

    if (!prompt) {
      return NextResponse.json({ error: "Prompt tidak boleh kosong" }, { status: 400 });
    }

    // 1. Exact Mode-Aware Cache Key Lookup -> hash(task + bullet + role + mode + language)
    const cacheKey = generateExactCacheKey({
      task: promptName,
      bullet: prompt,
      role,
      mode: goal,
      language: "id",
    });

    const cachedResponse = await semanticCache.get(cacheKey);

    if (cachedResponse) {
      return NextResponse.json({
        text: cachedResponse,
        cached: true,
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      });
    }

    // 2. Resolve Provider: Check Feature Mapping first, then highest priority active provider
    let aiEndpoint = (process.env.AI_ENDPOINT || "https://api.openai.com/v1").replace(/\/+$/, "");
    let aiApiKey = process.env.AI_API_KEY || "";
    let aiModel = model || process.env.AI_MODEL || "gpt-4o-mini";
    let providerName = "openai";
    let resolvedTemperature = typeof temperature === "number" ? temperature : 0.3;

    try {
      let resolvedProvider: any = null;

      // Check if this feature has a dedicated provider assigned by Admin
      if (resolvedFeatureKey && (prisma as any).ai_feature_mappings) {
        const mapping = await (prisma as any).ai_feature_mappings.findUnique({
          where: { feature_key: resolvedFeatureKey },
          include: { provider: true },
        });

        if (mapping?.provider && mapping.provider.is_active) {
          resolvedProvider = mapping.provider;
          if (typeof mapping.temperature === "number") {
            resolvedTemperature = mapping.temperature;
          }
        }
      }

      // Fallback to highest priority active provider
      if (!resolvedProvider) {
        resolvedProvider = await prisma.ai_providers.findFirst({
          where: { is_active: true },
          orderBy: { priority: "desc" },
        });
      }

      if (resolvedProvider) {
        aiEndpoint = resolvedProvider.base_url.replace(/\/+$/, "");
        aiApiKey = resolvedProvider.api_key;
        aiModel = model || resolvedProvider.model;
        providerName = resolvedProvider.alias || resolvedProvider.name || "custom_proxy";
      }
    } catch (dbErr) {
      console.warn("[AI Gateway] Gagal baca database ai_providers, fallback ke env:", dbErr);
    }

    if (!aiApiKey) {
      return NextResponse.json(
        { error: "API Key belum dikonfigurasi. Silakan atur Provider di Admin Panel (ai-config)." },
        { status: 500 }
      );
    }

    const url = `${aiEndpoint}/chat/completions`;
    const payload = {
      model: aiModel,
      temperature: resolvedTemperature,
      messages: [
        {
          role: "system",
          content: systemInstruction || FIXED_MINI_SYSTEM_PROMPT,
        },
        { role: "user", content: prompt },
      ],
      stream: false,
    };

    const startTime = performance.now();
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aiApiKey}`,
        "api-key": aiApiKey,
      },
      body: JSON.stringify(payload),
    });

    const endTime = performance.now();
    const durationMs = Math.round(endTime - startTime);

    const rawText = await res.text();
    let data: any = {};
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { rawText };
    }

    if (!res.ok) {
      let errorMsg = `HTTP ${res.status} ${res.statusText}`;
      if (res.status === 401) {
        errorMsg = "API Key tidak valid (401 Unauthorized). Periksa kembali konfigurasi API Key.";
      } else if (res.status === 404) {
        errorMsg = `Model '${payload.model}' atau endpoint '${url}' tidak ditemukan (404).`;
      } else if (data.error?.message) {
        errorMsg = data.error.message;
      }
      console.error("AI Route Error:", errorMsg);
      return NextResponse.json({ error: errorMsg }, { status: res.status });
    }

    const text =
      data.choices?.[0]?.message?.content ||
      data.choices?.[0]?.text ||
      data.text ||
      "";

    if (!text) {
      return NextResponse.json({ error: "Tidak ada teks jawaban yang dikembalikan dari AI." }, { status: 502 });
    }

    // Save successful LLM response into Semantic Cache
    semanticCache.set(cacheKey, prompt, text).catch(() => {});

    // Log usage into ai_usage_logs
    try {
      const usage = data.usage || {};
      const promptTokens = usage.prompt_tokens || Math.ceil(prompt.length / 4);
      const completionTokens = usage.completion_tokens || Math.ceil(text.length / 4);
      const estCost = ((promptTokens + completionTokens) / 1000) * 100;

      const defaultUser = await prisma.user.findFirst({ select: { id: true } });
      if (defaultUser) {
        await prisma.ai_usage_logs.create({
          data: {
            id: crypto.randomUUID(),
            user_id: defaultUser.id,
            provider: providerName,
            model: aiModel,
            prompt_name: promptName,
            tokens_input: promptTokens,
            tokens_output: completionTokens,
            cost: estCost,
            created_at: new Date(),
          },
        });
      }
    } catch (logErr) {
      console.warn("[AI Gateway] Gagal mencatat usage log:", logErr);
    }

    return NextResponse.json({ text, cached: false, usage: data.usage || null });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Terjadi kesalahan pada server AI";
    console.error("AI Route Error:", error);
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
