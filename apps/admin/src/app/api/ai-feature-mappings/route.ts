import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@cuti/db";

export const DEFAULT_AI_FEATURES = [
  {
    feature_key: "cv_parser",
    feature_name: "Import & Ekstraksi CV (Onboarding)",
    description: "Mengekstrak teks mentah PDF/DOCX menjadi JSON terstruktur lengkap.",
    default_temp: 0.1,
    default_max_tokens: 2500,
  },
  {
    feature_key: "bullet_optimizer",
    feature_name: "Bullet Point Optimizer (CV Builder)",
    description: "Merapikan dan meningkatkan kualitas bullet point pengalaman kerja.",
    default_temp: 0.3,
    default_max_tokens: 400,
  },
  {
    feature_key: "copilot",
    feature_name: "AI Career Copilot / Chat Drawer",
    description: "Konsultasi interaktif karier, interview prep, dan tanya-jawab CV.",
    default_temp: 0.7,
    default_max_tokens: 1200,
  },
  {
    feature_key: "ats_audit",
    feature_name: "Deep ATS Audit & Job Match",
    description: "Analisis mendalam skor ATS dan pencocokan kualifikasi pekerjaan.",
    default_temp: 0.2,
    default_max_tokens: 1500,
  },
  {
    feature_key: "linkedin_analyzer",
    feature_name: "LinkedIn Profile Analyzer",
    description: "Evaluasi dan saran optimasi headline & summary profil LinkedIn.",
    default_temp: 0.4,
    default_max_tokens: 1500,
  },
  {
    feature_key: "cv_screener",
    feature_name: "AI CV Screener & Recruiter Simulation",
    description: "Simulasi screening recruiter 6 detik, multi-screener konsensus, ATS matrix, dan perbaikan otomatis.",
    default_temp: 0.3,
    default_max_tokens: 2500,
  },
];

export async function GET() {
  try {
    // 1. Fetch all registered providers
    const providers = await prisma.ai_providers.findMany({
      orderBy: { priority: "desc" },
    });

    // 2. Fetch existing mappings (with graceful fallback if table not yet initialized)
    let mappings: any[] = [];
    try {
      if ((prisma as any).ai_feature_mappings) {
        mappings = await (prisma as any).ai_feature_mappings.findMany({
          include: { provider: true },
        });
      }
    } catch (e) {
      console.warn("[ai-feature-mappings] Reading table failed, using defaults:", e);
    }

    const mappingMap = new Map(mappings.map((m: any) => [m.feature_key, m]));

    // 3. Merge with default standard features
    const featureList = DEFAULT_AI_FEATURES.map((def) => {
      const existing = mappingMap.get(def.feature_key);
      return {
        feature_key: def.feature_key,
        feature_name: def.feature_name,
        description: def.description,
        provider_id: existing?.provider_id || null,
        provider: existing?.provider || null,
        temperature: existing?.temperature ?? def.default_temp,
        max_tokens: existing?.max_tokens ?? def.default_max_tokens,
        is_active: existing?.is_active ?? true,
      };
    });

    return NextResponse.json({
      features: featureList,
      providers: providers.map((p) => ({
        id: p.id,
        name: p.name,
        label: p.label,
        alias: p.alias || p.name,
        model: p.model,
        is_active: p.is_active,
        priority: p.priority,
      })),
    });
  } catch (error: any) {
    console.error("[GET /api/ai-feature-mappings] Error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data pemetaan fitur AI" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { feature_key, provider_id, temperature, max_tokens, is_active } = body;

    if (!feature_key) {
      return NextResponse.json(
        { error: "feature_key wajib diisi" },
        { status: 400 }
      );
    }

    const standardDef = DEFAULT_AI_FEATURES.find((f) => f.feature_key === feature_key);
    const feature_name = standardDef?.feature_name || feature_key;

    if ((prisma as any).ai_feature_mappings) {
      const updated = await (prisma as any).ai_feature_mappings.upsert({
        where: { feature_key },
        create: {
          feature_key,
          feature_name,
          provider_id: provider_id || null,
          temperature: typeof temperature === "number" ? temperature : 0.2,
          max_tokens: typeof max_tokens === "number" ? max_tokens : 2000,
          is_active: is_active !== undefined ? is_active : true,
          updated_at: new Date(),
        },
        update: {
          provider_id: provider_id || null,
          temperature: typeof temperature === "number" ? temperature : 0.2,
          max_tokens: typeof max_tokens === "number" ? max_tokens : 2000,
          is_active: is_active !== undefined ? is_active : true,
          updated_at: new Date(),
        },
      });

      return NextResponse.json({ success: true, mapping: updated });
    }

    return NextResponse.json({ success: true, message: "Mapping tersimpan" });
  } catch (error: any) {
    console.error("[PUT /api/ai-feature-mappings] Error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memperbarui pemetaan fitur AI" },
      { status: 500 }
    );
  }
}
