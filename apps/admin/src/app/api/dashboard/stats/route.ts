import { NextResponse } from "next/server";
import { prisma } from "@employr/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

    // Jalankan agregasi terindeks secara paralel tanpa full-table scan atau download payload JSON jumbo
    const [
      userRoleGroups,
      orderStatusGroups,
      cvStatusGroups,
      misiTotal,
      misiActive,
      misiPendingSubmissions,
      appStatusGroups,
      screeningCountResult,
      transactionStatusGroups,
      pendingWithdrawals,
      downloadLogsCount,
      liveVisitorsCount,
      cvTemplateGroups,
      recentDownloadLogs,
      recentOrders,
      recentApplications,
      todayAiAgg,
      recentAiLogs,
      newsletterTotal,
      newsletterActive,
    ] = await Promise.all([
      // 1. User role counts (1 query agregat)
      prisma.user.groupBy({
        by: ["role"],
        _count: { _all: true },
      }),
      // 2. Order status counts (1 query agregat)
      prisma.orders.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      // 3. CV status counts (1 query agregat)
      prisma.cv_projects.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      // 4. Misi total
      prisma.misi.count(),
      // 5. Misi active
      prisma.misi.count({ where: { is_active: true } }),
      // 6. Misi pending submissions
      prisma.misi_submissions.count({ where: { status: "SUBMITTED" } }),
      // 7. Application status counts (1 query agregat)
      prisma.applications.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      // 8. Screening count (Prisma JSON filter / raw query cepat)
      (async () => {
        try {
          return await prisma.applications.count({
            where: {
              status: "APPLIED",
              ai_insight: {
                path: ["displayStatus"],
                equals: "Screening",
              },
            },
          });
        } catch {
          try {
            const rawRes = await prisma.$queryRaw<{ count: bigint | number }[]>`
              SELECT COUNT(*)::int as count 
              FROM applications 
              WHERE status = 'APPLIED'::"ApplicationStatus" 
              AND ai_insight->>'displayStatus' = 'Screening'
            `;
            return Number(rawRes[0]?.count || 0);
          } catch {
            return 0;
          }
        }
      })(),
      // 9. Transaction status & revenue aggregation (1 query agregat)
      prisma.transactions.groupBy({
        by: ["status"],
        _count: { _all: true },
        _sum: { amount: true },
      }),
      // 10. Pending withdrawals
      prisma.withdrawals.count({ where: { status: "PENDING" } }),
      // 11. Total CV download audit count
      prisma.audit_logs.count({ where: { action: "CV_DOWNLOAD" } }),
      // 12. Live visitors count
      (prisma as any).visitor
        .count({
          where: { last_seen: { gte: twoMinutesAgo } },
        })
        .catch(() => 0),
      // 13. Template usage (1 query agregat tanpa kolom JSON `data`)
      prisma.cv_projects.groupBy({
        by: ["template_id"],
        _count: { _all: true },
      }),
      // 14. Sample audit log downloads terbaru (dibatasi 100 rows, bukan jutaan)
      prisma.audit_logs.findMany({
        where: { action: "CV_DOWNLOAD" },
        select: { entity_id: true, new_value: true },
        orderBy: { created_at: "desc" },
        take: 100,
      }),
      // 15. Recent orders (hanya kolom yang diperlukan)
      prisma.orders.findMany({
        orderBy: { created_at: "desc" },
        take: 5,
        select: {
          id: true,
          order_number: true,
          package: true,
          total_price: true,
          status: true,
          created_at: true,
          users: { select: { name: true, email: true } },
        },
      }),
      // 16. Recent applications (hanya kolom yang diperlukan)
      prisma.applications.findMany({
        orderBy: { created_at: "desc" },
        take: 5,
        select: {
          id: true,
          company_name: true,
          position: true,
          status: true,
          match_score: true,
          ai_insight: true,
          created_at: true,
          users: { select: { name: true } },
        },
      }),
      // 17. AI usage logs aggregation today
      prisma.ai_usage_logs.aggregate({
        where: { created_at: { gte: todayStart } },
        _count: { _all: true },
        _sum: { cost: true, tokens_input: true, tokens_output: true },
      }),
      // 18. Recent AI logs (3 latest)
      prisma.ai_usage_logs.findMany({
        orderBy: { created_at: "desc" },
        take: 3,
        select: {
          id: true,
          user_id: true,
          prompt_name: true,
          provider: true,
          model: true,
          cost: true,
          tokens_input: true,
          tokens_output: true,
          created_at: true,
        },
      }),
      // 19. Newsletter total subscribers
      prisma.newsletterSubscriber.count(),
      // 20. Newsletter active subscribers
      prisma.newsletterSubscriber.count({ where: { is_active: true } }),
    ]);

    // Parse User Role Stats
    let totalUsers = 0;
    let freeUsers = 0;
    let premiumUsers = 0;
    let adminUsers = 0;
    for (const u of userRoleGroups) {
      totalUsers += u._count._all;
      if (u.role === "USER") freeUsers = u._count._all;
      else if (u.role === "PREMIUM") premiumUsers = u._count._all;
      else if (u.role === "ADMIN") adminUsers = u._count._all;
    }

    // Parse Order Stats
    let totalOrders = 0;
    let completedOrders = 0;
    let processingOrders = 0;
    for (const o of orderStatusGroups) {
      totalOrders += o._count._all;
      if (o.status === "COMPLETED") completedOrders = o._count._all;
      else if (o.status === "PROCESSING") processingOrders = o._count._all;
    }

    // Parse CV Project Stats
    let totalCvs = 0;
    let readyCvs = 0;
    let processingCvs = 0;
    for (const c of cvStatusGroups) {
      totalCvs += c._count._all;
      if (c.status === "READY") readyCvs = c._count._all;
      else if (c.status === "PROCESSING") processingCvs = c._count._all;
    }

    // Parse Application Pipeline Stats
    let totalApplied = 0;
    let interviewApplications = 0;
    let offeringApplications = 0;
    let rejectedApplications = 0;
    for (const a of appStatusGroups) {
      if (a.status === "APPLIED") totalApplied = a._count._all;
      else if (a.status === "INTERVIEW") interviewApplications = a._count._all;
      else if (a.status === "OFFERING" || (a.status as string) === "ACCEPTED")
        offeringApplications += a._count._all;
      else if (a.status === "REJECTED") rejectedApplications = a._count._all;
    }

    const screeningApplications = Math.min(totalApplied, screeningCountResult || 0);
    const terkirimApplications = Math.max(0, totalApplied - screeningApplications);
    const totalTrackerApplications =
      terkirimApplications +
      screeningApplications +
      interviewApplications +
      offeringApplications +
      rejectedApplications;

    // Parse Transactions & Revenue
    let totalTransactions = 0;
    let successfulTransactions = 0;
    let totalRevenue = 0;
    for (const t of transactionStatusGroups) {
      totalTransactions += t._count._all;
      if (t.status === "SUCCESS") {
        successfulTransactions = t._count._all;
        totalRevenue = t._sum.amount || 0;
      }
    }

    // Top Downloaded & Used Templates
    const TEMPLATE_NAMES: Record<string, string> = {
      "ats-modern": "ATS Modern Standard",
      "ketat-serif": "Ketat Ruled Serif",
      "luasa-minimal": "Luasa Airy Minimalist",
      "harvard-modern": "Harvard Modern Grid",
      "rezi-classic": "Rezi Classic Serif",
      "minimalist-executive": "Minimalist Executive",
    };

    const templateCounts: Record<string, { used: number; downloaded: number }> = {};

    cvTemplateGroups.forEach((c) => {
      const tid = (c.template_id || "ats-modern").trim().toLowerCase();
      const normId =
        tid === "ats-modern-standard" || tid === "default" || !TEMPLATE_NAMES[tid]
          ? "ats-modern"
          : tid;
      if (!templateCounts[normId]) templateCounts[normId] = { used: 0, downloaded: 0 };
      templateCounts[normId].used += c._count._all;
    });

    recentDownloadLogs.forEach((l) => {
      let tid = l.entity_id || "ats-modern";
      if (l.new_value && typeof l.new_value === "object") {
        const val = l.new_value as Record<string, any>;
        if (val.template_id) tid = val.template_id;
      }
      const normId = (tid || "ats-modern").trim().toLowerCase();
      const canonical =
        normId === "ats-modern-standard" || normId === "default" || !TEMPLATE_NAMES[normId]
          ? "ats-modern"
          : normId;
      if (!templateCounts[canonical]) templateCounts[canonical] = { used: 0, downloaded: 0 };
      templateCounts[canonical].downloaded += 1;
    });

    const topTemplates = Object.entries(templateCounts)
      .map(([id, counts]) => ({
        id,
        name: TEMPLATE_NAMES[id] || id.replace(/-/g, " ").replace(/\b\w/g, (s) => s.toUpperCase()),
        used: counts.used,
        downloaded: counts.downloaded,
      }))
      .sort((a, b) => b.downloaded - a.downloaded || b.used - a.used)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          free: freeUsers,
          premium: premiumUsers,
          admin: adminUsers,
        },
        orders: {
          total: totalOrders,
          completed: completedOrders,
          processing: processingOrders,
        },
        cv: {
          total: totalCvs,
          ready: readyCvs,
          processing: processingCvs,
        },
        misi: {
          total: misiTotal,
          active: misiActive,
          pendingSubmissions: misiPendingSubmissions,
        },
        applications: {
          total: totalTrackerApplications,
          terkirim: terkirimApplications,
          screening: screeningApplications,
          interview: interviewApplications,
          offering: offeringApplications,
          ditolak: rejectedApplications,
        },
        transactions: {
          total: totalTransactions,
          successful: successfulTransactions,
          totalRevenue,
        },
        liveVisitors: liveVisitorsCount,
        withdrawals: {
          pending: pendingWithdrawals,
        },
        templateStats: {
          totalDownloaded: downloadLogsCount,
          topTemplates,
        },
        newsletter: {
          total: newsletterTotal,
          active: newsletterActive,
        },
        recentOrders: recentOrders.map((o) => ({
          id: o.id,
          orderNumber: o.order_number,
          package: o.package,
          totalPrice: o.total_price,
          status: o.status,
          userName: o.users?.name || "Pengguna",
          createdAt: o.created_at.toISOString(),
        })),
        recentApplications: recentApplications.map((a) => {
          const insight = (typeof a.ai_insight === "object" && a.ai_insight !== null
            ? a.ai_insight
            : {}) as Record<string, any>;
          let displayStatus: "Terkirim" | "Screening" | "Interview" | "Offering" | "Ditolak" =
            "Terkirim";
          if (a.status === "INTERVIEW") displayStatus = "Interview";
          else if (a.status === "OFFERING" || (a.status as string) === "ACCEPTED")
            displayStatus = "Offering";
          else if (a.status === "REJECTED") displayStatus = "Ditolak";
          else if (insight.displayStatus === "Screening") displayStatus = "Screening";

          return {
            id: a.id,
            companyName: a.company_name,
            position: a.position,
            status: displayStatus,
            rawStatus: a.status,
            userName: a.users?.name || "Pengguna",
            createdAt: a.created_at.toISOString(),
            matchScore: a.match_score,
            location: insight.location || "Indonesia",
            portal: insight.portal || "Direct",
          };
        }),
        aiStats: {
          callsToday: todayAiAgg?._count?._all || 0,
          costToday: Number(todayAiAgg?._sum?.cost) || 0,
          tokensToday: (todayAiAgg?._sum?.tokens_input || 0) + (todayAiAgg?._sum?.tokens_output || 0),
          recentLogs: (recentAiLogs || []).map((l) => ({
            id: l.id,
            feature: l.prompt_name || "AI Task",
            provider: l.provider || "openai",
            model: l.model || "gpt-4o-mini",
            cost: Number(l.cost) || 0,
            tokens: (l.tokens_input || 0) + (l.tokens_output || 0),
            createdAt: l.created_at.toISOString(),
          })),
        },
      },
    });
  } catch (error: any) {
    console.error("[Dashboard Stats] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil statistik dashboard." },
      { status: 500 }
    );
  }
}
