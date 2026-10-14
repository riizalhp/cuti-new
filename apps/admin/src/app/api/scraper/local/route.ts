import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@employr/db";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

interface LocalScrapeRequest {
  entityType?: "jobs" | "articles";
  keyword?: string;
  portals?: string[];
  location?: string;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body: LocalScrapeRequest = await req.json().catch(() => ({}));
    const entityType = body.entityType || "jobs";
    const keyword = typeof body.keyword === "string" ? body.keyword.trim() : "";
    const portals = body.portals;
    const location = body.location;

    const dashboardBaseUrl = process.env.DASHBOARD_INTERNAL_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (entityType === "jobs") {
      const response = await fetch(`${dashboardBaseUrl}/api/job-sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, portals, location }),
        signal: AbortSignal.timeout(180000), // 3 min
      }).catch((err) => {
        throw new Error(`Koneksi ke service lokal dashboard gagal: ${err.message}`);
      });

      const json = await response.json();
      const latencyMs = Date.now() - startTime;

      if (!response.ok || !json.success) {
        throw new Error(json.message || `Gagal menjalankan sinkronisasi lowongan (HTTP ${response.status})`);
      }

      return NextResponse.json({
        success: true,
        entityType: "jobs",
        engine: "local",
        scraped: json.scraped || 0,
        created: json.created || 0,
        updated: json.updated || 0,
        deactivated: json.deactivated || 0,
        logs: json.logs || [
          `Scrape lokal selesai: ${json.scraped || 0} didapat, ${json.created || 0} baru, ${json.updated || 0} update.`,
        ],
        latencyMs,
      });
    } else {
      // Content (Artikel & Sertifikasi)
      const response = await fetch(`${dashboardBaseUrl}/api/content-sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(180000),
      }).catch((err) => {
        throw new Error(`Koneksi ke service lokal dashboard gagal: ${err.message}`);
      });

      const json = await response.json();
      const latencyMs = Date.now() - startTime;

      if (!response.ok || !json.success) {
        throw new Error(json.message || `Gagal menjalankan sinkronisasi konten (HTTP ${response.status})`);
      }

      const totalCreated = (json.articles?.created || 0) + (json.certifications?.created || 0);
      const totalUpdated = (json.articles?.updated || 0) + (json.certifications?.updated || 0);

      return NextResponse.json({
        success: true,
        entityType: "articles",
        engine: "local",
        created: totalCreated,
        updated: totalUpdated,
        details: json,
        logs: json.logs || [
          `Artikel: ${json.articles?.created || 0} baru, ${json.articles?.updated || 0} update.`,
          `Sertifikasi: ${json.certifications?.created || 0} baru, ${json.certifications?.updated || 0} update.`,
        ],
        latencyMs,
      });
    }
  } catch (error: any) {
    console.error("[POST /api/scraper/local] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Terjadi kesalahan saat menjalankan scraper lokal.",
      },
      { status: 500 }
    );
  }
}
