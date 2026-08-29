import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@cuti/db";

// PUT: Update provider by ID
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json();
    const { name, label, endpointUrl, apiKey, model, priority, isActive, alias, authType } = body;

    const existing = await prisma.ai_providers.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Provider tidak ditemukan." },
        { status: 404 }
      );
    }

    const updated = await prisma.ai_providers.update({
      where: { id },
      data: {
        ...(name && { name, label: label || name }),
        ...(endpointUrl && { base_url: endpointUrl }),
        ...(apiKey !== undefined && { api_key: apiKey }),
        ...(model && { model }),
        ...(priority !== undefined && { priority }),
        ...(isActive !== undefined && { is_active: isActive }),
        ...(alias !== undefined && { alias }),
        ...(authType !== undefined && { auth_type: authType }),
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("[AI Providers API] PUT Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui AI provider." },
      { status: 500 }
    );
  }
}

// DELETE: Delete provider by ID
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    await prisma.ai_providers.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Provider berhasil dihapus." });
  } catch (error: any) {
    console.error("[AI Providers API] DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus AI provider." },
      { status: 500 }
    );
  }
}
