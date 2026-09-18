import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@employr/db';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

async function getCandidateProvider() {
  const now = new Date();

  // 1. Cek pemetaan fitur spesifik di ai_feature_mappings
  try {
    const mapping = await (prisma as any).ai_feature_mappings.findUnique({
      where: { feature_key: 'system_intelligence' },
      include: { provider: true },
    });
    if (mapping?.provider && mapping.provider.is_active) {
      return mapping.provider;
    }
  } catch {}

  const activeProviders = await prisma.ai_providers.findMany({
    where: {
      is_active: true,
      OR: [{ cooldown_until: null }, { cooldown_until: { lte: now } }],
    },
    orderBy: { priority: 'desc' },
  });

  if (activeProviders.length > 0) return activeProviders[0];

  if (process.env.AI_API_KEY) {
    return {
      id: 'env-fallback',
      name: 'Env Fallback',
      base_url: (process.env.AI_ENDPOINT || 'https://api.openai.com/v1').replace(/\/+$/, ''),
      api_key: process.env.AI_API_KEY,
      model: process.env.AI_MODEL || 'gpt-4o-mini',
    };
  }

  return null;
}

/**
 * POST /api/system-intelligence/cluster
 * Menganalisis token kamus pembelajaran (cv_learning_dictionary) dan
 * menyatukan variasi sinonim/akronim/typo ke entitas kanonikal (Self-Learning Entity Resolution).
 */
export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get('category') || undefined;
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '60', 10), 150);

    // 1. Ambil token kamus yang sering muncul
    const tokens = await (prisma as any).cv_learning_dictionary.findMany({
      where: category ? { category } : undefined,
      orderBy: { frequency: 'desc' },
      take: limit,
      select: { id: true, category: true, value: true, frequency: true },
    });

    if (!tokens || tokens.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Tidak ada token di kamus untuk dikelompokkan.',
        clusters: [],
      });
    }

    const provider = await getCandidateProvider();
    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider AI belum dikonfigurasi di admin panel.' },
        { status: 500 }
      );
    }

    const prompt = `Berikut adalah daftar token kosakata yang diekstrak dari CV dan profil pengguna:
${JSON.stringify(tokens.map((t: any) => ({ category: t.category, value: t.value, freq: t.frequency })), null, 2)}

Tugasmu adalah melakukan ENTITY RESOLUTION & CLUSTERING:
1. Satukan token yang merupakan variasi penulisan, akronim, singkatan, casing berbeda, atau sinonim dari satu hal yang sama.
   Contoh: "Ihsanul Fikri", "ihsanul fikri", "IF", "SMA Ihsanul Fikri" -> Satukan ke canonical: "SMA IT Ihsanul Fikri".
   Contoh: "Dokter Gigi", "drg", "Dentist", "dokter gigi" -> Satukan ke canonical: "Dokter Gigi".
   Contoh: "React", "React.js", "ReactJS" -> Satukan ke canonical: "React".
2. Token yang memang berdiri sendiri dan tidak memiliki variasi lain tetap jadikan klaster 1 entitas.
3. Kembalikan HANYA format JSON valid tanpa tanda markdown codeblock:
[
  {
    "canonical": "Nama Standar Kanonikal",
    "category": "institution" | "position" | "skill" | "city",
    "aliases": ["variasi 1", "variasi 2"],
    "totalFrequency": number,
    "explanation": "Alasan pengelompokan singkat"
  }
]`;

    const endpoint = (provider.base_url || 'https://api.openai.com/v1').replace(/\/+$/, '');
    const model = provider.model || 'gpt-4o-mini';
    const res = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${provider.api_key}`,
        'api-key': provider.api_key,
      },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        messages: [
          {
            role: 'system',
            content: 'Kamu adalah master data ontologis dan NLP entity resolution specialist dalam bahasa Indonesia.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      const errTxt = await res.text();
      return NextResponse.json({ success: false, message: `AI Error: ${errTxt}` }, { status: 502 });
    }

    const aiData = await res.json();
    const rawAiText =
      aiData.choices?.[0]?.message?.content || aiData.choices?.[0]?.text || '';
    const cleanJson = rawAiText.replace(/^```[a-z]*\n/i, '').replace(/```$/g, '').trim();

    let clusters: any[] = [];
    try {
      clusters = JSON.parse(cleanJson);
    } catch {
      clusters = [];
    }

    // 2. Simpan atau perbarui graf alias kanonikal di system_settings
    if (Array.isArray(clusters) && clusters.length > 0) {
      const existingSettings = await prisma.system_settings.findUnique({
        where: { key: 'entity_alias_graph' },
      });

      let currentGraph: Record<string, any> = {};
      if (existingSettings?.value) {
        try {
          currentGraph = JSON.parse(existingSettings.value);
        } catch {}
      }

      clusters.forEach((c) => {
        if (c.canonical && Array.isArray(c.aliases)) {
          c.aliases.forEach((alias: string) => {
            currentGraph[alias.toLowerCase().trim()] = {
              canonical: c.canonical,
              category: c.category,
            };
          });
        }
      });

      await prisma.system_settings.upsert({
        where: { key: 'entity_alias_graph' },
        create: {
          id: crypto.randomUUID(),
          key: 'entity_alias_graph',
          value: JSON.stringify(currentGraph),
          group: 'nlp_intelligence',
          description: 'Graf pemetaan alias dan sinonim token ke entitas kanonikal',
          updated_at: new Date(),
        },
        update: {
          value: JSON.stringify(currentGraph),
          updated_at: new Date(),
        },
      });

      // Catat tuning suggestion di System Intelligence
      const suggestionKey = `tuning_cluster_${Date.now()}`;
      await prisma.system_settings.create({
        data: {
          id: crypto.randomUUID(),
          key: suggestionKey,
          value: JSON.stringify({
            title: `Penyatuan ${clusters.length} Klaster Kosakata Otomatis`,
            category: 'entity_resolution',
            affectedCount: tokens.length,
            status: 'APPROVED',
            appliedAt: new Date().toISOString(),
          }),
          group: 'tuning_suggestions',
          description: 'Otomatisasi pengelompokan sinonim/akronim NLP',
          updated_at: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil mengelompokkan ${tokens.length} token menjadi ${clusters.length} entitas kanonikal.`,
      clusters,
    });
  } catch (error: any) {
    console.error('[POST /api/system-intelligence/cluster] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memproses clustering token.' },
      { status: 500 }
    );
  }
}
