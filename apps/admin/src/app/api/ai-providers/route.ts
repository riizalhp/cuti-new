import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@cuti/db";
import crypto from "crypto";

export async function GET() {
  try {
    const providers = await prisma.ai_providers.findMany({
      orderBy: { priority: "desc" },
    });

    const formatted = providers.map((p) => ({
      id: p.id,
      name: p.name,
      label: p.label,
      provider: p.alias || "openai",
      endpointUrl: p.base_url,
      apiKey: p.api_key ? `${p.api_key.slice(0, 3)}••••••••${p.api_key.slice(-4)}` : "••••••••",
      model: p.model,
      priority: p.priority,
      isActive: p.is_active,
      cooldownUntil: p.cooldown_until?.toISOString() || null,
      authType: p.auth_type,
      createdAt: p.created_at.toISOString(),
      updatedAt: p.updated_at.toISOString(),
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error("[AI Providers API] GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data AI provider." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, label, endpointUrl, apiKey, model, priority, authType, alias } = body;

    if (!name || !endpointUrl || !apiKey || !model) {
      return NextResponse.json(
        { success: false, message: "Nama, endpoint, API key, dan model wajib diisi." },
        { status: 400 }
      );
    }

    const provider = await prisma.ai_providers.create({
      data: {
        id: crypto.randomUUID(),
        name,
        label: label || name,
        base_url: endpointUrl,
        api_key: apiKey,
        model,
        priority: priority ?? 0,
        is_active: true,
        alias: alias || null,
        auth_type: authType || "apikey",
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: provider });
  } catch (error: any) {
    console.error("[AI Providers API] POST Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat AI provider." },
      { status: 500 }
    );
  }
}
