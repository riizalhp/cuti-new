import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@cuti/db";
import { logAuditFromReq, logApp, extractRequestContext } from "@cuti/db/logger";
import crypto from "crypto";

export async function GET() {
  try {
    const settings = await prisma.system_settings.findMany({
      orderBy: { group: "asc" },
    });

    const grouped: Record<string, Record<string, string>> = {};
    for (const s of settings) {
      if (!grouped[s.group]) grouped[s.group] = {};
      grouped[s.group][s.key] = s.value;
    }

    return NextResponse.json({ success: true, data: grouped });
  } catch (error: any) {
    console.error("[Settings API] GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil pengaturan." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { settings } = body;

    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { success: false, message: "Data pengaturan tidak valid." },
        { status: 400 }
      );
    }

    // Upsert each setting with audit logging
    for (const [group, entries] of Object.entries(settings) as [string, Record<string, string>][]) {
      for (const [key, value] of Object.entries(entries)) {
        const existing = await prisma.system_settings.findUnique({ where: { key } });
        await prisma.system_settings.upsert({
          where: { key },
          update: { value, updated_at: new Date() },
          create: { id: crypto.randomUUID(), key, value, group, updated_at: new Date() },
        });
        // Log each setting change
        logApp({
          source: 'ADMIN',
          level: 'INFO',
          message: `System setting updated: ${group}.${key}`,
          endpoint: '/api/settings',
          method: 'PUT',
          statusCode: 200,
          details: { key, group, oldValue: existing?.value, newValue: value },
        });
      }
    }

    return NextResponse.json({ success: true, message: "Pengaturan berhasil disimpan." });
  } catch (error: any) {
    console.error("[Settings API] PUT Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan pengaturan." },
      { status: 500 }
    );
  }
}
