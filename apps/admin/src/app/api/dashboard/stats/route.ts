import { NextResponse } from "next/server";
import { prisma } from "@cuti/db";

export async function GET() {
  try {
    // Run all counts in parallel
    const [
      totalUsers,
      freeUsers,
      premiumUsers,
      adminUsers,
      totalOrders,
      completedOrders,
      processingOrders,
      totalCvs,
      readyCvs,
      processingCvs,
      totalMisi,
      activeMisi,
      totalApplications,
      interviewApplications,
      totalTransactions,
      successfulTransactions,
      totalRevenue,
      pendingWithdrawals,
      pendingMisiSubmissions,
      liveVisitorsCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.user.count({ where: { role: "PREMIUM" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.orders.count(),
      prisma.orders.count({ where: { status: "COMPLETED" } }),
      prisma.orders.count({ where: { status: "PROCESSING" } }),
      prisma.cv_projects.count(),
      prisma.cv_projects.count({ where: { status: "READY" } }),
      prisma.cv_projects.count({ where: { status: "PROCESSING" } }),
      prisma.misi.count(),
      prisma.misi.count({ where: { is_active: true } }),
      prisma.applications.count(),
      prisma.applications.count({ where: { status: "INTERVIEW" } }),
      prisma.transactions.count(),
      prisma.transactions.count({ where: { status: "SUCCESS" } }),
      prisma.transactions.aggregate({
        where: { status: "SUCCESS" },
        _sum: { amount: true },
      }),
      prisma.withdrawals.count({ where: { status: "PENDING" } }),
      prisma.misi_submissions.count({ where: { status: "SUBMITTED" } }),
      prisma.audit_logs.count({ where: { action: "CV_DOWNLOAD" } }),
      (prisma as any).visitor.count({
        where: {
          last_seen: { gte: new Date(Date.now() - 2 * 60 * 1000) },
        },
      }),
    ]);

    // Query top downloaded templates
    const downloadLogs = await prisma.audit_logs.findMany({
      where: { action: "CV_DOWNLOAD" },
      select: { entity_id: true, new_value: true },
    });

    const cvTemplateUsage = await prisma.cv_projects.findMany({
      select: { template_id: true, data: true },
    });

    const templateCounts: Record<string, { used: number; downloaded: number }> = {};

    cvTemplateUsage.forEach((c) => {
      const tid = (c.template_id || "ats-modern").trim().toLowerCase();
      const normId = tid === "ats-modern-standard" || tid === "default" ? "ats-modern" : tid;
      if (!templateCounts[normId]) templateCounts[normId] = { used: 0, downloaded: 0 };
      templateCounts[normId].used += 1;

      if (c.data && typeof c.data === "object") {
        const raw = c.data as Record<string, any>;
        if (typeof raw.download_count === "number") {
          templateCounts[normId].downloaded += raw.download_count;
        }
      }
    });

    downloadLogs.forEach((l) => {
      let tid = l.entity_id || "ats-modern";
      if (l.new_value && typeof l.new_value === "object") {
        const val = l.new_value as Record<string, any>;
        if (val.template_id) tid = val.template_id;
      }
      const normId = (tid || "ats-modern").trim().toLowerCase();
      const canonical = normId === "ats-modern-standard" || normId === "default" ? "ats-modern" : normId;
      if (!templateCounts[canonical]) templateCounts[canonical] = { used: 0, downloaded: 0 };
      templateCounts[canonical].downloaded += 1;
    });

    const topTemplates = Object.entries(templateCounts)
      .map(([id, counts]) => ({
        id,
        name: id.replace(/-/g, " ").replace(/\b\w/g, (s) => s.toUpperCase()),
        used: counts.used,
        downloaded: counts.downloaded,
      }))
      .sort((a, b) => b.downloaded - a.downloaded || b.used - a.used)
      .slice(0, 5);

    // Get recent orders
    const recentOrders = await prisma.orders.findMany({
      orderBy: { created_at: "desc" },
      take: 5,
      include: { users: { select: { name: true, email: true } } },
    });

    // Get recent applications
    const recentApplications = await prisma.applications.findMany({
      orderBy: { created_at: "desc" },
      take: 5,
      include: { users: { select: { name: true } } },
    });

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
          total: totalMisi,
          active: activeMisi,
          pendingSubmissions: pendingMisiSubmissions,
        },
        applications: {
          total: totalApplications,
          interview: interviewApplications,
        },
        transactions: {
          total: totalTransactions,
          successful: successfulTransactions,
          totalRevenue: totalRevenue._sum.amount || 0,
        },
        liveVisitors: liveVisitorsCount,
        withdrawals: {
          pending: pendingWithdrawals,
        },
        templateStats: {
          totalDownloaded: downloadLogs.length,
          topTemplates,
        },
        recentOrders: recentOrders.map((o) => ({
          id: o.id,
          orderNumber: o.order_number,
          package: o.package,
          totalPrice: o.total_price,
          status: o.status,
          userName: o.users?.name,
          createdAt: o.created_at.toISOString(),
        })),
        recentApplications: recentApplications.map((a) => ({
          id: a.id,
          companyName: a.company_name,
          position: a.position,
          status: a.status,
          userName: a.users?.name,
          createdAt: a.created_at.toISOString(),
        })),
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
