import { NextResponse } from "next/server";
import { prisma } from "@cuti/db";

export async function GET() {
  try {
    const orders = await prisma.orders.findMany({
      orderBy: { created_at: "desc" },
      include: {
        users: { select: { name: true, email: true } },
        cv_projects: { select: { status: true, template_id: true } },
      },
    });

    const formatted = orders.map((o) => ({
      id: o.id,
      orderNumber: o.order_number,
      userName: o.users?.name || "Unknown",
      userEmail: o.users?.email || "",
      package: o.package,
      basePrice: o.base_price,
      discount: o.discount,
      totalPrice: o.total_price,
      hasExpress: o.has_express,
      status: o.status,
      paymentMethod: o.payment_method,
      paidAt: o.paid_at?.toISOString() || null,
      processingStartedAt: o.processing_started_at?.toISOString() || null,
      readyAt: o.ready_at?.toISOString() || null,
      completedAt: o.completed_at?.toISOString() || null,
      createdAt: o.created_at.toISOString(),
      cvStatus: o.cv_projects?.status || null,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error("[Orders API] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data order." },
      { status: 500 }
    );
  }
}
