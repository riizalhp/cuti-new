import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@cuti/db";
import { getAuthUser } from "@/lib/server-auth";
import crypto from "crypto";

// GET: Fetch user's AI generation history from Database
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: true, data: [] });
    }

    const records = await (prisma as any).ai_generation_history.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: "desc" },
      take: 20,
    });

    const months = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
    ];

    const mapped = records.map((r: any) => {
      const d = new Date(r.created_at);
      const hours = String(d.getHours()).padStart(2, "0");
      const mins = String(d.getMinutes()).padStart(2, "0");
      const dateStr = `${d.getDate()} ${months[d.getMonth()]}`;

      return {
        id: r.id,
        createdAt: `${hours}:${mins}, ${dateStr}`,
        sectionKey: r.section_key,
        sectionTitle: r.section_title,
        targetJobTitle: r.target_job_title || "Professional",
        goal: r.goal || "auto",
        formula: r.formula || "auto",
        inputText: r.input_text,
        options: typeof r.options === "object" ? r.options : [],
      };
    });

    return NextResponse.json({ success: true, data: mapped });
  } catch (error: any) {
    console.error("[GET /api/ai/history] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil riwayat AI." },
      { status: 500 }
    );
  }
}

// POST: Save new AI generation record to Database
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { sectionKey, sectionTitle, targetJobTitle, goal, formula, inputText, options } = body;

    if (!sectionKey || !inputText || !options) {
      return NextResponse.json(
        { success: false, message: "Data tidak lengkap." },
        { status: 400 }
      );
    }

    const newRecord = await (prisma as any).ai_generation_history.create({
      data: {
        id: crypto.randomUUID(),
        user_id: user.id,
        section_key: sectionKey,
        section_title: sectionTitle || "Section",
        target_job_title: targetJobTitle || "Professional",
        goal: goal || "auto",
        formula: formula || "auto",
        input_text: inputText,
        options,
        created_at: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: newRecord });
  } catch (error: any) {
    console.error("[POST /api/ai/history] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan riwayat AI ke database." },
      { status: 500 }
    );
  }
}

// DELETE: Clear one or all history items from Database
export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      // Delete single item
      await (prisma as any).ai_generation_history.deleteMany({
        where: { id, user_id: user.id },
      });
    } else {
      // Delete all items for user
      await (prisma as any).ai_generation_history.deleteMany({
        where: { user_id: user.id },
      });
    }

    return NextResponse.json({ success: true, message: "Riwayat berhasil dihapus." });
  } catch (error: any) {
    console.error("[DELETE /api/ai/history] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus riwayat AI." },
      { status: 500 }
    );
  }
}
