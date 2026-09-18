import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@employr/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      role_name,
      category,
      top_essential_skills,
      top_nicetohave_skills,
      is_promoted,
    } = body || {};

    const cleanRoleName = (role_name || "").trim();
    if (!cleanRoleName) {
      return NextResponse.json(
        { success: false, message: "Nama peran tidak boleh kosong." },
        { status: 400 }
      );
    }

    const essential = Array.isArray(top_essential_skills)
      ? top_essential_skills.map((s: any) => String(s).trim()).filter(Boolean)
      : [];
    const niceToHave = Array.isArray(top_nicetohave_skills)
      ? top_nicetohave_skills.map((s: any) => String(s).trim()).filter(Boolean)
      : [];

    await prisma.$executeRaw`
      UPDATE learned_role_blueprints
      SET
        role_name = ${cleanRoleName},
        category = ${category || "other"},
        top_essential_skills = ${essential}::text[],
        top_nicetohave_skills = ${niceToHave}::text[],
        is_promoted = ${Boolean(is_promoted)},
        updated_at = NOW()
      WHERE id = ${id}::uuid
    `;

    return NextResponse.json({
      success: true,
      message: `Blueprint "${cleanRoleName}" berhasil diperbarui.`,
    });
  } catch (error: any) {
    console.error("[PUT /api/blueprints/[id]] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui data blueprint." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.$executeRaw`
      DELETE FROM learned_role_blueprints
      WHERE id = ${id}::uuid
    `;

    return NextResponse.json({
      success: true,
      message: "Blueprint berhasil dihapus dari database.",
    });
  } catch (error: any) {
    console.error("[DELETE /api/blueprints/[id]] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus blueprint." },
      { status: 500 }
    );
  }
}
