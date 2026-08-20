import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@cuti/db";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);

    const logs = await prisma.audit_logs.findMany({
      orderBy: { created_at: "desc" },
      take: limit,
      include: {
        users: { select: { name: true, email: true } },
      },
    });

    const formatted = logs.map((l) => ({
      id: l.id,
      userName: l.users?.name || "Unknown",
      userEmail: l.users?.email,
      action: l.action,
      entity: l.entity,
      entityId: l.entity_id,
      oldValue: l.old_value,
      newValue: l.new_value,
      createdAt: l.created_at.toISOString(),
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error("[Audit Logs API] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil log audit." },
      { status: 500 }
    );
  }
}
