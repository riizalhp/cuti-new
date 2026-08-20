import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@cuti/db";

export async function GET(req: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    const formatted = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      status: "Active",
      plan: u.role === "ADMIN" ? "Admin" : u.role === "PREMIUM" ? "Paket Siap Kerja" : "Free User",
      joinedDate: u.created_at.toISOString().split("T")[0],
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error("[Users API] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data pengguna dari database." },
      { status: 500 }
    );
  }
}
