import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@employr/db';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '') || 'loker';
}

function cleanHtml(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectPortalName(url: string): string {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host.includes('jobstreet')) return 'Jobstreet';
    if (host.includes('glints')) return 'Glints';
    if (host.includes('linkedin')) return 'LinkedIn';
    if (host.includes('kitalulus')) return 'KitaLulus';
    if (host.includes('kalibrr')) return 'Kalibrr';
    if (host.includes('indeed')) return 'Indeed';
    if (host.includes('dealls')) return 'Dealls';
    if (host.includes('karir.com')) return 'Karir.com';
    return host.replace(/^www\./, '');
  } catch {
    return 'Website Perusahaan';
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, message: 'URL lowongan wajib diisi.' },
        { status: 400 }
      );
    }

    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    let html = '';
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept':
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        signal: controller.signal,
        redirect: 'follow',
      });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }
      html = await response.text();
    } catch (fetchErr: any) {
      console.warn('[Crawl-Job] Fetch failed or blocked:', fetchErr.message);
    }

    let parsedTitle = '';
    let parsedCompany = '';
    let parsedLocation = 'Indonesia';
    let parsedDescription = '';
    let parsedSalary = '';
    let parsedLogo: string | null = null;
    let parsedWorkType: 'ONSITE' | 'REMOTE' | 'HYBRID' | 'ONLINE' = 'ONSITE';

    // 1. Try parsing JSON-LD Schema (JobPosting)
    if (html) {
      const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
      if (jsonLdMatches) {
        for (const scriptTag of jsonLdMatches) {
          try {
            const rawContent = scriptTag.replace(/<script[^>]*>|<\/script>/gi, '').trim();
            const parsed = JSON.parse(rawContent);
            const candidates = Array.isArray(parsed) ? parsed : parsed?.['@graph'] ? parsed['@graph'] : [parsed];

            const jobPosting = candidates.find(
              (c: any) => c && (c['@type'] === 'JobPosting' || c['@type']?.includes?.('JobPosting'))
            );

            if (jobPosting) {
              if (jobPosting.title) parsedTitle = jobPosting.title;
              if (jobPosting.hiringOrganization?.name) parsedCompany = jobPosting.hiringOrganization.name;
              if (jobPosting.hiringOrganization?.logo) {
                parsedLogo = typeof jobPosting.hiringOrganization.logo === 'string'
                  ? jobPosting.hiringOrganization.logo
                  : jobPosting.hiringOrganization.logo.url;
              }
              if (jobPosting.jobLocation?.address) {
                const addr = jobPosting.jobLocation.address;
                parsedLocation = addr.addressLocality || addr.addressRegion || addr.streetAddress || 'Indonesia';
              }
              if (jobPosting.description) {
                parsedDescription = cleanHtml(jobPosting.description).slice(0, 500);
              }
              if (jobPosting.employmentType) {
                const emp = String(jobPosting.employmentType).toLowerCase();
                if (emp.includes('remote') || emp.includes('telecommute')) parsedWorkType = 'REMOTE';
                else if (emp.includes('hybrid')) parsedWorkType = 'HYBRID';
              }
              if (jobPosting.baseSalary?.value) {
                const val = jobPosting.baseSalary.value;
                if (typeof val === 'number') {
                  parsedSalary = `Rp ${val.toLocaleString('id-ID')}`;
                } else if (val.minValue && val.maxValue) {
                  parsedSalary = `Rp ${Number(val.minValue).toLocaleString('id-ID')} - Rp ${Number(val.maxValue).toLocaleString('id-ID')}`;
                }
              }
              break;
            }
          } catch {}
        }
      }
    }

    // 2. OpenGraph / Twitter Fallbacks
    if (html) {
      if (!parsedTitle) {
        const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["'](.*?)["']/i)?.[1]
          || html.match(/<meta[^>]*name=["']twitter:title["'][^>]*content=["'](.*?)["']/i)?.[1];
        if (ogTitle) parsedTitle = cleanHtml(ogTitle);
      }

      if (!parsedCompany) {
        const siteName = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["'](.*?)["']/i)?.[1];
        if (siteName) parsedCompany = cleanHtml(siteName);
      }

      if (!parsedLogo) {
        const ogImg = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["'](.*?)["']/i)?.[1];
        if (ogImg && !ogImg.includes('default') && !ogImg.includes('avatar')) {
          parsedLogo = ogImg;
        }
      }

      if (!parsedDescription) {
        const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["'](.*?)["']/i)?.[1]
          || html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i)?.[1];
        if (ogDesc) parsedDescription = cleanHtml(ogDesc).slice(0, 500);
      }
    }

    // 3. Fallback to HTML Title & URL heuristics
    if (!parsedTitle && html) {
      const docTitle = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
      if (docTitle) parsedTitle = cleanHtml(docTitle);
    }

    // If title has separator (e.g. "Lowongan Frontend Developer di PT Gojek | Glints")
    if (parsedTitle) {
      const separators = [' | ', ' - ', ' at ', ' di ', ' @ '];
      for (const sep of separators) {
        if (parsedTitle.includes(sep)) {
          const parts = parsedTitle.split(sep);
          if (!parsedCompany && parts[1]) {
            parsedCompany = parts[1].replace(/Lowongan|Karir|Job|Glints|Jobstreet|LinkedIn|KitaLulus/gi, '').trim();
          }
          parsedTitle = parts[0].replace(/Lowongan Kerja|Lowongan|Job Vacancy/gi, '').trim();
          break;
        }
      }
    }

    // Generic defaults if completely unparsed
    const portalName = detectPortalName(targetUrl);
    if (!parsedTitle) {
      parsedTitle = `Peluang Karir (${portalName})`;
    }
    if (!parsedCompany) {
      parsedCompany = portalName;
    }
    if (parsedTitle.toLowerCase().includes('remote')) {
      parsedWorkType = 'REMOTE';
    }

    // 4. Auto-publish to Database (Upsert Company & Job)
    let companyRecord: any = null;
    try {
      const companySlug = slugify(parsedCompany || 'perusahaan');
      companyRecord = await prisma.companies.findFirst({
        where: {
          OR: [{ slug: companySlug }, { name: { equals: parsedCompany, mode: 'insensitive' } }],
        },
      });

      if (!companyRecord) {
        companyRecord = await prisma.companies.create({
          data: {
            id: crypto.randomUUID(),
            name: parsedCompany,
            slug: companySlug,
            logo_url: parsedLogo || null,
            website: targetUrl ? new URL(targetUrl).origin : null,
            location: parsedLocation,
          },
        });
      }

      // Check if job already exists by external_url
      const existingJob = await prisma.jobs.findFirst({
        where: { external_url: targetUrl },
      });

      if (!existingJob) {
        const jobSlug = `${slugify(parsedTitle)}-${companySlug}-${Date.now().toString(36)}`;
        await prisma.jobs.create({
          data: {
            id: crypto.randomUUID(),
            company_id: companyRecord.id,
            title: parsedTitle,
            slug: jobSlug,
            description: parsedDescription || `Informasi lowongan kerja ${parsedTitle} di ${parsedCompany}. Buka tautan resmi untuk melamar langsung.`,
            location: parsedLocation,
            work_type: parsedWorkType,
            external_url: targetUrl,
            source: 'user_submission',
            is_active: true,
            requirements: ['Loker crowdsourced via dashboard pelamar Employr'],
          },
        });
      }
    } catch (dbErr: any) {
      console.error('[Crawl-Job] DB Upsert error:', dbErr.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Lowongan berhasil diekstrak dan diterbitkan ke Portal Loker!',
      data: {
        title: parsedTitle,
        company: parsedCompany,
        location: parsedLocation,
        salary: parsedSalary,
        workType: parsedWorkType,
        description: parsedDescription,
        portal: portalName,
        portalUrl: targetUrl,
        logoUrl: parsedLogo,
        publishedToPortal: true,
      },
    });
  } catch (error: any) {
    console.error('[Crawl-Job] Unexpected Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memproses crawling tautan.' },
      { status: 500 }
    );
  }
}
