import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@cuti/db";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type") || "all"; // all | audit | security | app
    const level = url.searchParams.get("level") || null;
    const source = url.searchParams.get("source") || null;
    const search = url.searchParams.get("search") || null;
    const startDate = url.searchParams.get("start") || null;
    const endDate = url.searchParams.get("end") || null;
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "50")));
    const skip = (page - 1) * limit;

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate + "T23:59:59.999Z");

    const results: any = {};

    // Audit Logs
    if (type === "all" || type === "audit") {
      const where: any = {};
      if (level) where.severity = level;
      if (search) {
        where.OR = [
          { action: { contains: search, mode: "insensitive" } },
          { entity: { contains: search, mode: "insensitive" } },
          { entity_id: { contains: search, mode: "insensitive" } },
        ];
      }
      if (Object.keys(dateFilter).length > 0) where.created_at = dateFilter;

      const [data, total] = await Promise.all([
        prisma.audit_logs.findMany({
          where,
          orderBy: { created_at: "desc" },
          take: limit,
          skip,
          include: { users: { select: { name: true, email: true } } },
        }),
        prisma.audit_logs.count({ where }),
      ]);

      results.audit = {
        data: data.map((l) => ({
          id: l.id,
          userName: l.users?.name,
          userEmail: l.users?.email,
          action: l.action,
          entity: l.entity,
          entityId: l.entity_id,
          oldValue: l.old_value,
          newValue: l.new_value,
          ipAddress: l.ip_address,
          userAgent: l.user_agent,
          severity: l.severity,
          createdAt: l.created_at.toISOString(),
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    }

    // Security Events
    if (type === "all" || type === "security") {
      const where: any = {};
      if (level) where.severity = level;
      if (search) {
        where.OR = [
          { event_type: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { ip_address: { contains: search, mode: "insensitive" } },
        ];
      }
      if (Object.keys(dateFilter).length > 0) where.created_at = dateFilter;

      const [data, total] = await Promise.all([
        prisma.security_events.findMany({
          where,
          orderBy: { created_at: "desc" },
          take: limit,
          skip,
        }),
        prisma.security_events.count({ where }),
      ]);

      results.security = {
        data: data.map((e) => ({
          id: e.id,
          userId: e.user_id,
          eventType: e.event_type,
          ipAddress: e.ip_address,
          userAgent: e.user_agent,
          email: e.email,
          details: e.details,
          severity: e.severity,
          resolved: e.resolved,
          createdAt: e.created_at.toISOString(),
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    }

    // App Logs
    if (type === "all" || type === "app") {
      const where: any = {};
      if (level) where.level = level;
      if (source) where.source = source;
      if (search) {
        where.OR = [
          { message: { contains: search, mode: "insensitive" } },
          { endpoint: { contains: search, mode: "insensitive" } },
        ];
      }
      if (Object.keys(dateFilter).length > 0) where.created_at = dateFilter;

      const [data, total] = await Promise.all([
        prisma.app_logs.findMany({
          where,
          orderBy: { created_at: "desc" },
          take: limit,
          skip,
        }),
        prisma.app_logs.count({ where }),
      ]);

      results.app = {
        data: data.map((l) => ({
          id: l.id,
          source: l.source,
          level: l.level,
          message: l.message,
          details: l.details,
          userId: l.user_id,
          ipAddress: l.ip_address,
          endpoint: l.endpoint,
          method: l.method,
          statusCode: l.status_code,
          durationMs: l.duration_ms,
          createdAt: l.created_at.toISOString(),
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    }

    // Summary counts
    const [auditCount, securityCount, appCount] = await Promise.all([
      prisma.audit_logs.count(),
      prisma.security_events.count(),
      prisma.app_logs.count(),
    ]);

    const criticalSecurityCount = await prisma.security_events.count({
      where: { severity: "CRITICAL", resolved: false },
    });

    return NextResponse.json({
      success: true,
      data: results,
      summary: {
        totalAudit: auditCount,
        totalSecurity: securityCount,
        totalApp: appCount,
        unresolvedCritical: criticalSecurityCount,
      },
    });
  } catch (error: any) {
    console.error("[Logs API] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data log." },
      { status: 500 }
    );
  }
}
