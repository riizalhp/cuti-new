import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@employr/db';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * Growth Content Studio API (Admin)
 * AI generation memakai provider yang sama dengan dashboard (/api/ai):
 * ai_feature_mappings -> ai_providers (priority) -> env fallback.
 */

async function getCandidateChain(featureKey: string) {
  const now = new Date();
  let activeProviders: any[] = [];
  try {
    activeProviders = await prisma.ai_providers.findMany({
      where: {
        is_active: true,
        OR: [
          { cooldown_until: null },
          { cooldown_until: { lte: now } },
        ],
      },
      orderBy: { priority: 'desc' },
    });
  } catch (e) {
    console.warn('[Growth Posts] Gagal baca ai_providers dari DB:', e);
  }

  const providerMap = new Map(activeProviders.map((p) => [p.id, p]));
  const chain: any[] = [];
  let temperature = 0.7;

  // Check custom chain assignment
  try {
    const [assignRecord, chainsRecord] = await Promise.all([
      prisma.system_settings.findUnique({ where: { key: 'ai_feature_chain_assignments' } }),
      prisma.system_settings.findUnique({ where: { key: 'ai_custom_chains' } }),
    ]);

    if (assignRecord?.value && chainsRecord?.value) {
      const assignments = JSON.parse(assignRecord.value);
      const chainId = assignments[featureKey];
      if (chainId) {
        const chains = JSON.parse(chainsRecord.value) as any[];
        const matched = chains.find((c) => c.id === chainId);
        if (matched && Array.isArray(matched.provider_ids)) {
          if (typeof matched.temperature === 'number') temperature = matched.temperature;
          for (const pid of matched.provider_ids) {
            const found = providerMap.get(pid);
            if (found) chain.push(found);
          }
        }
      }
    }
  } catch (e) {
    console.warn('[Growth Posts] Gagal resolve custom chain:', e);
  }

  if (chain.length === 0) {
    let assignedProvider: any = null;
    try {
      if ((prisma as any).ai_feature_mappings) {
        const mapping = await (prisma as any).ai_feature_mappings.findUnique({
          where: { feature_key: featureKey },
          include: { provider: true },
        });
        if (mapping?.provider?.is_active) {
          assignedProvider = mapping.provider;
          if (typeof mapping.temperature === 'number') temperature = mapping.temperature;
        }
      }
    } catch (e) {
      console.warn('[Growth Posts] Gagal baca ai_feature_mappings:', e);
    }

    if (assignedProvider) {
      chain.push(assignedProvider);
      for (const p of activeProviders) {
        if (p.id !== assignedProvider.id) chain.push(p);
      }
    } else {
      chain.push(...activeProviders);
    }
  }

  if (chain.length === 0 && process.env.AI_API_KEY) {
    chain.push({
      id: 'env-fallback',
      name: 'Env Fallback',
      alias: 'openai_env',
      base_url: (process.env.AI_ENDPOINT || 'https://api.openai.com/v1').replace(/\/+$/, ''),
      api_key: process.env.AI_API_KEY,
      model: process.env.AI_MODEL || 'gpt-4o-mini',
      priority: 0,
    });
  }

  return { chain, temperature };
}

async function callAI(featureKey: string, prompt: string, system: string) {
  const { chain, temperature } = await getCandidateChain(featureKey);
  if (chain.length === 0) {
    throw new Error('API Key AI belum dikonfigurasi. Atur Provider di menu AI Config.');
  }

  let lastError = 'Tidak ada provider AI yang berhasil merespons.';
  let successText = '';
  let successData: any = null;
  let successProviderName = 'custom_proxy';
  let successModel = 'gpt-4o-mini';

  for (const provider of chain) {
    const apiKey = provider.api_key;
    if (!apiKey) continue;

    const endpoint = (provider.base_url || 'https://api.openai.com/v1').replace(/\/+$/, '');
    const model = provider.model || 'gpt-4o-mini';
    const providerLabel = provider.alias || provider.name || 'custom_proxy';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const res = await fetch(`${endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'api-key': apiKey,
        },
        body: JSON.stringify({
          model,
          temperature,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: prompt },
          ],
          stream: false,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const raw = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(raw);
      } catch {
        data = { rawText: raw };
      }

      if (!res.ok) {
        lastError = `[${providerLabel}] HTTP ${res.status}: ${data?.error?.message || res.statusText}`;
        console.warn(`[Growth Studio Failover] ${lastError}. Mencoba node berikutnya...`);
        if (res.status === 429 && provider.id && !provider.id.startsWith('env-')) {
          prisma.ai_providers.update({
            where: { id: provider.id },
            data: { cooldown_until: new Date(Date.now() + 2 * 60 * 1000) },
          }).catch(() => {});
        }
        continue;
      }

      const text = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || data.text || '';
      if (!text) {
        lastError = `[${providerLabel}] Mengembalikan teks kosong`;
        continue;
      }

      successText = text;
      successData = data;
      successProviderName = providerLabel;
      successModel = model;
      break;
    } catch (err: any) {
      lastError = `[${providerLabel}] ${err.name === 'AbortError' ? 'Timeout 25s' : err.message}`;
      console.warn(`[Growth Studio Failover] ${lastError}. Mencoba node berikutnya...`);
      continue;
    }
  }

  if (!successText) {
    throw new Error(`Semua node AI gagal: ${lastError}`);
  }

  const text = successText;
  const data = successData || {};

  // Catat usage agar terpantau di menu AI Config & Usage
  try {
    const usage = data.usage || {};
    const promptTokens = usage.prompt_tokens || Math.ceil(prompt.length / 4);
    const completionTokens = usage.completion_tokens || Math.ceil(text.length / 4);
    const estCost = ((promptTokens + completionTokens) / 1000) * 100;
    await prisma.ai_usage_logs.create({
      data: {
        id: crypto.randomUUID(),
        user_id: null as any,
        provider: successProviderName,
        model: successModel,
        prompt_name: 'growth_content_studio',
        tokens_input: promptTokens,
        tokens_output: completionTokens,
        cost: estCost,
        created_at: new Date(),
      },
    });
  } catch {}

  return text;
}

export async function GET() {
  try {
    const rows = await prisma.growth_posts.findMany({
      orderBy: [{ status: 'asc' }, { created_at: 'desc' }],
      take: 200,
    });

    const data = rows.map((r) => ({
      id: r.id,
      account: r.account,
      platform: r.platform,
      contentType: r.content_type,
      hookType: r.hook_type,
      cta: r.cta,
      experimentId: r.experiment_id,
      campaignUtm: r.campaign_utm,
      ctaUrl: r.cta_url,
      content: r.content,
      status: r.status,
      publishedAt: r.published_at,
      metrics: {
        impressions: r.impressions,
        likes: r.likes,
        comments: r.comments,
        reposts: r.reposts,
        profileVisits: r.profile_visits,
        linkClicks: r.link_clicks,
      },
      metricsUpdatedAt: r.metrics_updated_at,
      createdAt: r.created_at,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[GET /api/growth/posts] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat post growth.' },
      { status: 500 }
    );
  }
}

const SYSTEM_PROMPT_GROWTH = `# System Prompt: Generator Konten Threads & LinkedIn (Human-Style)

Gunakan salah satu MODE di bawah sesuai platform target. Jangan campur gaya keduanya.

---

## MODE: THREADS

Kamu adalah penulis konten Threads yang nulis dengan gaya personal, nyeleneh, dan kerasa kayak orang beneran ngetik dari HP — bukan copywriter atau AI.

### Input yang akan kamu terima
- Topik/produk/insight yang mau disampaikan
- (Opsional) sudut pandang: personal story / observasi / hot take / promosi halus
- (Opsional) nada: santai, lucu, agak serius

### Aturan Struktur
1. Hook di baris pertama harus singkat, kuat, dan terasa spontan — bukan judul artikel. Boleh berupa pertanyaan random, pernyataan random, atau reaksi ("gila sih", "baru sadar...").
2. Panjang total 3-6 baris. Satu ide boleh nyambung 2 baris, jangan paksa satu baris = satu insight tertutup.
3. Variasikan panjang kalimat: selipkan minimal satu kalimat sangat pendek (2-5 kata) di antara kalimat yang lebih panjang.
4. Kalau ada CTA/promosi, taruh di baris terakhir, dengan nada seperti ngasih tau temen — bukan template ads ("Join waiting list", "Klik link di bio").
5. Ending boleh nggantung, berupa pertanyaan ringan, atau lelucon kecil — nggak harus nyimpulkan rapi.

### Aturan Diksi & Nada
- Pakai "gue/gw" atau "aku" (pilih salah satu, konsisten). Kalau brand/formal ringan, boleh "kita".
- Boleh pakai filler natural: "sih", "kok", "ya kan", "literally", "which is". Jangan lebih dari 2-3 per post.
- Hindari kata kerja abstrak-formal (meningkatkan, mengoptimalkan, memaksimalkan). Ganti ke frasa konkret sehari-hari.
- Boleh sedikit "kurang rapi" secara EYD: kapital di awal kalimat kadang di-skip, tanda baca nggak selalu sempurna.
- Selipkan minimal satu detail konkret/spesifik (angka, situasi nyata, momen tertentu) — jangan generalisasi abstrak.

### DILARANG (bikin kerasa AI)
- Tanda "=" untuk menyimpulkan ("A = masalah besar")
- Struktur Masalah → Solusi → CTA yang rapi dan simetris
- Kalimat-kalimat sejajar/paralel yang terlalu tertib
- Kata sambung logis eksplisit berlebihan (karena, sehingga, akibatnya)
- Semua kalimat gramatikal sempurna tanpa variasi
- Hashtag lebih dari 0-1

---

## MODE: LINKEDIN

Kamu adalah penulis konten LinkedIn yang nulis gaya "professional storytelling" — vulnerable tapi tetap capable, personal tapi tetap kerasa kompeten.

### Input yang akan kamu terima
- Topik/insight/pengalaman yang mau disampaikan
- (Opsional) angle: lesson learned / cerita kegagalan-ke-growth / observasi industri / pengumuman
- (Opsional) nada: reflektif, motivasional, to-the-point

### Aturan Struktur
1. Hook 1-2 baris pertama harus bikin orang klik "...more" — bisa berupa pernyataan berani, angka mengejutkan, atau potongan cerita personal.
2. Struktur umum: hook → jeda → cerita/observasi singkat (2-4 baris) → jeda → insight/pelajaran (1-3 baris) → jeda → closing reflektif atau CTA halus.
3. Paragraf super pendek. Idealnya 1 kalimat per baris, dengan banyak jeda baris kosong (whitespace).
4. Kalau membahas kegagalan/insecurity, harus dibingkai jadi pembelajaran — bukan curhat murni tanpa arah.
5. Boleh pakai angka/list ringan ("3 hal yang saya pelajari...") tapi isi tiap poin harus konkret, bukan generic advice.

### Aturan Diksi & Nada
- Gunakan "saya", nada semi-formal tapi tetap personal (bukan bahasa korporat kaku).
- Hindari jargon bisnis berlebihan (leverage, synergy, ekosistem, disrupsi) kecuali memang relevan dan natural.
- Detail personal wajib spesifik: nama situasi, angka, waktu — bukan "banyak orang mengalami..." atau "di era digital ini...".
- Closing sebaiknya pertanyaan reflektif ke pembaca, atau ajakan diskusi — bukan CTA jualan langsung kecuali memang post promosi.
- Hashtag 3-5 di akhir, relevan ke industri/topik, bukan hashtag generic (#motivation #success).

### DILARANG (bikin kerasa AI)
- Paragraf padat tanpa jeda baris
- Opening template ("Di dunia kerja yang semakin kompetitif...", "Pernahkah Anda berpikir...")
- Insight yang terlalu rapi/generic tanpa detail personal pendukung
- Struktur simetris berlebihan antar poin list
- Nada terlalu formal/kaku seperti press release

---

## CHECKLIST WAJIB SEBELUM OUTPUT FINAL

Sebelum kasih output ke user, cek ulang draft dengan pertanyaan ini:

1. Apakah ada tanda "=" atau gaya bullet-compression yang kedengaran seperti slide? → hapus/ubah.
2. Apakah semua kalimat panjangnya mirip-mirip (ritme rata)? → variasikan.
3. Apakah ada minimal 1 detail konkret/spesifik (bukan generalisasi)? Kalau belum ada, tambahkan.
4. Apakah CTA (kalau ada) kedengaran seperti orang ngobrol, bukan template marketing? → revisi kalau masih kaku.
5. Apakah strukturnya terlalu simetris/rapi (problem-solution-cta dalam pola sama persis)? → acak sedikit urutannya atau tambah transisi personal.
6. Apakah ada kata sambung logis berlebihan (karena, sehingga, akibatnya, oleh karena itu)? → kurangi, biarkan logika implisit.
7. Kalau dibaca keras-keras, apakah kedengaran seperti orang beneran ngomong, atau kayak ringkasan AI? Kalau masih kerasa "ringkasan", tulis ulang dengan lebih banyak "muter" sebelum sampai ke poin.

---

## FORMAT OUTPUT

Setiap kali generate, keluarkan:
1. **Draft final** (siap post, sudah lolos checklist di atas)
2. (Opsional, kalau diminta) 1-2 alternatif dengan angle/nada berbeda untuk dibandingkan

Jangan tampilkan proses checklist ke user — itu proses internal sebelum menghasilkan draft final.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Mode generate: panggil AI, jangan simpan dulu
    if (body.action === 'generate') {
      const {
        account,
        platform,
        contentType,
        hookType,
        topic,
        cta,
        angle,
        tone,
        includeAlternatives = true,
      } = body;

      const targetPlatform = platform === 'LINKEDIN' ? 'LINKEDIN' : 'THREADS';

      const accountPerspective =
        account === 'PERSONAL'
          ? 'Tulis dari sudut pandang founder personal (build in public, cerita nyata, trust & human story).'
          : 'Tulis dari akun brand Employr (solutif, relatable bagi pencari kerja Indonesia).';

      let hookInstruction = '';
      if (targetPlatform === 'THREADS') {
        if (hookType === 'QUESTION') {
          hookInstruction = 'Hook WAJIB berupa pertanyaan random/spontan di baris pertama (singkat & menohok).';
        } else if (hookType === 'REACTION') {
          hookInstruction = 'Hook WAJIB berupa reaksi spontan ("gila sih", "baru sadar...", "plot twist: ...").';
        } else {
          hookInstruction = 'Hook WAJIB berupa pernyataan/observasi singkat dan tajam (bukan judul artikel).';
        }
      } else {
        if (hookType === 'QUESTION') {
          hookInstruction = 'Hook 1-2 baris pertama berupa pertanyaan reflektif yang membuat penasaran klik "...more".';
        } else if (hookType === 'STORY') {
          hookInstruction = 'Hook 1-2 baris pertama berupa potongan cerita personal/kejadian spesifik yang memancing klik "...more".';
        } else {
          hookInstruction = 'Hook 1-2 baris pertama berupa pernyataan berani / angka konkret yang membuat orang klik "...more".';
        }
      }

      const activeAngle = angle || contentType || 'observasi';
      const activeTone = tone || (targetPlatform === 'THREADS' ? 'santai' : 'reflektif');

      const systemPrompt = `${SYSTEM_PROMPT_GROWTH}\n\n---\nTarget platform aktif: MODE: ${targetPlatform}. Patuhi aturan MODE ini 100%, jangan gunakan gaya platform lain.`;

      const userPrompt = `Buatkan konten sosial media untuk target platform: ${targetPlatform}
Aktifkan MODE: ${targetPlatform}.

Data input:
- Topik / Pesan Inti: ${topic}
- Sudut Pandang / Angle: ${activeAngle}
- Nada: ${activeTone}
- Preferensi Hook: ${hookInstruction}
- Perspektif Akun: ${accountPerspective}
- CTA / Ajakan: ${cta ? `${cta} (Catatan: sampaikan secara santai/natural seperti ngobrol, jangan template iklan kaku)` : 'Tanpa CTA jualan langsung'}

${includeAlternatives ? 'Tolong buatkan 1 DRAFT_FINAL siap post dan 1-2 ALTERNATIF variasi dengan sudut pandang/nada berbeda.' : 'Tolong buatkan 1 DRAFT_FINAL siap post.'}

PENTING:
- Jalankan internal checklist sebelum mengeluarkan draft. Pastikan anti-slop: tidak ada tanda "=", tidak ada kalimat yang terlalu tertib/simetris, ada detail spesifik.
- DILARANG menampilkan checklist internal ke respon.
- Kembalikan format persis seperti di bawah:

DRAFT_FINAL:
<isi draft final siap post>

${includeAlternatives ? `ALTERNATIF_1:
<isi alternatif 1>

ALTERNATIF_2:
<isi alternatif 2>` : ''}

URL_CTA: <satu URL CTA pendek yang relevan jika ada, atau kosongkan>`;

      const text = await callAI('growth_content_studio', userPrompt, systemPrompt);

      // Parse output
      const draftFinalMatch = text.match(/DRAFT_FINAL:\s*([\s\S]*?)(?=(?:ALTERNATIF_\d+:|URL_CTA:|$))/i);
      const alt1Match = text.match(/ALTERNATIF_1:\s*([\s\S]*?)(?=(?:ALTERNATIF_2:|URL_CTA:|$))/i);
      const alt2Match = text.match(/ALTERNATIF_2:\s*([\s\S]*?)(?=(?:URL_CTA:|$))/i);
      const urlMatch = text.match(/URL_CTA:\s*(\S+)/i);

      let content = (draftFinalMatch?.[1] || '').trim();
      if (!content) {
        content = text.replace(/URL_CTA:[\s\S]*$/i, '').trim();
      }

      const alternatives: string[] = [];
      if (alt1Match?.[1]?.trim()) alternatives.push(alt1Match[1].trim());
      if (alt2Match?.[1]?.trim()) alternatives.push(alt2Match[1].trim());

      const ctaUrl = urlMatch?.[1]?.trim() || '';

      return NextResponse.json({
        success: true,
        data: {
          content,
          ctaUrl,
          alternatives,
        },
      });
    }

    // Mode simpan
    const created = await prisma.growth_posts.create({
      data: {
        id: crypto.randomUUID(),
        account: body.account === 'EMPLOYR' ? 'EMPLOYR' : 'PERSONAL',
        platform: body.platform === 'LINKEDIN' ? 'LINKEDIN' : 'THREADS',
        content_type: body.contentType || 'Educational',
        hook_type: body.hookType === 'STATEMENT' ? 'STATEMENT' : 'QUESTION',
        cta: body.cta || null,
        experiment_id: body.experimentId || null,
        campaign_utm: body.campaignUtm || body.experimentId || null,
        cta_url: body.ctaUrl || null,
        content: body.content,
        status: 'DRAFT',
      },
    });

    return NextResponse.json({ success: true, data: { id: created.id } });
  } catch (error: any) {
    console.error('[POST /api/growth/posts] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memproses post growth.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, message: 'id wajib diisi.' }, { status: 400 });
    }

    const data: Record<string, any> = {};
    if (body.action === 'publish') {
      data.status = 'PUBLISHED';
      data.published_at = new Date();
    } else if (body.action === 'updateMetrics') {
      const m = body.metrics || {};
      if (typeof m.impressions === 'number') data.impressions = Math.max(0, Math.round(m.impressions));
      if (typeof m.likes === 'number') data.likes = Math.max(0, Math.round(m.likes));
      if (typeof m.comments === 'number') data.comments = Math.max(0, Math.round(m.comments));
      if (typeof m.reposts === 'number') data.reposts = Math.max(0, Math.round(m.reposts));
      if (typeof m.profileVisits === 'number') data.profile_visits = Math.max(0, Math.round(m.profileVisits));
      if (typeof m.linkClicks === 'number') data.link_clicks = Math.max(0, Math.round(m.linkClicks));
      data.metrics_updated_at = new Date();
    } else if (body.action === 'update') {
      if (typeof body.content === 'string') data.content = body.content;
      if (typeof body.cta === 'string') data.cta = body.cta;
      if (typeof body.ctaUrl === 'string') data.cta_url = body.ctaUrl;
      if (typeof body.experimentId === 'string') data.experiment_id = body.experimentId;
    } else {
      return NextResponse.json({ success: false, message: 'action tidak dikenal.' }, { status: 400 });
    }

    await prisma.growth_posts.update({ where: { id: body.id }, data });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[PATCH /api/growth/posts] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui post growth.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'id wajib diisi.' }, { status: 400 });
    }
    await prisma.growth_posts.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[DELETE /api/growth/posts] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus post growth.' },
      { status: 500 }
    );
  }
}
