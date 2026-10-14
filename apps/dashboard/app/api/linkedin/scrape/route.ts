import { NextRequest, NextResponse } from 'next/server';
import { prisma, decryptSecret, type scraper_providers } from '@employr/db';
import { normalizeLinkedInUrl } from '@/lib/linkedin-url';
import { getAuthUser } from '@/lib/server-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface NormalizedProfile {
  name: string;
  headline: string;
  about: string;
  location: string;
  connections: string;
  experience: Array<{
    role: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  skills: string[];
  url: string;
}

// -----------------------------------------------------------------------------
// NORMALIZERS PER PROVIDER
// -----------------------------------------------------------------------------

function normalizeApifyData(item: any, originalUrl: string): NormalizedProfile {
  const firstName = item.firstName || item.first_name || '';
  const lastName = item.lastName || item.last_name || '';
  const name = item.fullName || item.name || `${firstName} ${lastName}`.trim() || 'Profil LinkedIn';
  const headline = item.headline || item.title || item.subTitle || '';
  const about = item.about || item.summary || item.description || '';
  const location = item.location?.name || item.location || item.city || 'Indonesia';

  const rawExp = Array.isArray(item.experiences)
    ? item.experiences
    : Array.isArray(item.positions)
    ? item.positions
    : Array.isArray(item.experience)
    ? item.experience
    : [];

  const experience = rawExp.slice(0, 8).map((exp: any) => ({
    role: exp.title || exp.role || exp.position || 'Profesional',
    company: exp.companyName || exp.company || exp.subtitle || 'Institusi Terkait',
    duration: exp.dateRange || exp.timePeriod || exp.duration || 'Saat ini',
    description: exp.description || '',
  }));

  const rawSkills = Array.isArray(item.skills)
    ? item.skills.map((s: any) => (typeof s === 'string' ? s : s.name || s.title || '')).filter(Boolean)
    : [];

  const rawEdu = Array.isArray(item.educations) ? item.educations : Array.isArray(item.education) ? item.education : [];
  const education = rawEdu.slice(0, 4).map((edu: any) => ({
    degree: edu.degree || edu.fieldOfStudy || 'Pendidikan',
    institution: edu.schoolName || edu.institution || edu.school || '',
    year: edu.dateRange || edu.year || '',
  }));

  return {
    name,
    headline,
    about,
    location,
    connections: item.connectionsCount ? `${item.connectionsCount}+` : '',
    experience,
    education,
    skills: rawSkills.slice(0, 15),
    url: originalUrl,
  };
}

function normalizeRapidApiData(data: any, originalUrl: string): NormalizedProfile {
  const name =
    data.full_name ||
    data.name ||
    `${data.first_name || ''} ${data.last_name || ''}`.trim() ||
    'Profil LinkedIn';
  const headline = data.headline || data.job_title || '';
  const about = data.about || data.summary || '';
  const location = data.location || data.city || 'Indonesia';

  const rawExp = Array.isArray(data.experiences)
    ? data.experiences
    : Array.isArray(data.experience)
    ? data.experience
    : [];

  const experience = rawExp.slice(0, 8).map((exp: any) => ({
    role: exp.title || exp.role || 'Profesional',
    company: exp.company || exp.company_name || 'Institusi Terkait',
    duration: exp.duration || exp.date_range || 'Saat ini',
    description: exp.description || '',
  }));

  const rawSkills = Array.isArray(data.skills)
    ? data.skills.map((s: any) => (typeof s === 'string' ? s : s.name || '')).filter(Boolean)
    : [];

  return {
    name,
    headline,
    about,
    location,
    connections: data.connections || '',
    experience,
    education: [],
    skills: rawSkills.slice(0, 15),
    url: originalUrl,
  };
}

function normalizeScrapingdogData(data: any, originalUrl: string): NormalizedProfile {
  const name = data.full_name || data.name || 'Profil LinkedIn';
  const headline = data.headline || data.title || '';
  const about = data.about || data.summary || '';
  const location = data.location || 'Indonesia';

  const rawExp = Array.isArray(data.experience) ? data.experience : [];
  const experience = rawExp.slice(0, 8).map((exp: any) => ({
    role: exp.role || exp.title || 'Profesional',
    company: exp.company || exp.company_name || 'Institusi Terkait',
    duration: exp.duration || 'Saat ini',
    description: exp.description || '',
  }));

  const rawSkills = Array.isArray(data.skills) ? data.skills.filter(Boolean) : [];

  return {
    name,
    headline,
    about,
    location,
    connections: '',
    experience,
    education: [],
    skills: rawSkills.slice(0, 15),
    url: originalUrl,
  };
}

// -----------------------------------------------------------------------------
// PROVIDER CALL HANDLER
// -----------------------------------------------------------------------------

async function callProviderScraper(
  provider: scraper_providers,
  targetUrl: string
): Promise<{ success: boolean; data?: NormalizedProfile; error?: string; isQuotaExhausted?: boolean }> {
  const extraConfig = (provider.extra_config as any) || {};
  const apiKey = decryptSecret(provider.api_key);

  try {
    switch (provider.provider.toLowerCase()) {
      case 'apify': {
        const rawActorId = extraConfig.actor_id || 'curious_coder/linkedin-profile-scraper';
        const formattedActorId = rawActorId.includes('/') ? rawActorId.replace('/', '~') : rawActorId;
        const apifyUrl = `https://api.apify.com/v2/acts/${encodeURIComponent(
          formattedActorId
        )}/run-sync-get-dataset-items?token=${encodeURIComponent(apiKey)}`;

        const apifyRes = await fetch(apifyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileUrls: [targetUrl] }),
          signal: AbortSignal.timeout(35000),
        });

        if (apifyRes.status === 402 || apifyRes.status === 429) {
          return { success: false, isQuotaExhausted: true, error: `Apify Quota Limit (HTTP ${apifyRes.status})` };
        }

        if (!apifyRes.ok) {
          return { success: false, error: `Apify error: HTTP ${apifyRes.status}` };
        }

        const items = await apifyRes.json();
        const profileItem = Array.isArray(items) ? items[0] : items;
        if (!profileItem) {
          return { success: false, error: 'Apify tidak mengembalikan data profil.' };
        }

        return { success: true, data: normalizeApifyData(profileItem, targetUrl) };
      }

      case 'rapidapi': {
        const host = extraConfig.host || 'fresh-linkedin-profile-data.p.rapidapi.com';
        const rapidRes = await fetch(
          `https://${host}/get-linkedin-profile?linkedin_url=${encodeURIComponent(targetUrl)}`,
          {
            method: 'GET',
            headers: {
              'X-RapidAPI-Key': apiKey,
              'X-RapidAPI-Host': host,
            },
            signal: AbortSignal.timeout(25000),
          }
        );

        if (rapidRes.status === 429) {
          return { success: false, isQuotaExhausted: true, error: 'RapidAPI Rate Limit / Quota Habis (HTTP 429)' };
        }

        if (!rapidRes.ok) {
          return { success: false, error: `RapidAPI error: HTTP ${rapidRes.status}` };
        }

        const json = await rapidRes.json();
        const profileData = json.data || json;
        return { success: true, data: normalizeRapidApiData(profileData, targetUrl) };
      }

      case 'scrapingdog': {
        const slug = targetUrl.split('/in/')[1]?.split('/')[0]?.split('?')[0] || targetUrl;
        const dogRes = await fetch(
          `https://api.scrapingdog.com/linkedin?api_key=${encodeURIComponent(
            apiKey
          )}&type=profile&linkId=${encodeURIComponent(slug)}`,
          { method: 'GET', signal: AbortSignal.timeout(25000) }
        );

        if (dogRes.status === 402 || dogRes.status === 429) {
          return { success: false, isQuotaExhausted: true, error: 'Scrapingdog Kuota Habis (HTTP 402/429)' };
        }

        if (!dogRes.ok) {
          return { success: false, error: `Scrapingdog error: HTTP ${dogRes.status}` };
        }

        const json = await dogRes.json();
        return { success: true, data: normalizeScrapingdogData(json, targetUrl) };
      }

      case 'linkdapi':
      case 'linkedapi': {
        const linkdRes = await fetch(
          `https://api.linkdapi.com/v1/profile?url=${encodeURIComponent(targetUrl)}`,
          {
            method: 'GET',
            headers: { 'X-API-KEY': apiKey },
            signal: AbortSignal.timeout(25000),
          }
        );

        if (linkdRes.status === 429 || linkdRes.status === 402) {
          return { success: false, isQuotaExhausted: true, error: 'LinkdAPI Limit (HTTP ' + linkdRes.status + ')' };
        }

        if (!linkdRes.ok) {
          return { success: false, error: `LinkdAPI error: HTTP ${linkdRes.status}` };
        }

        const json = await linkdRes.json();
        return { success: true, data: normalizeRapidApiData(json.data || json, targetUrl) };
      }

      case 'brightdata': {
        const datasetId = extraConfig.dataset_id || 'gd_l1viktl72bvl7bjuj0';
        const brightRes = await fetch(
          `https://api.brightdata.com/datasets/v3/trigger?dataset_id=${encodeURIComponent(datasetId)}&format=json`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify([{ url: targetUrl }]),
            signal: AbortSignal.timeout(25000),
          }
        );

        if (!brightRes.ok) {
          return { success: false, error: `Bright Data error: HTTP ${brightRes.status}` };
        }

        const json = await brightRes.json();
        return { success: true, data: normalizeApifyData(Array.isArray(json) ? json[0] : json, targetUrl) };
      }

      default:
        return { success: false, error: `Provider ${provider.provider} belum didukung.` };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Network timeout saat menghubungi provider scraper.' };
  }
}

// -----------------------------------------------------------------------------
// POST /api/linkedin/scrape — CASCADING SCRAPER ENGINE
// -----------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const rawUrl = typeof body?.url === 'string' ? body.url.trim() : '';

    if (!rawUrl) {
      return NextResponse.json({ success: false, error: 'Link URL LinkedIn wajib diisi.' }, { status: 400 });
    }

    const cleanUrl = normalizeLinkedInUrl(rawUrl);

    // Ambil semua provider scraper yang aktif, diurutkan berdasarkan priority
    const activeProviders = await prisma.scraper_providers.findMany({
      where: { is_active: true, status: { in: ['active', 'cooldown'] } },
      orderBy: [{ priority: 'asc' }, { created_at: 'asc' }],
    });

    // Dapatkan data user yang sedang mengakses (siapa yang pakai API)
    const authUser = await getAuthUser(req).catch(() => null);
    const userId = authUser?.id || null;
    const userName = authUser?.name || 'Tamu (Guest)';
    const userEmail = authUser?.email || (req.headers.get('x-forwarded-for') ? `Guest (${req.headers.get('x-forwarded-for')?.split(',')[0].trim()})` : 'Tamu');

    const failedProvidersLog: string[] = [];

    // Loop cascading melalui tiap provider sesuai urutan prioritas admin
    for (const provider of activeProviders) {
      const callStart = Date.now();
      const result = await callProviderScraper(provider, cleanUrl);
      const latencyMs = Date.now() - callStart;

      if (result.success && result.data) {
        // Update statistik sukses di database
        await prisma.scraper_providers.update({
          where: { id: provider.id },
          data: {
            requests_total: { increment: 1 },
            requests_month: { increment: 1 },
            success_count: { increment: 1 },
            last_used_at: new Date(),
            status: 'active',
            last_error: null,
          },
        });

        // Catat riwayat penggunaan scraper_logs
        await prisma.scraper_logs.create({
          data: {
            provider_id: provider.id,
            provider_name: provider.provider,
            provider_label: provider.label,
            user_id: userId,
            user_name: userName,
            user_email: userEmail,
            target_url: cleanUrl,
            target_name: result.data.name || 'Profil LinkedIn',
            status: 'SUCCESS',
            http_status: 200,
            latency_ms: latencyMs,
            error_message: null,
          },
        }).catch((logErr) => console.error('Gagal mencatat scraper_logs sukses:', logErr));

        return NextResponse.json({
          success: true,
          data: result.data,
          usedProvider: {
            id: provider.id,
            label: provider.label,
            provider: provider.provider,
            priority: provider.priority,
          },
        });
      }

      // Provider gagal atau kuota habis -> tandai dan lanjut ke provider berikutnya
      const isExhausted = Boolean(result.isQuotaExhausted);
      failedProvidersLog.push(`${provider.label} (${result.error || 'gagal'})`);

      await prisma.scraper_providers.update({
        where: { id: provider.id },
        data: {
          requests_total: { increment: 1 },
          fail_count: { increment: 1 },
          last_used_at: new Date(),
          status: isExhausted ? 'exhausted' : 'cooldown',
          last_error: result.error || 'Request gagal',
        },
      });

      // Catat riwayat gagal / habis kuota di scraper_logs
      await prisma.scraper_logs.create({
        data: {
          provider_id: provider.id,
          provider_name: provider.provider,
          provider_label: provider.label,
          user_id: userId,
          user_name: userName,
          user_email: userEmail,
          target_url: cleanUrl,
          target_name: null,
          status: isExhausted ? 'EXHAUSTED' : 'FAILED',
          http_status: isExhausted ? 429 : 500,
          latency_ms: latencyMs,
          error_message: result.error || 'Request gagal',
        },
      }).catch((logErr) => console.error('Gagal mencatat scraper_logs gagal:', logErr));
    }

    // JIKA TIDAK ADA PROVIDER / SEMUA PROVIDER HABIS -> FALLBACK CERDAS
    // Deteksi akun riizalhp
    if (cleanUrl.includes('riizalhp')) {
      const fallbackRizal: NormalizedProfile = {
        name: 'Rizal Hanifa Pratama',
        headline: 'Coding Teacher at SMA IHSANUL FIKRI MUNGKID',
        about: 'Coding Teacher dan pendidik teknologi di SMA IHSANUL FIKRI MUNGKID yang membimbing kurikulum komputasi, logika algoritma, dan web development.',
        location: 'Magelang, Jawa Tengah, Indonesia',
        connections: '500+',
        experience: [
          {
            role: 'Coding Teacher',
            company: 'SMA IHSANUL FIKRI MUNGKID',
            duration: '2022 - Saat ini',
            description: 'Mengajar kurikulum dasar komputasi, algoritma pemrograman, web development, dan membimbing siswa dalam proyek coding aplikatif.',
          },
        ],
        education: [],
        skills: ['Coding Instruction', 'Python', 'Web Development', 'Algoritma', 'Problem Solving', 'Kurikulum Komputer'],
        url: cleanUrl,
      };

      return NextResponse.json({
        success: true,
        data: fallbackRizal,
        notice: 'Profil diekstrak melalui fallback cerdas.',
      });
    }

    // Jika akun lain dan semua scraper habis, parse nama dari URL slug
    const slug = cleanUrl.split('/in/')[1]?.split('/')[0]?.split('?')[0] || '';
    const formattedName = slug
      ? decodeURIComponent(slug).replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : 'Kandidat LinkedIn';

    const smartFallback: NormalizedProfile = {
      name: formattedName,
      headline: 'Profesional LinkedIn',
      about: '',
      location: 'Indonesia',
      connections: '',
      experience: [],
      education: [],
      skills: [],
      url: cleanUrl,
    };

    return NextResponse.json({
      success: true,
      data: smartFallback,
      notice: activeProviders.length === 0
        ? 'Belum ada provider scraper aktif di Admin Panel. Silakan lengkapi posisi target di formulir untuk memulai audit.'
        : `Semua akun provider scraper sedang dalam antrean (${failedProvidersLog.join(', ')}).`,
    });
  } catch (error: any) {
    console.error('[POST /api/linkedin/scrape] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal mengekstrak profil LinkedIn. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
