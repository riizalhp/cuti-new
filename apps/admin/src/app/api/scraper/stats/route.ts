import { NextResponse } from "next/server";
import { prisma, decryptSecret } from "@employr/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Hitung total data di basis data
    const [scrapedJobsActive, manualJobsActive, totalInactiveJobs, totalArticles, totalCertifications] =
      await Promise.all([
        prisma.jobs.count({ where: { is_active: true, source: { not: "manual" } } }),
        prisma.jobs.count({ where: { is_active: true, source: "manual" } }),
        prisma.jobs.count({ where: { is_active: false } }),
        prisma.articles.count({ where: { is_published: true } }),
        prisma.certifications.count({ where: { is_active: true } }),
      ]);

    // 2. Ambil semua akun Zapi
    const zapiProviders = await prisma.scraper_providers.findMany({
      where: { provider: "zapi" },
      orderBy: [{ priority: "asc" }, { created_at: "asc" }],
    });

    const sanitizedZapi = zapiProviders.map((p) => {
      const plainKey = p.api_key ? decryptSecret(p.api_key) : "";
      const maskedKey = plainKey ? `${plainKey.slice(0, 4)}••••••••${plainKey.slice(-4)}` : "••••••••";
      const totalReqs = p.success_count + p.fail_count;
      const successRate = totalReqs > 0 ? Math.round((p.success_count / totalReqs) * 100) : 100;
      const remainingQuota = Math.max(0, 600 - (p.requests_month || 0));

      return {
        id: p.id,
        label: p.label,
        maskedKey,
        priority: p.priority,
        isActive: p.is_active,
        status: p.status, // "active" | "exhausted" | "cooldown" | "error"
        requestsMonth: p.requests_month,
        requestsTotal: p.requests_total,
        successCount: p.success_count,
        failCount: p.fail_count,
        successRate,
        remainingQuota,
        isQuotaExhausted: p.status === "exhausted" || p.requests_month >= 600,
        lastUsedAt: p.last_used_at,
        lastError: p.last_error,
        createdAt: p.created_at,
      };
    });

    // 3. Hitung ringkasan kuota dan countdown reset (Tanggal 1 tiap bulan UTC)
    const now = new Date();
    const nextMonthUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0));
    const diffMs = nextMonthUtc.getTime() - now.getTime();
    const resetDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const resetHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const resetDateFormatted = nextMonthUtc.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    });

    const totalZapiAccounts = sanitizedZapi.length;
    const activeZapiAccounts = sanitizedZapi.filter((a) => a.isActive && !a.isQuotaExhausted).length;
    const exhaustedZapiAccounts = sanitizedZapi.filter((a) => a.isQuotaExhausted).length;
    const totalRequestsMonth = sanitizedZapi.reduce((acc, a) => acc + a.requestsMonth, 0);
    const totalSuccess = sanitizedZapi.reduce((acc, a) => acc + a.successCount, 0);
    const totalFail = sanitizedZapi.reduce((acc, a) => acc + a.failCount, 0);
    const overallSuccessRate =
      totalSuccess + totalFail > 0 ? Math.round((totalSuccess / (totalSuccess + totalFail)) * 100) : 100;

    // 4. Ambil 25 riwayat scraping terakhir
    const recentLogs = await prisma.scraper_logs.findMany({
      where: {
        OR: [
          { provider_name: "zapi" },
          { provider_name: "local" },
          { target_url: { contains: "jobs" } },
          { target_url: { contains: "news" } },
        ],
      },
      orderBy: { created_at: "desc" },
      take: 25,
    });

    return NextResponse.json({
      success: true,
      stats: {
        jobs: {
          scrapedActive: scrapedJobsActive,
          manualActive: manualJobsActive,
          inactive: totalInactiveJobs,
          total: scrapedJobsActive + manualJobsActive,
        },
        content: {
          articles: totalArticles,
          certifications: totalCertifications,
          total: totalArticles + totalCertifications,
        },
        zapi: {
          totalAccounts: totalZapiAccounts,
          activeAccounts: activeZapiAccounts,
          exhaustedAccounts: exhaustedZapiAccounts,
          totalRequestsMonth,
          overallSuccessRate,
          resetCountdown: {
            days: resetDays,
            hours: resetHours,
            formattedDate: resetDateFormatted,
            utcIso: nextMonthUtc.toISOString(),
          },
        },
      },
      accounts: sanitizedZapi,
      logs: recentLogs,
    });
  } catch (error: any) {
    console.error("[GET /api/scraper/stats] Error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal memuat statistik scraper." },
      { status: 500 }
    );
  }
}
