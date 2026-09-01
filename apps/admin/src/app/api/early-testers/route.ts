import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@cuti/db";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    let testers: any[] = [];
    try {
      if ((prisma as any).earlyTester) {
        testers = await (prisma as any).earlyTester.findMany({
          orderBy: { created_at: "desc" },
        });
      }
    } catch (e) {
      console.warn("Prisma earlyTester lookup in admin warning:", e);
    }

    const total = testers.length;
    const registeredCount = testers.filter((t) => t.status === "REGISTERED").length;
    const invitedCount = testers.filter((t) => t.status === "INVITED").length;
    const activatedCount = testers.filter((t) => t.status === "ACTIVATED").length;

    const stats = {
      total,
      registered: registeredCount,
      invited: invitedCount,
      activated: activatedCount,
      byRole: {
        SMA_SMK: testers.filter((t) => t.role_status === "SMA_SMK").length,
        MAHASISWA: testers.filter((t) => t.role_status === "MAHASISWA").length,
        FRESH_GRAD: testers.filter((t) => t.role_status === "FRESH_GRAD").length,
        JOB_SEEKER: testers.filter((t) => t.role_status === "JOB_SEEKER").length,
      },
    };

    return NextResponse.json({
      success: true,
      data: testers,
      stats,
    });
  } catch (error: any) {
    console.error("[Admin Early Testers API] GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data early tester." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone_number, role_status, status } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: "Nama dan email wajib diisi." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPhone = phone_number ? String(phone_number).trim() : null;
    const cleanRole = role_status ? String(role_status).trim() : "FRESH_GRAD";
    const cleanStatus = status || "REGISTERED";

    let createdTester = null;
    if ((prisma as any).earlyTester) {
      createdTester = await (prisma as any).earlyTester.create({
        data: {
          id: crypto.randomUUID(),
          name: cleanName,
          email: cleanEmail,
          phone_number: cleanPhone,
          role_status: cleanRole,
          status: cleanStatus,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Tester berhasil ditambahkan.",
      data: createdTester,
    });
  } catch (error: any) {
    console.error("[Admin Early Testers API] POST Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menambahkan tester." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, role_status, name, phone_number } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID tester wajib disertakan." },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (role_status) updateData.role_status = role_status;
    if (name) updateData.name = name;
    if (phone_number !== undefined) updateData.phone_number = phone_number;

    let updated = null;
    if ((prisma as any).earlyTester) {
      updated = await (prisma as any).earlyTester.update({
        where: { id },
        data: updateData,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Data tester berhasil diperbarui.",
      data: updated,
    });
  } catch (error: any) {
    console.error("[Admin Early Testers API] PATCH Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui data tester." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID tester wajib disertakan." },
        { status: 400 }
      );
    }

    if ((prisma as any).earlyTester) {
      await (prisma as any).earlyTester.delete({
        where: { id },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Data tester berhasil dihapus.",
    });
  } catch (error: any) {
    console.error("[Admin Early Testers API] DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus data tester." },
      { status: 500 }
    );
  }
}
