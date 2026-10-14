import { NextRequest, NextResponse } from 'next/server';
import { prisma, decryptSecret } from '@employr/db';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/scraper-providers/[id]/test — Uji coba koneksi & latensi ke provider scraper
export async function POST(req: NextRequest, { params }: RouteParams) {
  const startTime = Date.now();
  try {
    const { id } = await params;
    const provider = await prisma.scraper_providers.findUnique({
      where: { id },
    });

    if (!provider) {
      return NextResponse.json(
        { success: false, error: 'Provider tidak ditemukan.' },
        { status: 404 }
      );
    }

    const testUrl = 'https://www.linkedin.com/in/williamhgates/';
    const extraConfig = (provider.extra_config as any) || {};
    const apiKey = decryptSecret(provider.api_key);

    let isSuccess = false;
    let errorDetail = '';

    switch (provider.provider.toLowerCase()) {
      case 'apify': {
        // Uji coba memanggil Apify actor check atau user info API
        const apifyRes = await fetch(
          `https://api.apify.com/v2/users/me?token=${encodeURIComponent(apiKey)}`,
          { method: 'GET', signal: AbortSignal.timeout(10000) }
        );
        if (apifyRes.ok) {
          const uData = await apifyRes.json();
          isSuccess = true;
          errorDetail = `Akun terverifikasi (${uData.data?.username || 'Aktif'})`;
        } else {
          isSuccess = false;
          errorDetail = `Gagal autentikasi Apify (HTTP ${apifyRes.status})`;
        }
        break;
      }

      case 'rapidapi': {
        const host = extraConfig.host || 'fresh-linkedin-profile-data.p.rapidapi.com';
        // Test RapidAPI endpoint
        const rapidRes = await fetch(
          `https://${host}/get-linkedin-profile?linkedin_url=${encodeURIComponent(testUrl)}`,
          {
            method: 'GET',
            headers: {
              'X-RapidAPI-Key': apiKey,
              'X-RapidAPI-Host': host,
            },
            signal: AbortSignal.timeout(12000),
          }
        );
        if (rapidRes.status === 200 || rapidRes.status === 201) {
          isSuccess = true;
          errorDetail = 'Berhasil terhubung ke RapidAPI';
        } else if (rapidRes.status === 429) {
          isSuccess = false;
          errorDetail = 'RapidAPI Rate Limit / Quota Habis (HTTP 429)';
        } else {
          isSuccess = false;
          errorDetail = `RapidAPI respons status ${rapidRes.status}`;
        }
        break;
      }

      case 'scrapingdog': {
        const dogRes = await fetch(
          `https://api.scrapingdog.com/linkedin?api_key=${encodeURIComponent(apiKey)}&type=profile&linkId=williamhgates`,
          { method: 'GET', signal: AbortSignal.timeout(12000) }
        );
        if (dogRes.status === 200) {
          isSuccess = true;
          errorDetail = 'Berhasil terhubung ke Scrapingdog';
        } else if (dogRes.status === 402 || dogRes.status === 429) {
          isSuccess = false;
          errorDetail = 'Scrapingdog Kuota Habis / Limit (HTTP 402/429)';
        } else {
          isSuccess = false;
          errorDetail = `Scrapingdog respons status ${dogRes.status}`;
        }
        break;
      }

      case 'linkdapi':
      case 'linkedapi': {
        const linkdRes = await fetch(
          `https://api.linkdapi.com/v1/profile?url=${encodeURIComponent(testUrl)}`,
          {
            method: 'GET',
            headers: {
              'X-API-KEY': apiKey,
            },
            signal: AbortSignal.timeout(12000),
          }
        );
        if (linkdRes.ok) {
          isSuccess = true;
          errorDetail = 'Berhasil terhubung ke LinkdAPI';
        } else {
          isSuccess = false;
          errorDetail = `LinkdAPI respons status ${linkdRes.status}`;
        }
        break;
      }

      case 'brightdata': {
        const brightRes = await fetch(
          'https://api.brightdata.com/zone',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
            signal: AbortSignal.timeout(10000),
          }
        );
        if (brightRes.ok) {
          isSuccess = true;
          errorDetail = 'Token Bright Data valid & terhubung';
        } else {
          isSuccess = false;
          errorDetail = `Bright Data respons status ${brightRes.status}`;
        }
        break;
      }

      case 'zapi': {
        const zapiRes = await fetch('https://api.zapi.ink/v1/jobs:kitalulus/filters', {
          method: 'GET',
          headers: {
            'x-api-key': apiKey,
          },
          signal: AbortSignal.timeout(10000),
        });

        const remainingMonth = zapiRes.headers.get('x-ratelimit-remaining-month') || zapiRes.headers.get('x-ratelimit-remaining');
        if (zapiRes.ok) {
          isSuccess = true;
          errorDetail = remainingMonth 
            ? `Terhubung! Sisa kuota: ${remainingMonth} request bulan ini` 
            : 'Berhasil terhubung ke Zapi Gateway';
          
          if (remainingMonth) {
            extraConfig.remaining_month = parseInt(remainingMonth, 10);
            await prisma.scraper_providers.update({
              where: { id },
              data: { extra_config: extraConfig },
            }).catch(() => {});
          }
        } else if (zapiRes.status === 429) {
          isSuccess = false;
          errorDetail = 'Kuota bulanan Zapi habis (HTTP 429)';
          await prisma.scraper_providers.update({
            where: { id },
            data: { status: 'exhausted' },
          }).catch(() => {});
        } else if (zapiRes.status === 401 || zapiRes.status === 403) {
          isSuccess = false;
          errorDetail = 'API Key Zapi tidak valid (HTTP 401/403)';
        } else {
          isSuccess = false;
          errorDetail = `Zapi respons status ${zapiRes.status}`;
        }
        break;
      }

      default: {
        isSuccess = true;
        errorDetail = 'Provider kustom terkonfigurasi';
        break;
      }
    }

    const latencyMs = Date.now() - startTime;

    // Update status provider di DB
    await prisma.scraper_providers.update({
      where: { id },
      data: {
        status: isSuccess ? 'active' : 'error',
        last_error: isSuccess ? null : errorDetail,
      },
    });

    // Catat log uji koneksi ke scraper_logs agar langsung tampak di detail drawer admin
    await prisma.scraper_logs.create({
      data: {
        provider_id: provider.id,
        provider_name: provider.provider,
        provider_label: provider.label,
        user_name: 'Admin System (Uji Koneksi)',
        user_email: 'admin@employr.id',
        target_url: testUrl,
        target_name: 'Bill Gates (Uji Validasi)',
        status: isSuccess ? 'SUCCESS' : 'FAILED',
        http_status: isSuccess ? 200 : 500,
        latency_ms: latencyMs,
        error_message: isSuccess ? null : errorDetail,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: isSuccess,
      latencyMs,
      message: errorDetail,
    });
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    return NextResponse.json({
      success: false,
      latencyMs,
      error: error.message || 'Koneksi timeout atau gagal menghubungi provider.',
    });
  }
}
