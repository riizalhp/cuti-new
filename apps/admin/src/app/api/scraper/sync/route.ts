import { NextRequest, NextResponse } from "next/server";
import { prisma, decryptSecret } from "@employr/db";
import crypto from "crypto";

export const dynamic = "force-dynamic";

interface SyncRequest {
  entityType: "jobs" | "articles";
  source: string;
  query?: string;
  location?: string;
  limit?: number;
}

function cleanHtml(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/<[^>]*>?/gm, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(text: string, maxLen = 100): string {
  const raw = text
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!raw) return "item";
  if (raw.length <= maxLen) return raw;
  const cut = raw.slice(0, maxLen);
  const lastDash = cut.lastIndexOf("-");
  return (lastDash > 20 ? cut.slice(0, lastDash) : cut).replace(/-+$/g, "");
}

// POST /api/scraper/sync — Manual Trigger Scraping via Zapi dengan Auto-Fallback
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body: SyncRequest = await req.json();
    const { entityType = "jobs", source = "kitalulus", query = "", location = "", limit = 20 } = body;

    // 1. Ambil semua provider Zapi aktif dari DB diurutkan berdasarkan priority
    const providers = await prisma.scraper_providers.findMany({
      where: {
        provider: "zapi",
        is_active: true,
      },
      orderBy: [{ priority: "asc" }, { created_at: "asc" }],
    });

    // Fallback jika belum didaftarkan di DB, cek environment variable
    const candidates: Array<{ id?: string; label: string; apiKey: string; isDb: boolean }> = [];
    for (const p of providers) {
      if (p.api_key) {
        try {
          const plain = decryptSecret(p.api_key);
          if (plain) {
            candidates.push({
              id: p.id,
              label: p.label,
              apiKey: plain,
              isDb: true,
            });
          }
        } catch {
          // ignore corrupted key
        }
      }
    }

    if (candidates.length === 0 && process.env.ZAPI_API_KEY) {
      candidates.push({
        label: "Default Environment Key",
        apiKey: process.env.ZAPI_API_KEY,
        isDb: false,
      });
    }

    if (candidates.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Tidak ada API Key Zapi yang aktif di sistem. Silakan tambahkan provider Zapi di menu Manajemen Provider.",
        },
        { status: 400 }
      );
    }

    let zapiResponse: any = null;
    let successfulCandidate: (typeof candidates)[0] | null = null;
    let fallbackLogs: string[] = [];
    let remainingMonth: string | null = null;
    let lastError = "";

    // 2. Coba penarikan dengan auto-fallback antar akun Zapi
    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      const attemptStartTime = Date.now();

      try {
        let endpointUrl = "";
        const qParams = new URLSearchParams();

        if (entityType === "jobs") {
          switch (source.toLowerCase()) {
            case "kitalulus": {
              endpointUrl = "https://api.zapi.ink/v1/jobs:kitalulus/search";
              if (query) qParams.set("query", query);
              if (location) qParams.set("city", location);
              break;
            }
            case "pintarnya": {
              endpointUrl = "https://api.zapi.ink/v1/jobs:pintarnya/search";
              if (query) qParams.set("query", query);
              if (location) qParams.set("city", location);
              break;
            }
            case "jobstreet": {
              endpointUrl = "https://api.zapi.ink/v1/jobs:jobstreet/search";
              if (query) qParams.set("query", query);
              if (location) qParams.set("location", location);
              break;
            }
            case "alfamart": {
              endpointUrl = "https://api.zapi.ink/v1/jobs:alfamart/vacancies";
              if (query) qParams.set("query", query);
              break;
            }
            case "glints": {
              endpointUrl = "https://api.zapi.ink/v1/jobs:glints/browse";
              qParams.set("country", "ID");
              qParams.set("limit", String(limit));
              break;
            }
            case "kalibrr": {
              endpointUrl = "https://api.zapi.ink/v1/jobs:kalibrr/search";
              if (query) qParams.set("query", query);
              break;
            }
            case "linkedin": {
              endpointUrl = "https://api.zapi.ink/v1/jobs:linkedin/search";
              if (query) qParams.set("query", query);
              qParams.set("location", location || "Indonesia");
              break;
            }
            default: {
              endpointUrl = "https://api.zapi.ink/v1/jobs:kitalulus/search";
              if (query) qParams.set("query", query);
              break;
            }
          }
        } else {
          // Entity: Articles
          switch (source.toLowerCase()) {
            case "kompas": {
              endpointUrl = "https://api.zapi.ink/v1/news:kompas/search";
              qParams.set("query", query || "tips karir");
              break;
            }
            case "detik": {
              endpointUrl = "https://api.zapi.ink/v1/news:detik/search";
              qParams.set("query", query || "tips karir");
              break;
            }
            default: {
              endpointUrl = "https://api.zapi.ink/v1/news:kompas/search";
              qParams.set("query", query || "tips karir");
              break;
            }
          }
        }

        const fullUrl = `${endpointUrl}?${qParams.toString()}`;
        const res = await fetch(fullUrl, {
          method: "GET",
          headers: {
            "x-api-key": candidate.apiKey,
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(15000),
        });

        remainingMonth = res.headers.get("x-ratelimit-remaining-month") || res.headers.get("x-ratelimit-remaining");

        if (res.status === 429) {
          // Kuota habis! Update status provider ke exhausted dan coba akun berikutnya
          lastError = `Akun ${candidate.label} kehabisan kuota bulanan (HTTP 429).`;
          fallbackLogs.push(lastError);

          if (candidate.isDb && candidate.id) {
            await prisma.scraper_providers.update({
              where: { id: candidate.id },
              data: {
                status: "exhausted",
                fail_count: { increment: 1 },
                last_error: "Kuota bulanan habis (HTTP 429)",
                last_used_at: new Date(),
              },
            }).catch(() => {});

            await prisma.scraper_logs.create({
              data: {
                provider_id: candidate.id,
                provider_name: "zapi",
                provider_label: candidate.label,
                user_name: "Admin (Manual Sync)",
                target_url: fullUrl,
                status: "EXHAUSTED",
                http_status: 429,
                latency_ms: Date.now() - attemptStartTime,
                error_message: "Kuota habis (HTTP 429). Mengalihkan ke provider fallback...",
              },
            }).catch(() => {});
          }
          continue; // Lanjut ke candidate berikutnya
        }

        if (!res.ok) {
          lastError = `Gagal memanggil Zapi via ${candidate.label}: HTTP ${res.status} ${res.statusText}`;
          fallbackLogs.push(lastError);

          if (candidate.isDb && candidate.id) {
            await prisma.scraper_providers.update({
              where: { id: candidate.id },
              data: {
                fail_count: { increment: 1 },
                last_error: `HTTP ${res.status}`,
                last_used_at: new Date(),
              },
            }).catch(() => {});
          }
          continue;
        }

        const json = await res.json();
        zapiResponse = json.content || json;
        successfulCandidate = candidate;

        // Update provider sukses
        if (candidate.isDb && candidate.id) {
          const currentConfig = (providers.find(p => p.id === candidate.id)?.extra_config as any) || {};
          if (remainingMonth) {
            currentConfig.remaining_month = parseInt(remainingMonth, 10);
          }

          await prisma.scraper_providers.update({
            where: { id: candidate.id },
            data: {
              status: "active",
              requests_total: { increment: 1 },
              requests_month: { increment: 1 },
              success_count: { increment: 1 },
              last_used_at: new Date(),
              last_error: null,
              extra_config: currentConfig,
            },
          }).catch(() => {});
        }

        break; // Sukses, keluar dari loop fallback
      } catch (err: any) {
        lastError = `Error koneksi pada ${candidate.label}: ${err.message}`;
        fallbackLogs.push(lastError);
      }
    }

    if (!zapiResponse || !successfulCandidate) {
      return NextResponse.json(
        {
          success: false,
          error: lastError || "Gagal mengunduh data dari seluruh akun Zapi yang tersedia.",
          fallbackLogs,
        },
        { status: 502 }
      );
    }

    // 3. Proses dan Normalisasi Data ke Database Lokal
    let items: any[] = [];
    if (Array.isArray(zapiResponse)) {
      items = zapiResponse;
    } else if (Array.isArray(zapiResponse.items)) {
      items = zapiResponse.items;
    } else if (Array.isArray(zapiResponse.jobs)) {
      items = zapiResponse.jobs;
    }

    let newCount = 0;
    let updatedCount = 0;

    if (entityType === "jobs") {
      for (const item of items) {
        const rawTitle = item.title || item.jobTitle || item.name || "Lowongan Pekerjaan";
        const title = cleanHtml(rawTitle);
        const compRawName =
          item.company?.name ||
          item.companyName ||
          item.employer ||
          (typeof item.company === "string" ? item.company : "Perusahaan Mitra");
        const companyName = cleanHtml(compRawName);
        const companySlug = slugify(companyName) || "perusahaan-mitra";

        // Pastikan Company ada di DB
        let company = await prisma.companies.findFirst({
          where: {
            OR: [{ name: { equals: companyName, mode: "insensitive" } }, { slug: companySlug }],
          },
        });

        if (!company) {
          let compSlugCandidate = companySlug;
          let cIdx = 2;
          while (await prisma.companies.findUnique({ where: { slug: compSlugCandidate }, select: { id: true } })) {
            compSlugCandidate = `${companySlug}-${cIdx++}`;
          }
          company = await prisma.companies.create({
            data: {
              name: companyName,
              slug: compSlugCandidate,
              location: location || "Indonesia",
            },
          });
        }

        // Tentukan data loker
        const itemUrl = item.url || item.jobUrl || item.link || `https://loker.employr.id`;
        const itemLoc = cleanHtml(item.location?.city || item.location?.name || item.location || location || "Indonesia");
        const itemDesc = cleanHtml(item.description || item.snippet || item.summary || title);
        const salaryMin = typeof item.salary?.min === "number" ? item.salary.min : null;
        const salaryMax = typeof item.salary?.max === "number" ? item.salary.max : null;
        
        let workType: "ONSITE" | "REMOTE" | "HYBRID" = "ONSITE";
        const wtStr = (item.workArrangement || item.workType || "").toLowerCase();
        if (wtStr.includes("remote")) workType = "REMOTE";
        else if (wtStr.includes("hybrid")) workType = "HYBRID";

        const baseSlug = slugify(`${title}-${companyName}`);

        // Cek apakah loker sudah ada (berdasarkan external_url atau slug)
        const existingJob = await prisma.jobs.findFirst({
          where: {
            OR: [
              { external_url: itemUrl },
              { slug: baseSlug },
            ],
          },
        });

        if (existingJob) {
          await prisma.jobs.update({
            where: { id: existingJob.id },
            data: {
              title,
              description: itemDesc || existingJob.description,
              location: itemLoc || existingJob.location,
              salary_min: salaryMin ?? existingJob.salary_min,
              salary_max: salaryMax ?? existingJob.salary_max,
              is_active: !item.isClosed,
              last_synced_at: new Date(),
            },
          });
          updatedCount++;
        } else {
          let jobSlugCandidate = baseSlug;
          let jIdx = 2;
          while (await prisma.jobs.findUnique({ where: { slug: jobSlugCandidate }, select: { id: true } })) {
            jobSlugCandidate = `${baseSlug}-${jIdx++}`;
          }
          await prisma.jobs.create({
            data: {
              id: crypto.randomUUID(),
              company_id: company.id,
              title,
              slug: jobSlugCandidate,
              description: itemDesc,
              location: itemLoc,
              work_type: workType,
              salary_min: salaryMin,
              salary_max: salaryMax,
              external_url: itemUrl,
              source: source.toLowerCase(),
              tags: Array.isArray(item.skills) ? item.skills.slice(0, 5) : [source],
              is_active: true,
              last_synced_at: new Date(),
            },
          });
          newCount++;
        }
      }
    } else {
      // Entity: Articles
      // Cari atau buat kategori tips karier
      let category = await prisma.article_categories.findFirst({
        where: { slug: "tips-karir" },
      });
      if (!category) {
        category = await prisma.article_categories.create({
          data: {
            id: crypto.randomUUID(),
            name: "Tips Karir",
            slug: "tips-karir",
          },
        });
      }

      for (const item of items) {
        const title = cleanHtml(item.title || "Artikel Karir");
        const itemContent = cleanHtml(item.content || item.summary || item.snippet || title);
        const itemUrl = item.url || "";
        const image = item.image || item.thumbnail || null;
        const author = cleanHtml(item.author || "Redaksi " + source.toUpperCase());
        const baseSlug = slugify(title);

        const existing = await prisma.articles.findFirst({
          where: {
            OR: [
              ...(itemUrl ? [{ external_url: itemUrl }] : []),
              { slug: baseSlug },
            ],
          },
        });

        if (existing) {
          await prisma.articles.update({
            where: { id: existing.id },
            data: {
              title,
              content: itemContent,
              cover_image_url: image || existing.cover_image_url,
              published_at: item.publishedAt ? new Date(item.publishedAt) : existing.published_at,
              last_synced_at: new Date(),
            },
          });
          updatedCount++;
        } else {
          let artSlugCandidate = baseSlug;
          let aIdx = 2;
          while (await prisma.articles.findUnique({ where: { slug: artSlugCandidate }, select: { id: true } })) {
            artSlugCandidate = `${baseSlug}-${aIdx++}`;
          }
          await prisma.articles.create({
            data: {
              id: crypto.randomUUID(),
              category_id: category.id,
              title,
              slug: artSlugCandidate,
              content: itemContent,
              author: author,
              cover_image_url: image,
              is_published: true,
              source: source.toLowerCase(),
              external_url: itemUrl,
              published_at: item.publishedAt ? new Date(item.publishedAt) : new Date(),
              last_synced_at: new Date(),
            },
          });
          newCount++;
        }
      }
    }

    const totalProcessed = newCount + updatedCount;
    const latencyMs = Date.now() - startTime;

    // Catat log sukses ke scraper_logs
    if (successfulCandidate.isDb && successfulCandidate.id) {
      await prisma.scraper_logs.create({
        data: {
          provider_id: successfulCandidate.id,
          provider_name: "zapi",
          provider_label: successfulCandidate.label,
          user_name: "Admin (Manual Sync)",
          target_url: `api.zapi.ink/${entityType}:${source}`,
          target_name: `${entityType === "jobs" ? "Loker" : "Artikel"} (${source})`,
          status: "SUCCESS",
          http_status: 200,
          latency_ms: latencyMs,
          error_message: fallbackLogs.length > 0 ? `Fallback terjadi: ${fallbackLogs.join(" | ")}` : null,
        },
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      data: {
        entityType,
        source,
        totalItemsFound: items.length,
        newCount,
        updatedCount,
        totalProcessed,
        providerUsed: successfulCandidate.label,
        fallbackOccurred: fallbackLogs.length > 0,
        fallbackLogs,
        remainingQuota: remainingMonth ? parseInt(remainingMonth, 10) : null,
        latencyMs,
      },
    });
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    console.error("[POST /api/scraper/sync] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Terjadi kesalahan sistem saat sinkronisasi scraper.",
        latencyMs,
      },
      { status: 500 }
    );
  }
}
